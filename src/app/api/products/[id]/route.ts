import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const patchSchema = z.object({
  name:              z.string().optional(),
  salePrice:         z.number().optional(),
  costPrice:         z.number().optional(),
  stockQty:          z.number().int().optional(),
  lowStockThreshold: z.number().int().optional(),
  active:            z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params:{ id:string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const parsed = patchSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error:parsed.error.flatten() }, { status:400 })

  const product = await prisma.$transaction(async (tx) => {
    const p = await tx.product.update({
      where:{ id:params.id, barbershopId },
      data: parsed.data,
    })
    if (p.stockQty <= p.lowStockThreshold) {
      await tx.stockAlert.create({ data:{ productId:p.id, currentQty:p.stockQty, threshold:p.lowStockThreshold } })
    }
    return p
  })
  return NextResponse.json({ data:product })
}

export async function DELETE(req: NextRequest, { params }: { params:{ id:string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  await prisma.product.update({ where:{ id:params.id }, data:{ active:false } })
  return NextResponse.json({ ok:true })
}
