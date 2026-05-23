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

  const [barber, apptMonth, apptToday, nextAppt] = await Promise.all([
    prisma.barber.findUnique({ where:{ id:session.user.id }, select:{ name:true, commissionPct:true } }),
    prisma.appointment.findMany({
      where:{ barberId:session.user.id, status:"DONE", scheduledAt:{ gte:startMonth } },
      select:{ totalAmount:true },
    }),
    prisma.appointment.findMany({
      where:{ barberId:session.user.id, status:{ not:"CANCELLED" }, scheduledAt:{ gte:startToday, lt:endToday } },
      select:{ id:true, scheduledAt:true, status:true, totalAmount:true,
        client:{ select:{ name:true } },
        items:{ select:{ name:true } } },
      orderBy:{ scheduledAt:"asc" },
    }),
    prisma.appointment.findFirst({
      where:{ barberId:session.user.id, status:{ in:["PENDING","CONFIRMED"] }, scheduledAt:{ gte:new Date() } },
      orderBy:{ scheduledAt:"asc" },
      select:{ scheduledAt:true, client:{ select:{ name:true } }, items:{ select:{ name:true } } },
    }),
  ])

  const totalMonth   = apptMonth.reduce((s,a)=>s+Number(a.totalAmount),0)
  const commission   = totalMonth * (Number(barber?.commissionPct??0)/100)
  const cutsMonth    = apptMonth.length

  return NextResponse.json({
    data:{
      name:           barber?.name,
      commissionPct:  Number(barber?.commissionPct??0),
      totalMonth,
      commission,
      cutsMonth,
      todayAppts:     apptToday,
      nextAppt,
    }
  })
}
