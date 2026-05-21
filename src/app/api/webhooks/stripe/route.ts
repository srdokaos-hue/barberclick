import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Stripe envia eventos via webhook para confirmar pagamentos
export async function POST(req: NextRequest) {
  const sig  = req.headers.get("stripe-signature") ?? ""
  const body = await req.text()

  let event: any
  try {
    // Em produção, verificar assinatura: stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    event = JSON.parse(body)
  } catch (err) {
    return NextResponse.json({ error:"Webhook inválido" }, { status:400 })
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object
      const appointmentId = pi.metadata?.appointmentId
      if (appointmentId) {
        await prisma.appointment.updateMany({
          where:{ id:appointmentId },
          data: { paymentStatus:"PAID", paymentRef:pi.id },
        })
      }
      break
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object
      const appointmentId = pi.metadata?.appointmentId
      if (appointmentId) {
        await prisma.appointment.updateMany({
          where:{ id:appointmentId },
          data: { paymentStatus:"FAILED" },
        })
      }
      break
    }
    case "customer.subscription.deleted": {
      const sub  = event.data.object
      const slug = sub.metadata?.barbershopSlug
      if (slug) {
        await prisma.barbershop.update({ where:{ slug }, data:{ active:false } })
      }
      break
    }
  }

  return NextResponse.json({ received:true })
}
