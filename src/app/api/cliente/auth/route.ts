import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { signClientToken } from "@/lib/client-auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  type:     z.enum(["login","register"]),
  phone:    z.string().min(8),
  password: z.string().min(6),
  name:     z.string().optional(),
  barbershopSlug: z.string(),
})

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

  const { type, phone, password, name, barbershopSlug } = parsed.data

  const barbershop = await prisma.barbershop.findUnique({ where: { slug: barbershopSlug } })
  if (!barbershop) return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })

  // Busca cliente pelo telefone nesta barbearia
  const phoneClean = phone.replace(/\D/g, "")
  const client = await prisma.client.findFirst({
    where: {
      barbershopId: barbershop.id,
      OR: [{ phone: phoneClean }, { phone: phone }],
    },
  })

  if (type === "register") {
    const hash = await bcrypt.hash(password, 10)

    if (client) {
      // Já tem cadastro — atualiza a senha
      await prisma.client.update({
        where: { id: client.id },
        data:  { passwordHash: hash, name: name ?? client.name } as any,
      })
      const token = signClientToken({ clientId: client.id, name: client.name, phone: client.phone, barbershopId: barbershop.id, slug: barbershopSlug })
      const res = NextResponse.json({ ok: true, name: client.name })
      res.cookies.set("client-token", token, { httpOnly: true, maxAge: 60*60*24*30, path: "/" })
      return res
    } else {
      // Cria cliente novo com senha
      const newClient = await prisma.client.create({
        data: { barbershopId: barbershop.id, name: name ?? "Cliente", phone: phoneClean, passwordHash: hash, returnIntervalDays: 25 } as any,
      })
      const token = signClientToken({ clientId: newClient.id, name: newClient.name, phone: newClient.phone, barbershopId: barbershop.id, slug: barbershopSlug })
      const res = NextResponse.json({ ok: true, name: newClient.name })
      res.cookies.set("client-token", token, { httpOnly: true, maxAge: 60*60*24*30, path: "/" })
      return res
    }
  }

  if (type === "login") {
    if (!client) return NextResponse.json({ error: "Telefone não cadastrado nesta barbearia" }, { status: 401 })
    const hash = (client as any).passwordHash
    if (!hash) return NextResponse.json({ error: "Conta não ativada. Faça um agendamento primeiro." }, { status: 401 })
    const valid = await bcrypt.compare(password, hash)
    if (!valid) return NextResponse.json({ error: "Senha incorreta" }, { status: 401 })

    const token = signClientToken({ clientId: client.id, name: client.name, phone: client.phone, barbershopId: barbershop.id, slug: barbershopSlug })
    const res = NextResponse.json({ ok: true, name: client.name })
    res.cookies.set("client-token", token, { httpOnly: true, maxAge: 60*60*24*30, path: "/" })
    return res
  }

  return NextResponse.json({ error: "Tipo inválido" }, { status: 400 })
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete("client-token")
  return res
}
