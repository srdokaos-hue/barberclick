import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  const { email, password, slug } = await req.json()
  if (!email||!password||!slug) return NextResponse.json({ error:"Dados inválidos" }, { status:400 })
  const shop = await prisma.barbershop.findUnique({ where:{ slug } })
  if (!shop) return NextResponse.json({ error:"Barbearia não encontrada" }, { status:404 })
  const client = await prisma.client.findFirst({ where:{ barbershopId:shop.id, email } }) as any
  if (!client?.passwordHash) return NextResponse.json({ error:"E-mail ou senha incorretos" }, { status:401 })
  const valid = await bcrypt.compare(password, client.passwordHash)
  if (!valid) return NextResponse.json({ error:"E-mail ou senha incorretos" }, { status:401 })
  return NextResponse.json({ data:{ id:client.id, name:client.name, phone:client.phone, email:client.email, slug } })
}
