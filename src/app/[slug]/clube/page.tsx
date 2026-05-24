import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ClubePageClient from "@/components/booking/ClubePageClient"
import type { Metadata } from "next"

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await prisma.barbershop.findUnique({ where:{ slug:params.slug } })
  if (!shop) return { title:"Clube não encontrado" }
  return {
    title:       `Clube VIP — ${shop.name}`,
    description: `Assine o clube de assinaturas da ${shop.name} e garanta seu visual todo mês com serviços incluídos.`,
  }
}

export default async function ClubePage({ params }: Props) {
  const shop = await prisma.barbershop.findUnique({
    where:  { slug: params.slug, active: true },
    select: { id: true, name: true, logoUrl: true, whatsapp: true }
  })
  if (!shop) notFound()

  const plans = await prisma.$queryRawUnsafe(
    `SELECT * FROM subscription_plans WHERE barbershop_id = $1 AND active = true ORDER BY price ASC`,
    shop.id
  ).catch(() => []) as any[]

  const countRows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) as n FROM client_subscriptions WHERE barbershop_id = $1 AND status = 'ACTIVE'`,
    shop.id
  ).catch(() => [{ n: 0 }]) as any[]

  return (
    <ClubePageClient
      shop={shop}
      plans={plans}
      activeCount={Number(countRows[0]?.n ?? 0)}
      slug={params.slug}
    />
  )
}
