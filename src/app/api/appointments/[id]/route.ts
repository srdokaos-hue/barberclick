import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patchSchema = z.object({
  status:        z.enum(["CONFIRMED","IN_PROGRESS","DONE","CANCELLED","NO_SHOW"]).optional(),
  paymentStatus: z.enum(["PAID","REFUNDED","FAILED"]).optional(),
  notes:         z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params:{ id:string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error:parsed.error.flatten() }, { status:400 })

  const barbershopId = (session.user as any).barbershopId

  const appt = await prisma.appointment.findFirst({
    where:{ id:params.id, barbershopId },
    include:{ barber:true, client:true },
  })
  if (!appt) return NextResponse.json({ error:"Não encontrado" }, { status:404 })

  const updated = await prisma.$transaction(async (tx) => {
    const a = await tx.appointment.update({
      where:{ id:params.id },
      data:{ ...parsed.data },
      include:{ items:{ include:{ product:{ select:{ costPrice:true } } } } },
    })

    // Ao concluir: gera transação financeira e agenda lembrete
    if (parsed.data.status === "DONE" && parsed.data.paymentStatus === "PAID") {
      const prodCost   = a.items.filter(i=>i.itemType==="PRODUCT"&&i.product)
        .reduce((s,i) => s+Number(i.product!.costPrice)*i.quantity, 0)
      const commission = Number(a.totalAmount)*(Number(appt.barber.commissionPct)/100)

      await tx.financialTransaction.upsert({
        where:  { appointmentId:a.id },
        update: {},
        create: {
          barbershopId: a.barbershopId,
          appointmentId:a.id,
          type:         "INCOME",
          grossAmount:  a.totalAmount,
          costAmount:   prodCost+commission,
          netAmount:    Number(a.totalAmount)-prodCost-commission,
          category:     "servico",
          barberId:     a.barberId,
          commissionAmt:commission,
        },
      })

      await tx.client.update({
        where:{ id:a.clientId },
        data:{ lastVisitAt:a.scheduledAt },
      })

      // Agenda lembrete de retorno
      const client = await tx.client.findUnique({ where:{ id:a.clientId } })
      if (client) {
        const scheduled = new Date(a.scheduledAt.getTime()+client.returnIntervalDays*24*60*60*1000)
        await tx.returnReminder.upsert({
          where:  { appointmentId:a.id },
          update: {},
          create: { clientId:a.clientId, appointmentId:a.id, daysInterval:client.returnIntervalDays, scheduledFor:scheduled },
        })
      }
    }
    return a
  })

  return NextResponse.json({ data:updated })
}
