import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const products = await prisma.product.findMany({
    where:{ barbershopId, active:true },
    include:{ stockAlerts:{ where:{ status:"OPEN" }, take:1 } },
    orderBy:{ name:"asc" },
  })
  return NextResponse.json({ data: products })
}

const createSchema = z.object({
  name:               z.string().min(2),
  salePrice:          z.number().positive(),
  costPrice:          z.number().nonnegative(),
  stockQty:           z.number().int().min(0),
  lowStockThreshold:  z.number().int().min(1).default(3),
  description:        z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error:parsed.error.flatten() }, { status:400 })

  const product = await prisma.product.create({ data:{ ...parsed.data, barbershopId } })
  return NextResponse.json({ data:product }, { status:201 })
}
