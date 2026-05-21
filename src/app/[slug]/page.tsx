import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import BookingPageClient from "@/components/booking/BookingPageClient"
import type { Metadata } from "next"

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shop = await prisma.barbershop.findUnique({ where: { slug: params.slug } })
  if (!shop) return { title: "Barbearia não encontrada" }
  return {
    title:       `Agendar — ${shop.name}`,
    description: `Agende seu horário na ${shop.name}`,
  }
}

export default async function PublicBookingPage({ params }: Props) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug, active: true },
    include: {
      // Apenas barbeiros com role BARBER (não admins)
      barbers: {
        where:   { active: true, role: "BARBER" },
        select:  { id: true, name: true, avatarUrl: true, commissionPct: true },
        orderBy: { name: "asc" },
      },
      services:  { where: { active: true }, orderBy: { price: "asc" } },
      scheduleConfig: true,
      products:  {
        where:   { active: true, stockQty: { gt: 0 } },
        take:    1,
        orderBy: { salePrice: "asc" },
      },
    },
  })

  if (!barbershop) notFound()

  // Se não tiver barbeiros com role BARBER, mostra os admins como fallback
  const barbers = barbershop.barbers.length > 0
    ? barbershop.barbers
    : await prisma.barber.findMany({
        where:  { barbershopId: barbershop.id, active: true },
        select: { id: true, name: true, avatarUrl: true, commissionPct: true },
      })

  return (
    <BookingPageClient
      barbershop={{
        id:       barbershop.id,
        name:     barbershop.name,
        slug:     barbershop.slug,
        whatsapp: barbershop.whatsapp ?? undefined,
      }}
      services={barbershop.services.map(s => ({
        id:          s.id,
        name:        s.name,
        price:       Number(s.price),
        durationMin: s.durationMin,
        description: s.description ?? "",
      }))}
      barbers={barbers}
      orderBumpProduct={barbershop.products[0] ? {
        id:             barbershop.products[0].id,
        name:           barbershop.products[0].name,
        originalPrice:  Number(barbershop.products[0].salePrice),
        discountedPrice:Number(barbershop.products[0].salePrice) * 0.85,
        discountPct:    15,
        description:    "Produto especial com desconto exclusivo neste agendamento",
      } : undefined}
    />
  )
}
