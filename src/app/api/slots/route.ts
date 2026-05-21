import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateSlots } from "@/lib/utils"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const slug    = searchParams.get("slug")!
  const date    = searchParams.get("date")!
  const barberId= searchParams.get("barberId")
  const durMin  = Number(searchParams.get("duration") ?? 30)

  if (!slug || !date) return NextResponse.json({ error:"slug e date são obrigatórios" }, { status:400 })

  const barbershop = await prisma.barbershop.findUnique({
    where:{ slug }, include:{ scheduleConfig:true },
  })
  if (!barbershop?.scheduleConfig) return NextResponse.json({ data:[] })

  const cfg = barbershop.scheduleConfig
  const workDays = cfg.workDays as number[]
  const dayOfWeek = new Date(date).getDay()
  if (!workDays.includes(dayOfWeek)) return NextResponse.json({ data:[] })

  const all = generateSlots(cfg.openTime, cfg.closeTime, cfg.slotDurationMin)

  // Filtra horário de almoço
  const filtered = all.filter(s => {
    if (!cfg.lunchStart || !cfg.lunchEnd) return true
    return s < cfg.lunchStart || s >= cfg.lunchEnd
  })

  // Busca agendamentos do dia para detectar conflitos
  const start   = new Date(`${date}T00:00:00`)
  const end     = new Date(`${date}T23:59:59`)
  const booked  = await prisma.appointment.findMany({
    where:{
      barbershopId: barbershop.id,
      ...(barberId ? { barberId } : {}),
      scheduledAt:  { gte:start,lte:end },
      status:       { notIn:["CANCELLED","NO_SHOW"] },
    },
    select:{ scheduledAt:true, endsAt:true },
  })

  const available = filtered.filter(slot => {
    const slotStart = new Date(`${date}T${slot}:00`)
    const slotEnd   = new Date(slotStart.getTime()+durMin*60_000)
    return !booked.some(b => slotStart < b.endsAt && slotEnd > b.scheduledAt)
  })

  return NextResponse.json({ data:available })
}
