"use client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Check, User, ChevronLeft, ChevronRight } from "lucide-react"

const BRL = (v:number) => "R$ " + v.toLocaleString("pt-BR",{minimumFractionDigits:2})

const STATUS: Record<string,{label:string;bg:string;fg:string}> = {
  PENDING:    {label:"Pendente",      bg:"#fef9c3",fg:"#713f12"},
  CONFIRMED:  {label:"Confirmado",    bg:"#dbeafe",fg:"#1e3a8a"},
  IN_PROGRESS:{label:"Em andamento",  bg:"#e0f2fe",fg:"#0c4a6e"},
  DONE:       {label:"Concluído",     bg:"#d1fae5",fg:"#065f46"},
  CANCELLED:  {label:"Cancelado",     bg:"#fee2e2",fg:"#991b1b"},
  NO_SHOW:    {label:"Faltou",        bg:"#f3f4f6",fg:"#374151"},
}

function getMonday(d: Date) {
  const c = new Date(d); c.setHours(0,0,0,0)
  const day = c.getDay()
  c.setDate(c.getDate() - (day===0?6:day-1))
  return c
}

function addDays(d: Date, n: number) {
  const c = new Date(d); c.setDate(c.getDate()+n); return c
}

function iso(d: Date) { return d.toISOString().slice(0,10) }

function fmtDay(isoStr: string) {
  return new Date(isoStr+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"short"})
}

function AppRow({a,last,onUpdate}:{a:any;last:boolean;onUpdate:(id:string,s:string)=>void}) {
  const st = STATUS[a.status]??STATUS.PENDING
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:last?"none":"1px solid var(--border)"}}>
      <div style={{fontSize:12,color:"var(--text-4)",fontFamily:"monospace",minWidth:40}}>
        {new Date(a.scheduledAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
      </div>
      <div style={{width:34,height:34,borderRadius:"50%",background:"var(--bg-hover)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <User size={15} color="var(--text-4)"/>
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>{a.client?.name??"–"}</div>
        <div style={{fontSize:12,color:"var(--text-3)",marginTop:1}}>
          {a.items?.map((i:any)=>i.name).join(", ")} · {a.barber?.name}
        </div>
      </div>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{BRL(Number(a.totalAmount))}</div>
        <div style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:st.bg,color:st.fg,fontWeight:500,display:"inline-block",marginTop:2}}>{st.label}</div>
      </div>
      {a.status==="CONFIRMED"&&(
        <button onClick={()=>onUpdate(a.id,"DONE")} style={{width:30,height:30,borderRadius:8,border:"1px solid #a7f3d0",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,padding:0}}>
          <Check size={14} color="#065f46"/>
        </button>
      )}
    </div>
  )
}

