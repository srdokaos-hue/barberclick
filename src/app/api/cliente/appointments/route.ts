import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyClientToken } from "@/lib/client-auth"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("client-token")?.value
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const session = verifyClientToken(token)
  if (!session) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

  const appointments = await prisma.appointment.findMany({
    where:   { clientId: session.clientId },
    orderBy: { scheduledAt: "desc" },
    take:    20,
    include: {
      barber:   { select: { name: true, avatarUrl: true } },
      items:    { include: { service: { select: { name: true } } } },
      barbershop: { select: { name: true, slug: true } },
    },
  })

  return NextResponse.json({ data: appointments })
}

// Cancelar agendamento
export async function PATCH(req: NextRequest) {
  const token = req.cookies.get("client-token")?.value
  if (!token) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const session = verifyClientToken(token)
  if (!session) return NextResponse.json({ error: "Token inválido" }, { status: 401 })

  const { appointmentId } = await req.json()

  // Verifica se o agendamento pertence a este cliente
  const appt = await prisma.appointment.findFirst({
    where: { id: appointmentId, clientId: session.clientId, status: { in: ["PENDING","CONFIRMED"] } },
  })
  if (!appt) return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })

  // Só pode cancelar até 1h antes
  const hoursUntil = (new Date(appt.scheduledAt).getTime() - Date.now()) / 3_600_000
  if (hoursUntil < 1) return NextResponse.json({ error: "Não é possível cancelar com menos de 1h de antecedência" }, { status: 400 })

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: "CANCELLED" } })
  return NextResponse.json({ ok: true })
}
