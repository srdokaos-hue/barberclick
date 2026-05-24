import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  const { serviceName } = await req.json()

  // Verifica se a assinatura é desta barbearia e está ativa
  const subs = await prisma.$queryRawUnsafe(
    `SELECT id, services FROM client_subscriptions WHERE id=$1 AND barbershop_id=$2 AND status='ACTIVE'`,
    params.id, session.user.barbershopId
  ) as any[]
  if (!subs.length) return NextResponse.json({ error:"Assinatura não encontrada ou inativa" },{status:404})

  const sub       = subs[0]
  const services  = JSON.parse(sub.services) as {name:string;quota:number}[]
  const svc       = services.find(s=>s.name===serviceName)
  if (!svc) return NextResponse.json({ error:"Serviço não incluso no plano" },{status:400})

  // Verifica cota (quota === -1 = ilimitado)
  if (svc.quota !== -1) {
    const uses = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as n FROM subscription_usage
       WHERE subscription_id=$1 AND service_name=$2
       AND used_at >= date_trunc('month', NOW())`,
      params.id, serviceName
    ) as any[]
    if (Number(uses[0].n) >= svc.quota) {
      return NextResponse.json({ error:`Cota de "${serviceName}" esgotada este mês` },{status:400})
    }
  }

  await prisma.$executeRawUnsafe(
    `INSERT INTO subscription_usage (subscription_id, service_name) VALUES ($1, $2)`,
    params.id, serviceName
  )
  return NextResponse.json({ ok: true })
}