export default function Appointments() {
  const today  = iso(new Date())
  const [view, setView]        = useState<"day"|"week">("day")
  const [date, setDate]        = useState(today)
  const [weekStart, setWeekStart] = useState(()=>getMonday(new Date()))

  const weekDays = Array.from({length:6},(_,i)=>iso(addDays(weekStart,i)))

  // ── Dia ──────────────────────────────────────────────────
  const dayQ = useQuery({
    queryKey:["appts-day",date],
    queryFn: async()=>{ const r=await fetch(`/api/appointments?date=${date}`); return (await r.json()).data??[] },
    enabled: view==="day",
  })

  // ── Semana ───────────────────────────────────────────────
  const weekQ = useQuery({
    queryKey:["appts-week",weekStart.toISOString()],
    queryFn: async()=>{
      const res = await Promise.all(weekDays.map(d=>fetch(`/api/appointments?date=${d}`).then(r=>r.json()).then(j=>({date:d,appointments:j.data??[]}))))
      return res
    },
    enabled: view==="week",
  })

  const dayData  = dayQ.data??[]
  const weekData = weekQ.data??[]
  const allWeekAppts = weekData.flatMap((d:any)=>d.appointments)

  async function updateStatus(id:string,status:string) {
    await fetch(`/api/appointments/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})})
    view==="day"?dayQ.refetch():weekQ.refetch()
  }

  const prevWeek = ()=>setWeekStart(d=>addDays(d,-7))
  const nextWeek = ()=>setWeekStart(d=>addDays(d, 7))
  const weekEnd  = addDays(weekStart,5)
  const weekLabel= `${weekStart.toLocaleDateString("pt-BR",{day:"numeric",month:"short"})} – ${weekEnd.toLocaleDateString("pt-BR",{day:"numeric",month:"short",year:"numeric"})}`

  const stats = view==="day" ? [
    {label:"Agendamentos",   val:dayData.length},
    {label:"Concluídos",     val:dayData.filter((a:any)=>a.status==="DONE").length},
    {label:"Receita do dia", val:BRL(dayData.filter((a:any)=>a.paymentStatus==="PAID").reduce((s:number,a:any)=>s+Number(a.totalAmount),0))},
  ] : [
    {label:"Agendamentos",     val:allWeekAppts.length},
    {label:"Concluídos",       val:allWeekAppts.filter((a:any)=>a.status==="DONE").length},
    {label:"Receita da semana",val:BRL(allWeekAppts.filter((a:any)=>a.paymentStatus==="PAID").reduce((s:number,a:any)=>s+Number(a.totalAmount),0))},
  ]

  return (
    <div style={{padding:"24px",maxWidth:860,margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--text)"}}>Agendamentos</div>
        </div>

        {/* Toggle Dia / Semana */}
        <div style={{display:"flex",background:"var(--bg-hover)",borderRadius:10,padding:3,border:"1px solid var(--border)"}}>
          {(["day","week"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{
              padding:"7px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:500,
              background:view===v?"var(--bg-card)":"transparent",
              color:view===v?"var(--text)":"var(--text-3)",
              boxShadow:view===v?"var(--shadow)":"none",
            }}>
              {v==="day"?"Dia":"Semana"}
            </button>
          ))}
        </div>

        {/* Navegação de data / semana */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={view==="day"?()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(iso(d))}:prevWeek}
            style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
            <ChevronLeft size={16}/>
          </button>

          {view==="day" ? (
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:"auto",fontSize:13,padding:"7px 10px"}}/>
          ) : (
            <div style={{fontSize:13,fontWeight:500,color:"var(--text)",minWidth:200,textAlign:"center"}}>{weekLabel}</div>
          )}

          <button onClick={view==="day"?()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(iso(d))}:nextWeek}
            style={{width:32,height:32,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",padding:0}}>
            <ChevronRight size={16}/>
          </button>

          {view==="day"&&<button onClick={()=>setDate(today)} style={{fontSize:12,padding:"7px 10px",color:"var(--text-3)"}}>Hoje</button>}
          {view==="week"&&<button onClick={()=>setWeekStart(getMonday(new Date()))} style={{fontSize:12,padding:"7px 10px",color:"var(--text-3)"}}>Esta semana</button>}
        </div>
      </div>

      {/* Métricas */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"14px",boxShadow:"var(--shadow)"}}>
            <div style={{fontSize:20,fontWeight:600,color:"var(--text)"}}>{s.val}</div>
            <div style={{fontSize:10,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:".04em",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── VISÃO DIA ── */}
      {view==="day"&&(
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,boxShadow:"var(--shadow)"}}>
          {dayQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--text-4)"}}>Carregando…</div>}
          {!dayData.length&&!dayQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--text-4)",fontSize:13}}>Nenhum agendamento para esta data.</div>}
          {dayData.map((a:any,i:number)=><AppRow key={a.id} a={a} last={i===dayData.length-1} onUpdate={updateStatus}/>)}
        </div>
      )}

      {/* ── VISÃO SEMANA ── */}
      {view==="week"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {weekQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--text-4)"}}>Carregando semana…</div>}
          {weekData.map((day:any)=>{
            const isToday = day.date===today
            const hasAppts = day.appointments.length>0
            return (
              <div key={day.date} style={{background:"var(--bg-card)",border:isToday?"2px solid var(--accent)":"1px solid var(--border)",borderRadius:12,overflow:"hidden",boxShadow:"var(--shadow)"}}>
                <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:hasAppts?"1px solid var(--border)":"none",background:isToday?"var(--bg-hover)":"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {isToday&&<span style={{fontSize:10,background:"var(--accent)",color:"var(--accent-fg)",padding:"2px 8px",borderRadius:10,fontWeight:600}}>HOJE</span>}
                    <span style={{fontSize:14,fontWeight:600,color:"var(--text)",textTransform:"capitalize"}}>{fmtDay(day.date)}</span>
                  </div>
                  <span style={{fontSize:13,color:hasAppts?"var(--text-2)":"var(--text-4)",fontWeight:hasAppts?500:400}}>
                    {hasAppts?`${day.appointments.length} agendamento${day.appointments.length>1?"s":""}`:(<span style={{color:"var(--text-4)"}}>— livre</span>)}
                  </span>
                </div>
                {hasAppts&&day.appointments.map((a:any,i:number)=>(
                  <AppRow key={a.id} a={a} last={i===day.appointments.length-1} onUpdate={updateStatus}/>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
