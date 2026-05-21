"use client"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar, Clock, CheckCircle, XCircle, Scissors, ChevronRight, LogOut, Star } from "lucide-react"
import { Suspense } from "react"

const BRL = (v:number) => "R$ " + v.toLocaleString("pt-BR",{minimumFractionDigits:2})

const STATUS: Record<string,{label:string;color:string;bg:string}> = {
  PENDING:   {label:"Pendente",   color:"#713f12",bg:"#fef9c3"},
  CONFIRMED: {label:"Confirmado", color:"#1e3a8a",bg:"#dbeafe"},
  DONE:      {label:"Concluído",  color:"#065f46",bg:"#d1fae5"},
  CANCELLED: {label:"Cancelado",  color:"#991b1b",bg:"#fee2e2"},
  NO_SHOW:   {label:"Faltou",     color:"#374151",bg:"#f3f4f6"},
}

function Dashboard() {
  const router  = useRouter()
  const params  = useSearchParams()
  const slug    = params.get("slug") ?? "barbearia-demo"

  const [appts,    setAppts]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [name,     setName]     = useState("")
  const [cancelling, setCancelling] = useState<string|null>(null)
  const [tab,      setTab]      = useState<"proximos"|"historico">("proximos")

  useEffect(()=>{
    fetch("/api/cliente/appointments")
      .then(r=>{ if(!r.ok) { router.push(`/cliente?slug=${slug}`); return null } return r.json() })
      .then(d=>{ if(d) { setAppts(d.data); if(d.data[0]) setName(d.data[0].client?.name ?? "") } })
      .finally(()=>setLoading(false))
  },[])

  async function logout() {
    await fetch("/api/cliente/auth",{method:"DELETE"})
    router.push(`/cliente?slug=${slug}`)
  }

  async function cancel(id:string) {
    setCancelling(id)
    const res = await fetch("/api/cliente/appointments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({appointmentId:id})})
    const data = await res.json()
    if(res.ok) setAppts(prev=>prev.map(a=>a.id===id?{...a,status:"CANCELLED"}:a))
    else alert(data.error)
    setCancelling(null)
  }

  const now       = new Date()
  const proximos  = appts.filter(a=>new Date(a.scheduledAt)>=now&&a.status!=="CANCELLED")
  const historico = appts.filter(a=>new Date(a.scheduledAt)<now||a.status==="CANCELLED")
  const total     = appts.filter(a=>a.status==="DONE").length
  const gasto     = appts.filter(a=>a.status==="DONE").reduce((s:number,a:any)=>s+Number(a.totalAmount),0)

  const fmtDate = (iso:string) => new Date(iso).toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"})
  const fmtTime = (iso:string) => new Date(iso).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", color:"white" }}>

      {/* Header */}
      <div style={{ background:"#1e293b", borderBottom:"1px solid #334155", padding:"16px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:36,height:36,background:"white",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
          <Scissors size={18} color="#111"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15,fontWeight:600 }}>Minha área</div>
          <div style={{ fontSize:12,color:"rgba(255,255,255,.5)" }}>Olá{name?`, ${name.split(" ")[0]}`:""}! 👋</div>
        </div>
        <button onClick={logout} style={{ background:"transparent",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontSize:12 }}>
          <LogOut size={15}/>Sair
        </button>
      </div>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 40px" }}>

        {/* Stats */}
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
          <div style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"14px" }}>
            <div style={{ fontSize:28,fontWeight:700 }}>{total}</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",marginTop:2 }}>cortes realizados</div>
            {total>=5&&<div style={{ fontSize:11,color:"#fbbf24",marginTop:4,display:"flex",alignItems:"center",gap:3 }}><Star size={11} fill="#fbbf24"/>Cliente VIP</div>}
          </div>
          <div style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"14px" }}>
            <div style={{ fontSize:20,fontWeight:700 }}>{BRL(gasto)}</div>
            <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",marginTop:2 }}>investido no visual</div>
          </div>
        </div>

        {/* Agendar novo */}
        <a href={`/${slug}`} style={{
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:"white",color:"#111",borderRadius:12,padding:"14px 16px",
          textDecoration:"none",marginBottom:20,
        }}>
          <div>
            <div style={{ fontSize:14,fontWeight:600 }}>✂️ Agendar novo corte</div>
            <div style={{ fontSize:12,color:"#6b7280",marginTop:2 }}>Escolha dia, horário e profissional</div>
          </div>
          <ChevronRight size={18} color="#6b7280"/>
        </a>

        {/* Tabs */}
        <div style={{ display:"flex",background:"#1e293b",borderRadius:10,padding:3,marginBottom:14,border:"1px solid #334155" }}>
          {[["proximos","Próximos",proximos.length],["historico","Histórico",historico.length]].map(([id,label,count])=>(
            <button key={id} onClick={()=>setTab(id as any)} style={{
              flex:1,padding:"8px",borderRadius:8,border:"none",fontSize:13,fontWeight:500,cursor:"pointer",
              background:tab===id?"#334155":"transparent",
              color:tab===id?"white":"rgba(255,255,255,.5)",
            }}>
              {label} {Number(count)>0&&<span style={{ fontSize:11,background:"rgba(255,255,255,.15)",padding:"1px 6px",borderRadius:10,marginLeft:4 }}>{count}</span>}
            </button>
          ))}
        </div>

        {/* Lista de agendamentos */}
        {loading&&<div style={{ textAlign:"center",padding:40,color:"rgba(255,255,255,.3)" }}>Carregando…</div>}

        {!loading&&(
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            {(tab==="proximos"?proximos:historico).length===0&&(
              <div style={{ textAlign:"center",padding:"32px 16px",color:"rgba(255,255,255,.3)",fontSize:14 }}>
                {tab==="proximos"?"Nenhum agendamento futuro":"Nenhum histórico ainda"}
              </div>
            )}
            {(tab==="proximos"?proximos:historico).map((a:any)=>{
              const st  = STATUS[a.status]??STATUS.PENDING
              const svcNames = a.items?.filter((i:any)=>i.service).map((i:any)=>i.service.name).join(", ")
              const canCancel = a.status==="PENDING"||a.status==="CONFIRMED"
              const hoursUntil = (new Date(a.scheduledAt).getTime()-Date.now())/3_600_000
              return (
                <div key={a.id} style={{ background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:"14px",overflow:"hidden" }}>
                  <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                    <div style={{ width:42,height:42,borderRadius:"50%",background:"#334155",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:15,fontWeight:600 }}>
                      {a.barber?.name?.[0]??"?"}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontSize:14,fontWeight:500 }}>{svcNames||"Serviço"}</div>
                      <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",marginTop:2 }}>com {a.barber?.name}</div>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap" }}>
                        <span style={{ fontSize:11,display:"flex",alignItems:"center",gap:3,color:"rgba(255,255,255,.5)" }}>
                          <Calendar size={11}/>{fmtDate(a.scheduledAt)}
                        </span>
                        <span style={{ fontSize:11,display:"flex",alignItems:"center",gap:3,color:"rgba(255,255,255,.5)" }}>
                          <Clock size={11}/>{fmtTime(a.scheduledAt)}
                        </span>
                        <span style={{ fontSize:11,fontWeight:600,color:"white" }}>{BRL(Number(a.totalAmount))}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:10,padding:"3px 8px",borderRadius:6,background:st.bg,color:st.color,fontWeight:500,flexShrink:0,whiteSpace:"nowrap" }}>
                      {st.label}
                    </div>
                  </div>

                  {canCancel&&hoursUntil>1&&(
                    <button onClick={()=>cancel(a.id)} disabled={cancelling===a.id} style={{
                      marginTop:12,width:"100%",padding:"9px",borderRadius:8,
                      border:"1px solid #475569",background:"transparent",color:"rgba(255,255,255,.5)",
                      fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:5,
                    }}>
                      <XCircle size={13}/>{cancelling===a.id?"Cancelando…":"Cancelar agendamento"}
                    </button>
                  )}
                  {canCancel&&hoursUntil<=1&&hoursUntil>0&&(
                    <div style={{ marginTop:10,fontSize:11,color:"rgba(255,255,255,.3)",textAlign:"center" }}>
                      Cancelamento não disponível (menos de 1h)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClienteDashboard() {
  return <Suspense><Dashboard/></Suspense>
}
