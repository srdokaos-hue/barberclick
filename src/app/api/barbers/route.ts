import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  let barbershopId: string

  if (slug) {
    const shop = await prisma.barbershop.findUnique({ where:{ slug } })
    if (!shop) return NextResponse.json({ error:"Não encontrada" }, { status:404 })
    barbershopId = shop.id
  } else {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
    barbershopId = (session.user as any).barbershopId
  }

  const barbers = await prisma.barber.findMany({
    where:{ barbershopId, active:true },
    select:{ id:true, name:true, avatarUrl:true, commissionPct:true, role:true, active:true, email:true },
    orderBy:{ name:"asc" },
  })
  return NextResponse.json({ data:barbers })
}

const barberSchema = z.object({
  name:          z.string().min(2),
  email:         z.string().email(),
  password:      z.string().min(8).optional(),
  commissionPct: z.number().min(0).max(100).default(50),
  role:          z.enum(["ADMIN","BARBER"]).default("BARBER"),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const u = session.user as any
  if (u.role !== "ADMIN") return NextResponse.json({ error:"Apenas admins podem adicionar barbeiros" }, { status:403 })
  const barbershopId = u.barbershopId

  const parsed = barberSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error:parsed.error.flatten() }, { status:400 })

  const { password, ...rest } = parsed.data
  const passwordHash = await bcrypt.hash(password ?? "mudar123", 12)

  const barber = await prisma.barber.create({
    data:{ ...rest, passwordHash, barbershopId },
  })
  return NextResponse.json({ data:{ id:barber.id, name:barber.name, email:barber.email } }, { status:201 })
}
