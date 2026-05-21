import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
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
          where:   { email: credentials.email.toLowerCase() },
          include: { barbershop: { select: { id:true, slug:true, plan:true, active:true, trialEndsAt:true } } },
        })

        if (!barber || !barber.active) return null
        if (!barber.barbershop.active) return null

        const valid = await bcrypt.compare(credentials.password, barber.passwordHash)
        if (!valid) return null

        // Verifica se trial expirou (plano STARTER sem pagamento)
        if (barber.barbershop.trialEndsAt && new Date() > barber.barbershop.trialEndsAt) {
          // Permite acesso mas frontend mostrará aviso de trial expirado
        }

        return {
          id:            barber.id,
          name:          barber.name,
          email:         barber.email,
          image:         barber.avatarUrl ?? null,
          role:          barber.role,
          barbershopId:  barber.barbershopId,
          barbershopSlug:barber.barbershop.slug,
          plan:          barber.barbershop.plan,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id            = user.id
        token.role          = (user as any).role
        token.barbershopId  = (user as any).barbershopId
        token.barbershopSlug= (user as any).barbershopSlug
        token.plan          = (user as any).plan
      }
      return token
    },
    async session({ session, token }) {
      const u = session.user as any
      u.id            = token.id as string
      u.role          = token.role as string
      u.barbershopId  = token.barbershopId as string
      u.barbershopSlug= token.barbershopSlug as string
      u.plan          = token.plan as string
      return session
    },
  },

  pages:   { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret:  process.env.NEXTAUTH_SECRET,
}
