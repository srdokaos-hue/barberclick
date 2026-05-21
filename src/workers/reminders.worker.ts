/**
 * BarberClick — Worker de lembretes de retorno
 * Execução: npm run worker
 * O processo roda separado do Next.js, processando jobs da fila BullMQ
 */
import { Queue, Worker } from "bullmq"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const conn   = { host:process.env.REDIS_HOST??"localhost", port:Number(process.env.REDIS_PORT??6379) }

// ─── FILA ──────────────────────────────────────────────────────
export const reminderQueue = new Queue("return-reminders", { connection:conn })

export async function scheduleReturnReminder(appointmentId: string, clientId: string, daysInterval: number) {
  const scheduledFor = new Date(Date.now()+daysInterval*24*60*60*1000)

  const reminder = await prisma.returnReminder.upsert({
    where:  { appointmentId },
    update: { scheduledFor, status:"PENDING" },
    create: { clientId, appointmentId, daysInterval, scheduledFor },
    include:{ client:{ include:{ barbershop:true } } },
  })

  const delay = Math.max(0, scheduledFor.getTime()-Date.now())
  await reminderQueue.add(
    "send-reminder",
    { reminderId:reminder.id, clientPhone:reminder.client.phone, clientName:reminder.client.name,
      shopSlug:reminder.client.barbershop.slug, shopName:reminder.client.barbershop.name },
    { delay, attempts:3, backoff:{ type:"exponential", delay:60_000 }, removeOnComplete:100 }
  )
  console.log(`[reminders] Agendado para ${scheduledFor.toISOString()} — ${reminder.client.name}`)
  return reminder
}

// ─── WORKER ────────────────────────────────────────────────────
const worker = new Worker(
  "return-reminders",
  async (job) => {
    const { reminderId, clientPhone, clientName, shopSlug, shopName } = job.data
    console.log(`[reminders] Enviando para ${clientName} (${clientPhone})`)

    const link    = `${process.env.NEXT_PUBLIC_APP_URL}/${shopSlug}`
    const message = `Olá, ${clientName}! 👋 Faz um tempinho que você não passa por aqui. Que tal agendar seu próximo corte? ${link}`

    const res = await fetch(
      `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`,
      {
        method:"POST",
        headers:{ "Content-Type":"application/json", "client-token":process.env.ZAPI_CLIENT_TOKEN??"" },
        body:JSON.stringify({ phone:clientPhone.replace(/\D/g,""), message }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Z-API error ${res.status}: ${err}`)
    }

    await prisma.returnReminder.update({
      where:{ id:reminderId },
      data:{ status:"SENT", sentAt:new Date() },
    })
    console.log(`[reminders] ✓ Enviado para ${clientName}`)
  },
  { connection:conn, concurrency:5 }
)

worker.on("failed", async (job, err) => {
  console.error(`[reminders] ✗ Job ${job?.id} falhou:`, err.message)
  if (job?.data?.reminderId) {
    await prisma.returnReminder.update({
      where:{ id:job.data.reminderId },
      data:{ status:"FAILED", errorMessage:err.message },
    })
  }
})

worker.on("completed", job => console.log(`[reminders] Job ${job.id} concluído`))
console.log("🔔 Worker de lembretes iniciado. Aguardando jobs…")
