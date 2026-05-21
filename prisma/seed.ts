import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed...")

  // 1. Barbearia
  let barbershop = await prisma.barbershop.findUnique({ where: { slug: "barbearia-demo" } })
  if (!barbershop) {
    barbershop = await prisma.barbershop.create({
      data: {
        name: "Barbearia Demo", slug: "barbearia-demo",
        whatsapp: "5511999999999", plan: "PRO", active: true,
      },
    })
  }
  console.log(`✓ Barbearia: ${barbershop.name}`)

  const pwHash = await bcrypt.hash("senha123", 12)

  // 2. Barbeiros
  const barberData = [
    { email: "erickson@demo.com", name: "Erickson Silva", role: "ADMIN",  commissionPct: 0  },
    { email: "henrique@demo.com", name: "Henrique",        role: "BARBER", commissionPct: 70 },
    { email: "igor@demo.com",     name: "Igor",             role: "BARBER", commissionPct: 50 },
  ]
  for (const b of barberData) {
    const exists = await prisma.barber.findUnique({ where: { email: b.email } })
    if (!exists) {
      await prisma.barber.create({
        data: { ...b, passwordHash: pwHash, barbershopId: barbershop.id, active: true, commissionPct: b.commissionPct } as any,
      })
    }
  }
  console.log("✓ Barbeiros criados")

  // 3. Serviços
  const services = [
    { id: "svc-1", name: "Corte + Barba",    price: 60, durationMin: 60 },
    { id: "svc-2", name: "Corte Masculino",  price: 40, durationMin: 30 },
    { id: "svc-3", name: "Barba",            price: 30, durationMin: 30 },
    { id: "svc-4", name: "Corte Navalhado",  price: 50, durationMin: 45 },
    { id: "svc-5", name: "Hidratação",       price: 45, durationMin: 45 },
  ]
  for (const s of services) {
    const exists = await prisma.service.findFirst({ where: { barbershopId: barbershop.id, name: s.name } })
    if (!exists) await prisma.service.create({ data: { ...s, barbershopId: barbershop.id, active: true } })
  }
  console.log("✓ Serviços criados")

  // 4. Produtos
  const products = [
    { name: "Pomada Matte Loja",     salePrice: 45, costPrice: 18, stockQty: 8,  lowStockThreshold: 3 },
    { name: "Óleo de Barba Premium", salePrice: 65, costPrice: 28, stockQty: 5,  lowStockThreshold: 3 },
    { name: "Shampoo Antiqueda",     salePrice: 55, costPrice: 22, stockQty: 10, lowStockThreshold: 4 },
    { name: "Cera Modeladora",       salePrice: 38, costPrice: 14, stockQty: 12, lowStockThreshold: 4 },
  ]
  for (const p of products) {
    const exists = await prisma.product.findFirst({ where: { barbershopId: barbershop.id, name: p.name } })
    if (!exists) await prisma.product.create({ data: { ...p, barbershopId: barbershop.id, active: true } })
  }
  console.log("✓ Produtos criados")

  // 5. Agenda config
  const cfgExists = await prisma.scheduleConfig.findUnique({ where: { barbershopId: barbershop.id } })
  if (!cfgExists) {
    await prisma.scheduleConfig.create({
      data: {
        barbershopId: barbershop.id,
        workDays: [1,2,3,4,5,6],
        openTime: "09:00", closeTime: "19:00",
        slotDurationMin: 30, maxAdvanceDays: 30,
      },
    })
  }
  console.log("✓ Agenda configurada")

  // 6. Clientes
  const clientNames = [
    ["Carlos Silva",  "(11) 98765-4321", 25],
    ["Rafael Souza",  "(11) 97654-3210", 25],
    ["Pedro Alves",   "(11) 96543-2109", 30],
    ["Lucas Martins", "(11) 95432-1098", 25],
    ["Bruno Costa",   "(11) 94321-0987", 25],
    ["André Lima",    "(11) 93210-9876", 25],
  ]
  for (const [name, phone, interval] of clientNames) {
    const exists = await prisma.client.findFirst({ where: { barbershopId: barbershop.id, phone: phone as string } })
    if (!exists) {
      await prisma.client.create({
        data: {
          barbershopId: barbershop.id,
          name: name as string, phone: phone as string,
          returnIntervalDays: interval as number,
          lastVisitAt: new Date(Date.now() - Math.random() * 25 * 24*60*60*1000),
        },
      })
    }
  }
  console.log("✓ Clientes criados")

  console.log("\n🎉 Seed concluído!")
  console.log("─────────────────────────────────")
  console.log("URL pública:  http://localhost:3000/barbearia-demo")
  console.log("Login admin:  erickson@demo.com  /  senha123")
  console.log("Barbeiro 1:   henrique@demo.com  /  senha123")
  console.log("Barbeiro 2:   igor@demo.com       /  senha123")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
