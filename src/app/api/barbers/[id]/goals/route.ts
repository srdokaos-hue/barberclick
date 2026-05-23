import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(_: NextRequest, { params }: { params:{ id:string } }) {
  const session = await getServerSession(authOptions)
  if(!session) return NextResponse.json({ error:"Unauthorized" }, {status:401})
  const barber = await prisma.barber.findUnique({ where:{ id:params.id }, select:{ goals:true } as any })
  return NextResponse.json({ data: JSON.parse((barber as any)?.goals||"[]") })
}

export async function PUT(req: NextRequest, { params }: { params:{ id:string } }) {
  const session = await getServerSession(authOptions)
  if(!session?.user?.barbershopId) return NextResponse.json({ error:"Unauthorized" }, {status:401})
  const { goals } = await req.json()
  await (prisma.barber.update as any)({ where:{ id:params.id }, data:{ goals: JSON.stringify(goals) } })
  return NextResponse.json({ ok:true })
}
