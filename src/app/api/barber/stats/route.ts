import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)
  if(!session?.user?.id) return NextResponse.json({ error:"Unauthorized" }, { status:401 })

  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endToday   = new Date(startToday.getTime() + 86400000)

  const [barber, apptMonth, apptToday] = await Promise.all([
    prisma.barber.findUnique({ where:{ id:session.user.id }, select:{ name:true, commissionPct:true, goals:true } as any }),
    prisma.appointment.findMany({ where:{ barberId:session.user.id, status:"DONE", scheduledAt:{ gte:startMonth } }, select:{ totalAmount:true } }),
    prisma.appointment.findMany({ where:{ barberId:session.user.id, status:{ not:"CANCELLED" }, scheduledAt:{ gte:startToday, lt:endToday } },
      include:{ client:{ select:{ name:true } }, items:{ select:{ name:true } } }, orderBy:{ scheduledAt:"asc" } }),
  ])

  const totalMonth = apptMonth.reduce((s,a)=>s+Number(a.totalAmount),0)
  const commission = totalMonth * (Number((barber as any)?.commissionPct??0)/100)
  const cutsMonth  = apptMonth.length
  const goals      = JSON.parse((barber as any)?.goals||"[]")

  return NextResponse.json({ data:{ barberId:session.user.id, name:(barber as any)?.name, commissionPct:Number((barber as any)?.commissionPct??0), totalMonth, commission, cutsMonth, goals, todayAppts:apptToday } })
}
