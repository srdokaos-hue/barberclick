import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Garante que a tabela existe (sem precisar de migração)
async function ensureTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS barber_goals (
      barber_id TEXT PRIMARY KEY,
      goals     TEXT NOT NULL DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await ensureTable()
  const rows = await prisma.$queryRaw<{goals:string}[]>`
    SELECT goals FROM barber_goals WHERE barber_id = ${params.id}
  `
  const goals = rows.length ? JSON.parse(rows[0].goals) : []
  return NextResponse.json({ data: goals })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.barbershopId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await ensureTable()
  const { goals } = await req.json()
  const goalsJson = JSON.stringify(goals)
  await prisma.$executeRawUnsafe(`
    INSERT INTO barber_goals (barber_id, goals, updated_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (barber_id) DO UPDATE SET goals = $2, updated_at = NOW()
  `, params.id, goalsJson)
  return NextResponse.json({ ok: true })
}
