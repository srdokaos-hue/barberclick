// ============================================================
// BarberClick SaaS — API Route de Cadastro
// app/api/auth/signup/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

// ─── SCHEMA DE VALIDAÇÃO ──────────────────────────────────────

const signupSchema = z.object({
  barbershopName: z
    .string()
    .min(2, "Nome da barbearia muito curto")
    .max(100),

  slug: z
    .string()
    .min(3, "Slug deve ter pelo menos 3 caracteres")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug: apenas letras minúsculas, números e hífens"),

  ownerName: z
    .string()
    .min(2, "Nome do responsável obrigatório"),

  email: z
    .string()
    .email("E-mail inválido")
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(72),

  plan: z
    .enum(["STARTER", "PRO", "ELITE"])
    .default("STARTER"),

  whatsapp: z
    .string()
    .optional(),
})

// ─── HANDLER ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // 1. Parse e valida o corpo da requisição
    const body   = await req.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { barbershopName, slug, ownerName, email, password, plan, whatsapp } = parsed.data

    // 2. Verifica unicidade do slug
    const slugExists = await prisma.barbershop.findUnique({ where: { slug } })
    if (slugExists) {
      return NextResponse.json(
        { error: "Este slug já está em uso. Escolha outro nome para a URL da sua barbearia." },
        { status: 409 }
      )
    }

    // 3. Verifica unicidade do e-mail
    const emailExists = await prisma.barber.findUnique({ where: { email } })
    if (emailExists) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado. Faça login ou use outro e-mail." },
        { status: 409 }
      )
    }

    // 4. Hash da senha (custo 12 = ~300ms, seguro para bcrypt)
    const passwordHash = await bcrypt.hash(password, 12)

    // 5. Trial de 14 dias
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)

    // 6. Cria tudo em uma única transação atômica
    const { barbershop, barber } = await prisma.$transaction(async (tx) => {

      // 6a. Cria a barbearia (tenant)
      const barbershop = await tx.barbershop.create({
        data: {
          name:        barbershopName,
          slug,
          whatsapp:    whatsapp ?? null,
          plan:        plan as "STARTER" | "PRO" | "ELITE",
          active:      true,
          trialEndsAt,
        },
      })

      // 6b. Cria o barbeiro admin (dono da barbearia)
      const barber = await tx.barber.create({
        data: {
          barbershopId:  barbershop.id,
          name:          ownerName,
          email,
          passwordHash,
          role:          "ADMIN",
          commissionPct: 0, // dono não recebe comissão por padrão
          active:        true,
        },
      })

      // 6c. Cria configuração de agenda com defaults sensatos
      await tx.scheduleConfig.create({
        data: {
          barbershopId:    barbershop.id,
          workDays:        [1, 2, 3, 4, 5, 6], // segunda → sábado
          openTime:        "09:00",
          closeTime:       "19:00",
          lunchStart:      null,
          lunchEnd:        null,
          slotDurationMin: 30,
          maxAdvanceDays:  30,
        },
      })

      return { barbershop, barber }
    })

    // 7. Resposta de sucesso (sem expor passwordHash)
    return NextResponse.json(
      {
        data: {
          barbershopId: barbershop.id,
          barberId:     barber.id,
          slug:         barbershop.slug,
          email:        barber.email,
          plan:         barbershop.plan,
          trialEndsAt:  barbershop.trialEndsAt,
          trialDaysLeft: 14,
          publicUrl:    `https://barberclick.app/${barbershop.slug}`,
          message:      "Conta criada com sucesso! Acesse o painel para configurar sua barbearia.",
        },
      },
      { status: 201 }
    )

  } catch (err: unknown) {
    console.error("[POST /api/auth/signup]", err)

    // Erro de constraint do Prisma (slug ou email duplicado — race condition)
    if (
      err instanceof Error &&
      err.message.includes("Unique constraint failed")
    ) {
      return NextResponse.json(
        { error: "Slug ou e-mail já em uso. Tente novamente." },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erro interno do servidor. Tente novamente em alguns instantes." },
      { status: 500 }
    )
  }
}

// ─── APENAS GET: info do plano para página de preços ──────────

export async function GET() {
  return NextResponse.json({
    plans: [
      { id: "STARTER", name: "Starter",  price: 97,  trialDays: 14 },
      { id: "PRO",     name: "Pro",      price: 197, trialDays: 14 },
      { id: "ELITE",   name: "Elite",    price: 297, trialDays: 14 },
    ],
  })
}

// ============================================================
// INTEGRAÇÃO COM NEXTAUTH (app/api/auth/[...nextauth]/route.ts)
// ============================================================

/*
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const barber = await prisma.barber.findUnique({
          where:   { email: credentials.email },
          include: { barbershop: true },
        })

        if (!barber || !barber.active) return null
        if (!barber.barbershop.active) return null

        const valid = await bcrypt.compare(credentials.password, barber.passwordHash)
        if (!valid) return null

        return {
          id:           barber.id,
          name:         barber.name,
          email:        barber.email,
          role:         barber.role,
          barbershopId: barber.barbershopId,
          barbershopSlug: barber.barbershop.slug,
          plan:         barber.barbershop.plan,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id           = user.id
        token.role         = user.role
        token.barbershopId = user.barbershopId
        token.barbershopSlug = user.barbershopSlug
        token.plan         = user.plan
      }
      return token
    },
    async session({ session, token }) {
      session.user.id             = token.id as string
      session.user.role           = token.role as string
      session.user.barbershopId   = token.barbershopId as string
      session.user.barbershopSlug = token.barbershopSlug as string
      session.user.plan           = token.plan as string
      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 dias
  },
})

export { handler as GET, handler as POST }
*/

// ─── MIDDLEWARE DE PROTEÇÃO DE ROTAS ──────────────────────────
// middleware.ts (raiz do projeto)

/*
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Rota do painel admin: requer barbeiro ativo
    if (pathname.startsWith("/(admin)") && !token) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Rota de API protegida: requer barbershopId no token
    if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
      const barbershopId = token?.barbershopId
      if (!barbershopId) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Rotas públicas: página do cliente
        const publicRoutes = ["/api/slots", "/api/appointments"]
        if (publicRoutes.some(r => req.nextUrl.pathname.startsWith(r))) return true
        // Demais rotas de API exigem autenticação
        if (req.nextUrl.pathname.startsWith("/api/")) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/(admin)/:path*",
    "/api/((?!auth|slots|webhooks).)*",
  ],
}
*/
