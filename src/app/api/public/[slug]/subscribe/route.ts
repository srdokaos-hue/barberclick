import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const shop = await prisma.barbershop.findUnique({
    where: { slug: params.slug, active: true },
    select: { id: true, whatsapp: true }
  })
  if (!shop) return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })

  const { clientName, clientPhone, planId, planName, price, services } = await req.json()
  if (!clientName || !clientPhone || !planId) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  // Garante que a tabela existe
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS client_subscriptions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      barbershop_id TEXT NOT NULL, client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL, plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL, price NUMERIC(10,2) NOT NULL,
      services TEXT NOT NULL DEFAULT '[]', status TEXT NOT NULL DEFAULT 'PENDING',
      start_date DATE, renewal_date DATE,
      payment_method TEXT NOT NULL DEFAULT 'PIX',
      notes TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `).catch(() => {})

  const start   = new Date()
  const renewal = new Date(); renewal.setMonth(renewal.getMonth() + 1)

  await prisma.$executeRawUnsafe(`
    INSERT INTO client_subscriptions
      (barbershop_id,client_name,client_phone,plan_id,plan_name,price,services,payment_method,start_date,renewal_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7,'PIX',$8,$9)
  `, shop.id, clientName, clientPhone, planId, planName, price,
     JSON.stringify(services ?? []),
     start.toISOString().slice(0,10), renewal.toISOString().slice(0,10))

  return NextResponse.json({ ok: true, whatsapp: shop.whatsapp })
}
