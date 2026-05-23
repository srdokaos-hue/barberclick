import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" }, { status:401 })
  const barbershop = await prisma.barbershop.findUnique({
    where:   { id: session.user.barbershopId },
    include: { scheduleConfig: true },
  })
  return NextResponse.json({ data: { barbershop } })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" }, { status:401 })
  const body = await req.json()
  const data: Record<string,any> = {}
  if (body.name     !== undefined) data.name     = body.name
  if (body.slug     !== undefined) data.slug     = body.slug
  if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp
  if (body.logoUrl  !== undefined) data.logoUrl  = body.logoUrl
  if (body.address  !== undefined) data.address  = body.address
  const updated = await prisma.barbershop.update({ where:{ id: session.user.barbershopId }, data })
  return NextResponse.json({ data: { barbershop: updated } })
}
