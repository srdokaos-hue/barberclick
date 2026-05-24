import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ensureTables } from "@/lib/subscriptionDb"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  await ensureTables()
  const status = req.nextUrl.searchParams.get("status")
  const where  = status ? `AND cs.status = '${status}'` : ""
  const subs = await prisma.$queryRawUnsafe(`
    SELECT cs.*,
      (SELECT COUNT(*) FROM subscription_usage su
       WHERE su.subscription_id = cs.id
       AND su.used_at >= date_trunc('month', NOW())) as uses_this_month,
      (SELECT json_agg(json_build_object('service_name',su.service_name,'used_at',su.used_at))
       FROM subscription_usage su
       WHERE su.subscription_id = cs.id
       AND su.used_at >= date_trunc('month', NOW())) as usage_detail
    FROM client_subscriptions cs
    WHERE cs.barbershop_id = $1 ${where}
    ORDER BY cs.created_at DESC
  `, session.user.barbershopId) as any[]
  return NextResponse.json({ data: subs })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  await ensureTables()
  const { clientName, clientPhone, planId, planName, price, services, paymentMethod, notes, startDate } = await req.json()
  const start   = startDate ? new Date(startDate) : new Date()
  const renewal = new Date(start)
  renewal.setMonth(renewal.getMonth() + 1)
  await prisma.$executeRawUnsafe(`
    INSERT INTO client_subscriptions
      (barbershop_id,client_name,client_phone,plan_id,plan_name,price,services,payment_method,notes,start_date,renewal_date)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  `, session.user.barbershopId, clientName, clientPhone, planId, planName, price,
     JSON.stringify(services??[]), paymentMethod||"PIX", notes||"",
     start.toISOString().slice(0,10), renewal.toISOString().slice(0,10))
  return NextResponse.json({ ok: true })
}
