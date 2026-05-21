$seed = @'
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando seed...")

  let barbershop = await prisma.barbershop.findUnique({ where: { slug: "barbearia-demo" } })
  if (!barbershop) {
    barbershop = await prisma.barbershop.create({
      data: { name: "Barbearia Demo", slug: "barbearia-demo", whatsapp: "5511999999999", plan: "PRO", active: true },
    })
  }

  const pwHash = await bcrypt.hash("senha123", 12)

  for (const b of [
    { email: "erickson@demo.com", name: "Erickson Silva", role: "ADMIN",  commissionPct: 0  },
    { email: "henrique@demo.com", name: "Henrique",       role: "BARBER", commissionPct: 70 },
    { email: "igor@demo.com",     name: "Igor",           role: "BARBER", commissionPct: 50 },
  ]) {
    const exists = await prisma.barber.findUnique({ where: { email: b.email } })
    if (!exists) await prisma.barber.create({ data: { ...b, passwordHash: pwHash, barbershopId: barbershop.id, active: true } as any })
  }

  for (const s of [
    { name: "Corte + Barba",   price: 60, durationMin: 60 },
    { name: "Corte Masculino", price: 40, durationMin: 30 },
    { name: "Barba",           price: 30, durationMin: 30 },
    { name: "Corte Navalhado", price: 50, durationMin: 45 },
    { name: "Hidratacao",      price: 45, durationMin: 45 },
  ]) {
    const exists = await prisma.service.findFirst({ where: { barbershopId: barbershop.id, name: s.name } })
    if (!exists) await prisma.service.create({ data: { ...s, barbershopId: barbershop.id, active: true } })
  }

  for (const p of [
    { name: "Pomada Matte",  salePrice: 45, costPrice: 18, stockQty: 8,  lowStockThreshold: 3 },
    { name: "Oleo de Barba", salePrice: 65, costPrice: 28, stockQty: 5,  lowStockThreshold: 3 },
    { name: "Shampoo",       salePrice: 55, costPrice: 22, stockQty: 10, lowStockThreshold: 4 },
  ]) {
    const exists = await prisma.product.findFirst({ where: { barbershopId: barbershop.id, name: p.name } })
    if (!exists) await prisma.product.create({ data: { ...p, barbershopId: barbershop.id, active: true } })
  }

  const cfg = await prisma.scheduleConfig.findUnique({ where: { barbershopId: barbershop.id } })
  if (!cfg) await prisma.scheduleConfig.create({ data: { barbershopId: barbershop.id, workDays: [1,2,3,4,5,6], openTime: "09:00", closeTime: "19:00", slotDurationMin: 30, maxAdvanceDays: 30 } })

  for (const [name, phone] of [["Carlos Silva","(11)98765-4321"],["Rafael Souza","(11)97654-3210"],["Pedro Alves","(11)96543-2109"],["Lucas Martins","(11)95432-1098"]]) {
    const exists = await prisma.client.findFirst({ where: { barbershopId: barbershop.id, phone: phone as string } })
    if (!exists) await prisma.client.create({ data: { barbershopId: barbershop.id, name: name as string, phone: phone as string, returnIntervalDays: 25 } })
  }

  console.log("Seed concluido!")
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
'@
Set-Content -Path "prisma\seed.ts" -Value $seed -Encoding UTF8