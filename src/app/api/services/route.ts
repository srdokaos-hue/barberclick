import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")
  let barbershopId: string

  if (slug) {
    const shop = await prisma.barbershop.findUnique({ where:{ slug } })
    if (!shop) return NextResponse.json({ error:"Não encontrada" }, { status:404 })
    barbershopId = shop.id
  } else {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
    barbershopId = (session.user as any).barbershopId
  }

  const services = await prisma.service.findMany({
    where:{ barbershopId, active:true }, orderBy:{ price:"asc" },
  })
  return NextResponse.json({ data:services })
}

const svcSchema = z.object({
  name:        z.string().min(2),
  price:       z.number().positive(),
  durationMin: z.number().int().min(15),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const parsed = svcSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error:parsed.error.flatten() }, { status:400 })

  const svc = await prisma.service.create({ data:{ ...parsed.data, barbershopId } })
  return NextResponse.json({ data:svc }, { status:201 })
}
