import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if(!session?.user?.id) return NextResponse.json({ error:"Unauthorized" }, { status:401 })

  const date = req.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0,10)
  const start = new Date(date+"T00:00:00")
  const end   = new Date(date+"T23:59:59")

  const appointments = await prisma.appointment.findMany({
    where:{ barberId:session.user.id, scheduledAt:{ gte:start, lte:end } },
    include:{ client:{ select:{ name:true, phone:true } }, items:{ select:{ name:true } } },
    orderBy:{ scheduledAt:"asc" },
  })

  return NextResponse.json({ data: appointments })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if(!session?.user?.id) return NextResponse.json({ error:"Unauthorized" }, { status:401 })
  const { appointmentId, status } = await req.json()
  // Barbeiro só pode atualizar agendamentos dele próprio
  const appt = await prisma.appointment.findFirst({ where:{ id:appointmentId, barberId:session.user.id } })
  if(!appt) return NextResponse.json({ error:"Não encontrado" }, { status:404 })
  const updated = await prisma.appointment.update({ where:{ id:appointmentId }, data:{ status } })
  return NextResponse.json({ data: updated })
}
