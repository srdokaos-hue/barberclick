import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST /api/reminders — dispara lembrete manual para um cliente
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })

  const { clientId } = await req.json()
  if (!clientId) return NextResponse.json({ error:"clientId é obrigatório" }, { status:400 })

  const client = await prisma.client.findUnique({
    where:{ id:clientId },
    include:{ barbershop:{ select:{ whatsapp:true, name:true, slug:true } } },
  })
  if (!client) return NextResponse.json({ error:"Cliente não encontrado" }, { status:404 })

  // Monta e envia mensagem via Z-API
  const link    = `${process.env.NEXT_PUBLIC_APP_URL}/${client.barbershop.slug}`
  const message = `Olá, ${client.name}! 👋 Faz um tempinho que você não passa por aqui. Que tal agendar seu próximo corte? ${link}`

  try {
    await fetch(`https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE}/token/${process.env.ZAPI_TOKEN}/send-text`, {
      method:"POST",
      headers:{ "Content-Type":"application/json", "client-token":process.env.ZAPI_CLIENT_TOKEN ?? "" },
      body:JSON.stringify({ phone:client.phone.replace(/\D/g,""), message }),
    })
  } catch (err) {
    console.error("[reminders] Falha no envio:", err)
  }

  return NextResponse.json({ ok:true, message:"Lembrete enviado" })
}

// GET /api/reminders — lista lembretes pendentes
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error:"Não autorizado" }, { status:401 })
  const barbershopId = (session.user as any).barbershopId

  const reminders = await prisma.returnReminder.findMany({
    where:{
      client:{ barbershopId },
      status:{ in:["PENDING","FAILED"] },
      scheduledFor:{ lte:new Date(Date.now()+7*24*60*60*1000) },
    },
    include:{ client:{ select:{ name:true, phone:true } } },
    orderBy:{ scheduledFor:"asc" },
    take:50,
  })
  return NextResponse.json({ data:reminders })
}
