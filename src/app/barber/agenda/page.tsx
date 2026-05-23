"use client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Check, User, ChevronLeft, ChevronRight, Calendar } from "lucide-react"

const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})
const STATUS: Record<string,{label:string;bg:string;fg:string}> = {
  PENDING:   {label:"Pendente",   bg:"#fef9c3",fg:"#713f12"},
  CONFIRMED: {label:"Confirmado", bg:"#dbeafe",fg:"#1e3a8a"},
  DONE:      {label:"Concluído",  bg:"#d1fae5",fg:"#065f46"},
  CANCELLED: {label:"Cancelado",  bg:"#fee2e2",fg:"#991b1b"},
}
function iso(d:Date){return d.toISOString().slice(0,10)}
function getMonday(d:Date){const c=new Date(d);c.setHours(0,0,0,0);const day=c.getDay();c.setDate(c.getDate()-(day===0?6:day-1));return c}
function addDays(d:Date,n:number){const c=new Date(d);c.setDate(c.getDate()+n);return c}

export default function BarberAgenda(){
  const today=iso(new Date())
  const [view,setView]=useState<"day"|"week">("day")
  const [date,setDate]=useState(today)
  const [weekStart,setWeekStart]=useState(()=>getMonday(new Date()))
  const weekDays=Array.from({length:6},(_,i)=>iso(addDays(weekStart,i)))

  const dayQ=useQuery({
    queryKey:["barber-agenda-day",date],
    queryFn:()=>fetch(`/api/barber/appointments?date=${date}`).then(r=>r.json()).then(d=>d.data??[]),
    enabled:view==="day",
  })
  const weekQ=useQuery({
    queryKey:["barber-agenda-week",weekStart.toISOString()],
    queryFn:async()=>Promise.all(weekDays.map(d=>fetch(`/api/barber/appointments?date=${d}`).then(r=>r.json()).then(j=>({date:d,appointments:j.data??[]})))),
    enabled:view==="week",
  })

  const dayData=dayQ.data??[]
  const weekData=weekQ.data??[]

  async function markDone(id:string){
    await fetch("/api/barber/appointments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({appointmentId:id,status:"DONE"})})
    view==="day"?dayQ.refetch():weekQ.refetch()
  }

  const Row=({a,last}:{a:any;last:boolean})=>{
    const st=STATUS[a.status]??STATUS.PENDING
    return(
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:last?"none":"1px solid var(--color-border-tertiary)"}}>
        <div style={{fontSize:12,color:"var(--color-text-tertiary)",fontFamily:"monospace",minWidth:40}}>
          {new Date(a.scheduledAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
        </div>
        <div style={{width:34,height:34,borderRadius:"50%",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:"var(--color-text-secondary)",flexShrink:0}}>
          {a.client?.name?.[0]?.toUpperCase()||"?"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{a.client?.name||"–"}</div>
          <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:1}}>{a.items?.map((x:any)=>x.name).join(", ")||"–"}</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>{BRL(Number(a.totalAmount))}</div>
          <div style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:st.bg,color:st.fg,fontWeight:500,display:"inline-block",marginTop:2}}>{st.label}</div>
        </div>
        {(a.status==="PENDING"||a.status==="CONFIRMED")&&(
          <button onClick={()=>markDone(a.id)} style={{width:30,height:30,borderRadius:8,border:"1px solid #a7f3d0",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0,flexShrink:0}}>
            <Check size={14} color="#065f46"/>
          </button>
        )}
      </div>
    )
  }

  const weekEnd=addDays(weekStart,5)
  const weekLabel=`${weekStart.toLocaleDateString("pt-BR",{day:"numeric",month:"short"})} – ${weekEnd.toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}`

  return(
    <div style={{padding:"24px",maxWidth:720,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Minha agenda</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Agendamentos</div>
        </div>
        <div style={{display:"flex",background:"var(--color-background-secondary)",borderRadius:10,padding:3,border:"1px solid var(--color-border-tertiary)"}}>
          {(["day","week"] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"7px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:500,cursor:"pointer",background:view===v?"var(--color-background-primary)":"transparent",color:view===v?"var(--color-text-primary)":"var(--color-text-tertiary)"}}>
              {v==="day"?"Dia":"Semana"}
            </button>
          ))}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={view==="day"?()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(iso(d))}:()=>setWeekStart(d=>addDays(d,-7))} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
            <ChevronLeft size={14}/>
          </button>
          {view==="day"
            ?<input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{fontSize:12,padding:"6px 8px",width:"auto"}}/>
            :<div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",minWidth:180,textAlign:"center"}}>{weekLabel}</div>
          }
          <button onClick={view==="day"?()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(iso(d))}:()=>setWeekStart(d=>addDays(d,7))} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
            <ChevronRight size={14}/>
          </button>
          <button onClick={()=>{setDate(today);setWeekStart(getMonday(new Date()))}} style={{fontSize:12,padding:"6px 10px",borderRadius:7,border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",color:"var(--color-text-tertiary)",cursor:"pointer"}}>Hoje</button>
        </div>
      </div>

      {view==="day"&&(
        <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12}}>
          {dayQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
          {!dayData.length&&!dayQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Nenhum agendamento para este dia.</div>}
          {dayData.map((a:any,i:number)=><Row key={a.id} a={a} last={i===dayData.length-1}/>)}
        </div>
      )}

      {view==="week"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {weekQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
          {weekData.map((day:any)=>{
            const isToday=day.date===today
            const hasAppts=day.appointments.length>0
            return(
              <div key={day.date} style={{background:"var(--color-background-primary)",border:isToday?"2px solid var(--accent,#111)":"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:hasAppts?"1px solid var(--color-border-tertiary)":"none",background:isToday?"var(--color-background-secondary)":"transparent"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {isToday&&<span style={{fontSize:10,background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",padding:"2px 8px",borderRadius:10,fontWeight:600}}>HOJE</span>}
                    <span style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)",textTransform:"capitalize"}}>
                      {new Date(day.date+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"short"})}
                    </span>
                  </div>
                  <span style={{fontSize:13,color:"var(--color-text-tertiary)"}}>
                    {hasAppts?`${day.appointments.length} agendamento${day.appointments.length>1?"s":""}`:(<span>— livre</span>)}
                  </span>
                </div>
                {hasAppts&&day.appointments.map((a:any,i:number)=><Row key={a.id} a={a} last={i===day.appointments.length-1}/>)}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
