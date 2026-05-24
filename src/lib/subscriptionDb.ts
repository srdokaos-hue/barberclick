import { prisma } from "@/lib/prisma"

export async function ensureTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      barbershop_id TEXT NOT NULL,
      name         TEXT NOT NULL,
      price        NUMERIC(10,2) NOT NULL,
      services     TEXT NOT NULL DEFAULT '[]',
      active       BOOLEAN NOT NULL DEFAULT true,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS client_subscriptions (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      barbershop_id   TEXT NOT NULL,
      client_name     TEXT NOT NULL,
      client_phone    TEXT NOT NULL,
      plan_id         TEXT NOT NULL,
      plan_name       TEXT NOT NULL,
      price           NUMERIC(10,2) NOT NULL,
      services        TEXT NOT NULL DEFAULT '[]',
      status          TEXT NOT NULL DEFAULT 'PENDING',
      start_date      DATE,
      renewal_date    DATE,
      payment_method  TEXT NOT NULL DEFAULT 'PIX',
      notes           TEXT,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS subscription_usage (
      id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      subscription_id TEXT NOT NULL,
      service_name    TEXT NOT NULL,
      used_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
}

// Pré-popula os planos da Henrique Du Corte se não existir nenhum
export async function seedPlans(barbershopId: string) {
  const existing = await prisma.$queryRawUnsafe(
    `SELECT id FROM subscription_plans WHERE barbershop_id = $1 LIMIT 1`, barbershopId
  ) as any[]
  if (existing.length) return

  const plans = [
    {
      name: "Na Régua",
      price: 109.90,
      services: JSON.stringify([
        { name: "Corte com sobrancelha", quota: 3 }
      ])
    },
    {
      name: "Navalha",
      price: 139.90,
      services: JSON.stringify([
        { name: "Corte com sobrancelha", quota: 4 },
        { name: "Pigmentação",           quota: 1 },
        { name: "Pezinho",               quota: 2 }
      ])
    },
    {
      name: "Golden Boy",
      price: 199.90,
      services: JSON.stringify([
        { name: "Corte com sobrancelha", quota: 4 },
        { name: "Pezinho",               quota: -1 },
        { name: "Pigmentação",           quota: 2  },
        { name: "Luzes",                 quota: 1  }
      ])
    },
  ]

  for (const p of plans) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO subscription_plans (barbershop_id, name, price, services)
       VALUES ($1, $2, $3, $4)`,
      barbershopId, p.name, p.price, p.services
    )
  }
}
