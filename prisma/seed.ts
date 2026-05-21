import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // 1. Barbearia demo
  const barbershop = await prisma.barbershop.upsert({
    where:  { slug: "barbearia-demo" },
    update: {},
    create: {
      name:     "Barbearia Demo",
      slug:     "barbearia-demo",
      whatsapp: "5511999999999",
      instagram:"@barbearia_demo",
      address:  "Rua das Flores, 123 — São Paulo, SP",
      plan:     "PRO",
      active:   true,
    },
  })
  console.log(`✓ Barbearia: ${barbershop.name}`)

  // 2. Barbeiro admin (dono)
  const pwHash = await bcrypt.hash("senha123", 12)

  const erickson = await prisma.barber.upsert({
    where:  { email: "erickson@demo.com" },
    update: {},
    create: {
      barbershopId:  barbershop.id,
      name:          "Erickson Silva",
      email:         "erickson@demo.com",
      passwordHash:  pwHash,
      role:          "ADMIN",
      commissionPct: 0,
      active:        true,
    },
  })

  const henrique = await prisma.barber.upsert({
    where:  { email: "henrique@demo.com" },
    update: {},
    create: {
      barbershopId:  barbershop.id,
      name:          "Henrique",
      email:         "henrique@demo.com",
      passwordHash:  pwHash,
      role:          "BARBER",
      commissionPct: 70,
      active:        true,
    },
  })

  const igor = await prisma.barber.upsert({
    where:  { email: "igor@demo.com" },
    update: {},
    create: {
      barbershopId:  barbershop.id,
      name:          "Igor",
      email:         "igor@demo.com",
      passwordHash:  pwHash,
      role:          "BARBER",
      commissionPct: 50,
      active:        true,
    },
  })
  console.log("✓ Barbeiros criados")

  // 3. Serviços
  const services = await Promise.all([
    prisma.service.upsert({ where:{id:"svc-corte-barba"}, update:{}, create:{
      id:"svc-corte-barba", barbershopId:barbershop.id, name:"Corte + Barba",
      description:"O combo mais pedido", price:60, durationMin:60, active:true,
    }}),
    prisma.service.upsert({ where:{id:"svc-corte"}, update:{}, create:{
      id:"svc-corte", barbershopId:barbershop.id, name:"Corte Masculino",
      description:"Tesoura ou máquina", price:40, durationMin:30, active:true,
    }}),
    prisma.service.upsert({ where:{id:"svc-barba"}, update:{}, create:{
      id:"svc-barba", barbershopId:barbershop.id, name:"Barba",
      description:"Navalha + hidratação", price:30, durationMin:30, active:true,
    }}),
    prisma.service.upsert({ where:{id:"svc-navalhado"}, update:{}, create:{
      id:"svc-navalhado", barbershopId:barbershop.id, name:"Corte Navalhado",
      description:"Acabamento preciso", price:50, durationMin:45, active:true,
    }}),
    prisma.service.upsert({ where:{id:"svc-hidratacao"}, update:{}, create:{
      id:"svc-hidratacao", barbershopId:barbershop.id, name:"Hidratação",
      description:"Reconstrução capilar", price:45, durationMin:45, active:true,
    }}),
  ])
  console.log("✓ Serviços criados")

  // 4. Produtos
  await Promise.all([
    prisma.product.upsert({ where:{id:"prod-pomada"}, update:{}, create:{
      id:"prod-pomada", barbershopId:barbershop.id, name:"Pomada Matte Loja",
      salePrice:45, costPrice:18, stockQty:8, lowStockThreshold:3, active:true,
    }}),
    prisma.product.upsert({ where:{id:"prod-oleo"}, update:{}, create:{
      id:"prod-oleo", barbershopId:barbershop.id, name:"Óleo de Barba Premium",
      salePrice:65, costPrice:28, stockQty:5, lowStockThreshold:3, active:true,
    }}),
    prisma.product.upsert({ where:{id:"prod-shampoo"}, update:{}, create:{
      id:"prod-shampoo", barbershopId:barbershop.id, name:"Shampoo Antiqueda",
      salePrice:55, costPrice:22, stockQty:10, lowStockThreshold:4, active:true,
    }}),
    prisma.product.upsert({ where:{id:"prod-cera"}, update:{}, create:{
      id:"prod-cera", barbershopId:barbershop.id, name:"Cera Modeladora",
      salePrice:38, costPrice:14, stockQty:12, lowStockThreshold:4, active:true,
    }}),
  ])
  console.log("✓ Produtos criados")

  // 5. Agenda config
  await prisma.scheduleConfig.upsert({
    where:  { barbershopId: barbershop.id },
    update: {},
    create: {
      barbershopId:    barbershop.id,
      workDays:        [1,2,3,4,5,6],
      openTime:        "09:00",
      closeTime:       "19:00",
      slotDurationMin: 30,
      maxAdvanceDays:  30,
    },
  })
  console.log("✓ Agenda configurada")

  // 6. Clientes demo
  const clientNames = [
    ["Carlos Silva",   "(11) 98765-4321", 25],
    ["Rafael Souza",   "(11) 97654-3210", 25],
    ["Pedro Alves",    "(11) 96543-2109", 30],
    ["Lucas Martins",  "(11) 95432-1098", 25],
    ["Bruno Costa",    "(11) 94321-0987", 25],
    ["André Lima",     "(11) 93210-9876", 25],
    ["Felipe Rocha",   "(11) 92109-8765", 20],
    ["Marcos Santos",  "(11) 91098-7654", 25],
  ]
  const clients = await Promise.all(
    clientNames.map(([name, phone, interval]) =>
      prisma.client.upsert({
        where:  { barbershopId_phone: { barbershopId:barbershop.id, phone:phone as string } },
        update: {},
        create: {
          barbershopId:       barbershop.id,
          name:               name as string,
          phone:              phone as string,
          returnIntervalDays: interval as number,
          lastVisitAt:        new Date(Date.now() - Math.random() * 30 * 24*60*60*1000),
        },
      })
    )
  )
  console.log(`✓ ${clients.length} clientes criados`)

  console.log("\n🎉 Seed concluído!")
  console.log("─────────────────────────────────")
  console.log("URL pública:  http://localhost:3000/barbearia-demo")
  console.log("Login admin:  erickson@demo.com  /  senha123")
  console.log("Login barb.1: henrique@demo.com  /  senha123")
  console.log("Login barb.2: igor@demo.com       /  senha123")
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
