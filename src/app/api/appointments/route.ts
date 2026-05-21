import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// GET /api/appointments?date=YYYY-MM-DD  ou  ?month=YYYY-MM
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })

  const { searchParams } = req.nextUrl
  const date  = searchParams.get("date")
  const month = searchParams.get("month")
  const barbershopId = (session.user as any).barbershopId

  const where: any = { barbershopId }
  if (date) {
    where.scheduledAt = { gte:new Date(`${date}T00:00:00`), lte:new Date(`${date}T23:59:59`) }
  } else if (month) {
    const [y,m] = month.split("-").map(Number)
    where.scheduledAt = { gte:new Date(y,m-1,1), lt:new Date(y,m,1) }
  }

  const appointments = await prisma.appointment.findMany({
    where, orderBy:{ scheduledAt:"asc" },
    include:{
      barber:{ select:{id:true,name:true,avatarUrl:true} },
      client:{ select:{id:true,name:true,phone:true} },
      items:{ include:{ service:true, product:true } },
    },
  })
  return NextResponse.json({ data: appointments })
}

// POST /api/appointments — criação pública pelo cliente
const createSchema = z.object({
  barberId:      z.string().uuid(),
  clientName:    z.string().min(2),
  clientPhone:   z.string().min(10),
  clientEmail:   z.string().email().optional(),
  serviceIds:    z.array(z.string().uuid()).min(1),
  scheduledAt:   z.string().datetime(),
  productIds:    z.array(z.string().uuid()).optional(),
  paymentMethod: z.enum(["PIX","CREDIT_CARD","DEBIT_CARD","CASH"]).default("PIX"),
  slug:          z.string().min(3),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:parsed.error.flatten() }, { status:400 })

  const { barberId,clientName,clientPhone,clientEmail,serviceIds,scheduledAt,productIds,paymentMethod,slug } = parsed.data

  const barbershop = await prisma.barbershop.findUnique({ where:{ slug } })
  if (!barbershop) return NextResponse.json({ error:"Barbearia não encontrada" }, { status:404 })

  const [services, products] = await Promise.all([
    prisma.service.findMany({ where:{ id:{in:serviceIds}, barbershopId:barbershop.id, active:true } }),
    productIds?.length ? prisma.product.findMany({ where:{ id:{in:productIds}, barbershopId:barbershop.id, active:true } }) : [],
  ])

  const BUMP_DISCOUNT = 15
  const svcTotal  = services.reduce((s,x) => s+Number(x.price),0)
  const prodTotal = (products as any[]).reduce((s,p) => s+Number(p.salePrice)*(1-BUMP_DISCOUNT/100),0)
  const totalMin  = services.reduce((s,x) => s+x.durationMin,0)
  const start     = new Date(scheduledAt)
  const endsAt    = new Date(start.getTime()+totalMin*60_000)

  const appointment = await prisma.$transaction(async (tx) => {
    const client = await tx.client.upsert({
      where:{ barbershopId_phone:{ barbershopId:barbershop.id, phone:clientPhone } } as any,
      update:{ name:clientName },
      create:{ barbershopId:barbershop.id, name:clientName, phone:clientPhone, email:clientEmail },
    })

    const appt = await tx.appointment.create({
      data:{
        barbershopId:barbershop.id, barberId, clientId:client.id,
        scheduledAt:start, endsAt, totalAmount:svcTotal+prodTotal,
        paymentMethod:paymentMethod as any, paymentStatus:"PENDING",
        orderBumpAccepted:(products as any[]).length>0,
        items:{
          create:[
            ...services.map(s=>({ serviceId:s.id,itemType:"SERVICE" as const,name:s.name,unitPrice:s.price,quantity:1,discountPct:0,subtotal:s.price })),
            ...(products as any[]).map(p=>({ productId:p.id,itemType:"PRODUCT" as const,name:p.name,unitPrice:p.salePrice,quantity:1,discountPct:BUMP_DISCOUNT,subtotal:Number(p.salePrice)*(1-BUMP_DISCOUNT/100),isOrderBump:true })),
          ],
        },
      },
    })

    // Baixa de estoque
    for (const p of products as any[]) {
      const upd = await tx.product.update({ where:{id:p.id}, data:{stockQty:{decrement:1}} })
      if (upd.stockQty<=upd.lowStockThreshold) {
        await tx.stockAlert.create({ data:{productId:p.id,currentQty:upd.stockQty,threshold:upd.lowStockThreshold} })
      }
    }

    await tx.client.update({ where:{id:client.id}, data:{lastVisitAt:start} })
    return appt
  })

  return NextResponse.json({ data:appointment }, { status:201 })
}
