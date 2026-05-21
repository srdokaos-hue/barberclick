import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const { searchParams } = req.nextUrl
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0,7)
  const [y,m] = month.split("-").map(Number)
  const start = new Date(y,m-1,1)
  const end   = new Date(y,m,1)

  const appts = await prisma.appointment.findMany({
    where:{ barbershopId, scheduledAt:{ gte:start,lt:end }, paymentStatus:"PAID", status:"DONE" },
    include:{
      barber:{ select:{ id:true,name:true,commissionPct:true } },
      items:{ include:{ product:{ select:{ costPrice:true } } } },
    },
  })

  let gross=0, cost=0
  const byBarber: Record<string,any> = {}

  for (const a of appts) {
    const rev = Number(a.totalAmount)
    gross += rev

    const prodCost   = a.items.filter(i=>i.itemType==="PRODUCT"&&i.product).reduce((s,i)=>s+Number(i.product!.costPrice)*i.quantity,0)
    const commission = rev*(Number(a.barber.commissionPct)/100)
    cost += prodCost+commission

    const bid = a.barber.id
    if (!byBarber[bid]) byBarber[bid] = { id:bid,name:a.barber.name,revenue:0,commission:0,count:0,commissionPct:Number(a.barber.commissionPct) }
    byBarber[bid].revenue    += rev
    byBarber[bid].commission += commission
    byBarber[bid].count      += 1
  }

  const net = gross-cost
  return NextResponse.json({
    data:{
      period:   month,
      gross:    gross.toFixed(2),
      cost:     cost.toFixed(2),
      net:      net.toFixed(2),
      margin:   gross>0?(net/gross*100).toFixed(1):"0",
      appointments:appts.length,
      avgTicket:appts.length>0?(gross/appts.length).toFixed(2):"0",
      byBarber: Object.values(byBarber),
    },
  })
}
