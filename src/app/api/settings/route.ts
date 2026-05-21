import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const [barbershop, config] = await Promise.all([
    prisma.barbershop.findUnique({ where:{ id:barbershopId } }),
    prisma.scheduleConfig.findUnique({ where:{ barbershopId } }),
  ])
  return NextResponse.json({ data:{ barbershop, config } })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const body = await req.json()
  const { barbershop: shopData, config: configData } = body

  await Promise.all([
    shopData  ? prisma.barbershop.update({ where:{ id:barbershopId }, data:shopData }) : null,
    configData? prisma.scheduleConfig.upsert({ where:{ barbershopId }, update:configData, create:{ barbershopId,...configData } }) : null,
  ])

  return NextResponse.json({ ok:true })
}
