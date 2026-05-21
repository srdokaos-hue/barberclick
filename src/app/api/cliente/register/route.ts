import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  name: z.string().min(2), phone: z.string().min(8),
  email: z.string().email(), password: z.string().min(6), slug: z.string(),
})

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error:"Dados inválidos" }, { status:400 })
  const { name, phone, email, password, slug } = parsed.data
  const shop = await prisma.barbershop.findUnique({ where:{ slug } })
  if (!shop) return NextResponse.json({ error:"Barbearia não encontrada" }, { status:404 })
  const ph = phone.replace(/\D/g,"")
  const passwordHash = await bcrypt.hash(password, 10)
  const existing = await prisma.client.findFirst({ where:{ barbershopId:shop.id, phone:ph } })
  const client = existing
    ? await prisma.client.update({ where:{ id:existing.id }, data:{ email, passwordHash } as any })
    : await prisma.client.create({ data:{ barbershopId:shop.id, name, phone:ph, email, passwordHash, returnIntervalDays:25 } as any })
  return NextResponse.json({ data:{ id:client.id, name:client.name, phone:client.phone, email:client.email, slug } }, { status:201 })
}
