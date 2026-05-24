import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" },{status:401})
  const { prisma } = await import("@/lib/prisma")
  const { status, notes } = await req.json()

  // Se confirmando pagamento → renova a data
  let extra = ""
  if (status === "ACTIVE") {
    const renewal = new Date(); renewal.setMonth(renewal.getMonth()+1)
    extra = `, renewal_date = '${renewal.toISOString().slice(0,10)}'`
  }

  await prisma.$executeRawUnsafe(
    `UPDATE client_subscriptions
     SET status=$2, notes=COALESCE($3,notes), updated_at=NOW() ${extra}
     WHERE id=$1 AND barbershop_id=$4`,
    params.id, status, notes||null, session.user.barbershopId
  )
  return NextResponse.json({ ok: true })
}
