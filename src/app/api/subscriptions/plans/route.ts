import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureTables, seedPlans } from "@/lib/subscriptionDb"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  await ensureTables()
  await seedPlans(session.user.barbershopId)
  const plans = await prisma.$queryRawUnsafe(
    `SELECT * FROM subscription_plans WHERE barbershop_id = $1 AND active = true ORDER BY price ASC`,
    session.user.barbershopId
  )
  return NextResponse.json({ data: plans })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  await ensureTables()
  const { name, price, services } = await req.json()
  await prisma.$executeRawUnsafe(
    `INSERT INTO subscription_plans (barbershop_id, name, price, services)
     VALUES ($1, $2, $3, $4)`,
    session.user.barbershopId, name, price, JSON.stringify(services??[])
  )
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  const { id, name, price, services, active } = await req.json()
  await prisma.$executeRawUnsafe(
    `UPDATE subscription_plans SET name=$2, price=$3, services=$4, active=$5
     WHERE id=$1 AND barbershop_id=$6`,
    id, name, price, JSON.stringify(services??[]), active??true, session.user.barbershopId
  )
  return NextResponse.json({ ok: true })
}
