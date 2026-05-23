import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" }, { status:401 })

  const now        = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [barber, apptMonth] = await Promise.all([
    prisma.barber.findUnique({ where: { id: params.id }, select: { commissionPct: true } }),
    prisma.appointment.findMany({
      where:  { barberId: params.id, status: "DONE", scheduledAt: { gte: startMonth } },
      select: { totalAmount: true },
    }),
  ])

  // Busca metas da tabela barber_goals
  let goals: any[] = []
  try {
    const rows = await prisma.$queryRaw<{goals:string}[]>`
      SELECT goals FROM barber_goals WHERE barber_id = ${params.id}
    `
    goals = rows.length ? JSON.parse(rows[0].goals) : []
  } catch {}

  const totalMonth = apptMonth.reduce((s,a) => s + Number(a.totalAmount), 0)
  const commission = totalMonth * (Number(barber?.commissionPct ?? 0) / 100)
  const cutsMonth  = apptMonth.length

  return NextResponse.json({ data: { totalMonth, commission, cutsMonth, goals } })
}
