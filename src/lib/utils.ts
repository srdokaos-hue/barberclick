import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const BRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

export const fmtDate = (date: Date | string) =>
  format(new Date(date), "dd/MM/yyyy", { locale: ptBR })

export const fmtDateTime = (date: Date | string) =>
  format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })

export const fmtTime = (date: Date | string) =>
  format(new Date(date), "HH:mm", { locale: ptBR })

export const fmtRelative = (date: Date | string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR })

export const slugify = (str: string) =>
  str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-{2,}/g, "-")

export function generateSlots(openTime: string, closeTime: string, slotMin: number): string[] {
  const slots: string[] = []
  const [oh, om] = openTime.split(":").map(Number)
  const [ch, cm] = closeTime.split(":").map(Number)
  let cur = oh * 60 + om
  const end = ch * 60 + cm
  while (cur + slotMin <= end) {
    const h = String(Math.floor(cur / 60)).padStart(2, "0")
    const m = String(cur % 60).padStart(2, "0")
    slots.push(`${h}:${m}`)
    cur += slotMin
  }
  return slots
}
