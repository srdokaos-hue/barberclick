import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if(!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" }, {status:401})

  const { clientName, clientPhone, barberId, serviceIds=[], productIds=[], paymentMethod="PIX" } = await req.json()
  if(!barberId) return NextResponse.json({ error:"Barbeiro obrigatório" }, {status:400})

  const bid = session.user.barbershopId

  // Busca ou cria cliente
  let clientId: string|null = null
  if(clientName?.trim()) {
    const phone = (clientPhone||"").replace(/\D/g,"") || "0000000000"
    let client = await prisma.client.findFirst({ where:{ barbershopId:bid, phone } })
    if(!client) client = await prisma.client.create({
      data:{ barbershopId:bid, name:clientName.trim(), phone, returnIntervalDays:25 }
    })
    clientId = client.id
  }

  const [services, products] = await Promise.all([
    serviceIds.length ? prisma.service.findMany({ where:{ id:{ in:serviceIds } } }) : Promise.resolve([]),
    productIds.length ? prisma.product.findMany({ where:{ id:{ in:productIds } } }) : Promise.resolve([]),
  ])

  const total = services.reduce((s:number,sv:any)=>s+Number(sv.price),0) +
                products.reduce((s:number,p:any) =>s+Number(p.salePrice),0)

  const now = new Date()
  const appt = await prisma.appointment.create({
    data:{
      barbershopId:  bid,
      barberId,
      clientId,
      scheduledAt:   now,
      endsAt:        new Date(now.getTime()+30*60000),
      status:        "DONE",
      paymentStatus: "PAID",
      paymentMethod: paymentMethod as any,
      totalAmount:   total,
      items: { create: [
        ...services.map((sv:any)=>({ name:sv.name, unitPrice:sv.price,     qty:1, serviceId:sv.id })),
        ...products.map((p:any) =>({ name:p.name,  unitPrice:p.salePrice,  qty:1, productId:p.id  })),
      ]},
    },
  })

  return NextResponse.json({ data: appt })
}
