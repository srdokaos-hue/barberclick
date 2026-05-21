import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const clients = await prisma.client.findMany({
    where:{ barbershopId },
    include:{ _count:{ select:{ appointments:true } } },
    orderBy:{ lastVisitAt:"desc" },
  })

  const enriched = clients.map(c => ({
    ...c,
    daysSinceVisit: c.lastVisitAt
      ? Math.floor((Date.now()-new Date(c.lastVisitAt).getTime()) / (24*60*60*1000))
      : null,
    isAtRisk: c.lastVisitAt
      ? Math.floor((Date.now()-new Date(c.lastVisitAt).getTime()) / (24*60*60*1000)) > c.returnIntervalDays
      : false,
    totalVisits: c._count.appointments,
  }))

  return NextResponse.json({ data: enriched })
}
