import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const shop = await prisma.barbershop.findUnique({
    where: { slug: params.slug, active: true },
    select: { id: true, name: true, logoUrl: true, whatsapp: true }
  })
  if (!shop) return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })

  const plans = await prisma.$queryRawUnsafe(
    `SELECT * FROM subscription_plans WHERE barbershop_id = $1 AND active = true ORDER BY price ASC`,
    shop.id
  ).catch(() => [])

  const count = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as n FROM client_subscriptions WHERE barbershop_id = $1 AND status = 'ACTIVE'`,
    shop.id
  ).catch(() => [{ n: 0 }]) as any[]

  return NextResponse.json({
    data: { shop, plans, activeCount: Number(count[0]?.n ?? 0) }
  })
}
