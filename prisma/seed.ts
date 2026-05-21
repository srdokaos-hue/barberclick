import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
const prisma = new PrismaClient()
async function main() {
  let shop = await prisma.barbershop.findUnique({ where: { slug: "barbearia-demo" } })
  if (!shop) shop = await prisma.barbershop.create({ data: { name: "Barbearia Demo", slug: "barbearia-demo", plan: "PRO", active: true } })
  const pw = await bcrypt.hash("senha123", 12)
  for (const b of [{email:"erickson@demo.com",name:"Erickson",role:"ADMIN",commissionPct:0},{email:"henrique@demo.com",name:"Henrique",role:"BARBER",commissionPct:70},{email:"igor@demo.com",name:"Igor",role:"BARBER",commissionPct:50}]) {
    if (!await prisma.barber.findUnique({ where: { email: b.email } })) await prisma.barber.create({ data: { ...b, passwordHash: pw, barbershopId: shop.id, active: true } as any })
  }
  for (const s of [{name:"Corte + Barba",price:60,durationMin:60},{name:"Corte Masculino",price:40,durationMin:30},{name:"Barba",price:30,durationMin:30}]) {
    if (!await prisma.service.findFirst({ where: { barbershopId: shop.id, name: s.name } })) await prisma.service.create({ data: { ...s, barbershopId: shop.id, active: true } })
  }
  for (const p of [{name:"Pomada Matte",salePrice:45,costPrice:18,stockQty:8,lowStockThreshold:3},{name:"Oleo Barba",salePrice:65,costPrice:28,stockQty:5,lowStockThreshold:3}]) {
    if (!await prisma.product.findFirst({ where: { barbershopId: shop.id, name: p.name } })) await prisma.product.create({ data: { ...p, barbershopId: shop.id, active: true } })
  }
  if (!await prisma.scheduleConfig.findUnique({ where: { barbershopId: shop.id } })) await prisma.scheduleConfig.create({ data: { barbershopId: shop.id, workDays: [1,2,3,4,5,6], openTime: "09:00", closeTime: "19:00", slotDurationMin: 30, maxAdvanceDays: 30 } })
  for (const [name,phone] of [["Carlos Silva","11987654321"],["Rafael Souza","11976543210"],["Pedro Alves","11965432109"]]) {
    if (!await prisma.client.findFirst({ where: { barbershopId: shop.id, phone: phone as string } })) await prisma.client.create({ data: { barbershopId: shop.id, name: name as string, phone: phone as string, returnIntervalDays: 25 } })
  }
  console.log("Seed OK!")
}
main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())