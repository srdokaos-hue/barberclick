"use client"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Check, ChevronLeft, ChevronRight, TrendingUp, Scissors, Calendar, Target } from "lucide-react"

const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})
const STATUS:Record<string,{label:string;bg:string;fg:string}>={
  PENDING:  {label:"Pendente",  bg:"#fef9c3",fg:"#713f12"},
  CONFIRMED:{label:"Confirmado",bg:"#dbeafe",fg:"#1e3a8a"},
  DONE:     {label:"Concluído", bg:"#d1fae5",fg:"#065f46"},
  CANCELLED:{label:"Cancelado", bg:"#fee2e2",fg:"#991b1b"},
}

function iso(d:Date){return d.toISOString().slice(0,10)}

function GoalBar({goal,stats}:{goal:any;stats:any}){
  const actual =
    goal.type==="cuts"       ? (stats?.cutsMonth||0) :
    goal.type==="revenue"    ? (stats?.totalMonth||0) :
    goal.type==="commission" ? (stats?.commission||0) : 0

  const pct = goal.target>0 ? Math.min(Math.round(actual/goal.target*100),100) : 0
  const color = pct>=100?"#10b981":pct>=70?"#f59e0b":"#3b82f6"

  const fmtVal=(v:number)=>goal.type==="cuts"?String(Math.round(v)):BRL(v)

  return(
    <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"12px 14px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:5}}>
          <Target size={13} color={color}/>{goal.name}
        </div>
        <div style={{fontSize:12,fontWeight:700,color}}>
          {pct}%
        </div>
      </div>
      {/* Barra de progresso */}
      <div style={{height:8,borderRadius:4,background:"var(--color-border-tertiary)",overflow:"hidden",marginBottom:6}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:4,transition:"width .4s ease"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--color-text-tertiary)"}}>
        <span>{fmtVal(actual)} realizados</span>
        <span>Meta: {fmtVal(goal.target)}</span>
      </div>
    </div>
  )
}

export default function BarberDashboard(){
  const today=iso(new Date())
  const [date,setDate]=useState(today)

  const statsQ=useQuery({
    queryKey:["barber-stats"],
    queryFn:()=>fetch("/api/barber/stats").then(r=>r.json()).then(d=>d.data),
  })
  const apptQ=useQuery({
    queryKey:["barber-appts",date],
    queryFn:()=>fetch(`/api/barber/appointments?date=${date}`).then(r=>r.json()).then(d=>d.data??[]),
  })
  // Busca as metas do próprio barbeiro
  const goalsQ=useQuery({
    queryKey:["barber-goals"],
    enabled: !!statsQ.data,
    queryFn:()=>{
      const id=statsQ.data?.barberId
      if(!id) return Promise.resolve([])
      return fetch(`/api/barber/stats`).then(r=>r.json()).then(d=>d.data?.goals??[])
    },
  })

  const s=statsQ.data
  const appts=apptQ.data??[]
  const goals:any[]=s?.goals??[]

  async function markDone(id:string){
    await fetch("/api/barber/appointments",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({appointmentId:id,status:"DONE"})})
    apptQ.refetch()
  }

  const prevDay=()=>{const d=new Date(date);d.setDate(d.getDate()-1);setDate(iso(d))}
  const nextDay=()=>{const d=new Date(date);d.setDate(d.getDate()+1);setDate(iso(d))}

  return(
    <div style={{padding:"24px",maxWidth:720,margin:"0 auto"}}>
      {/* Boas-vindas */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Meu painel</div>
        <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Olá, {s?.name?.split(" ")[0]||"barbeiro"}! ✂️</div>
        <div style={{fontSize:13,color:"var(--color-text-tertiary)",marginTop:2}}>Comissão: <strong>{s?.commissionPct||0}%</strong> sobre serviços realizados</div>
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Faturado no mês",val:BRL(s?.totalMonth||0),  Icon:TrendingUp,color:"#3b82f6"},
          {label:"Cortes no mês",  val:String(s?.cutsMonth||0),Icon:Scissors,  color:"#8b5cf6"},
          {label:"Minha comissão", val:BRL(s?.commission||0),  Icon:TrendingUp,color:"#10b981"},
        ].map(k=>(
          <div key={k.label} style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:10,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em"}}>{k.label}</div>
              <k.Icon size={14} color={k.color}/>
            </div>
            <div style={{fontSize:20,fontWeight:700,color:"var(--color-text-primary)"}}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Metas com barra de progresso */}
      {goals.length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",marginBottom:10,display:"flex",alignItems:"center",gap:5}}>
            <Target size={15}/>Minhas metas do mês
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {goals.map((g:any)=><GoalBar key={g.id} goal={g} stats={s}/>)}
          </div>
        </div>
      )}

      {/* Agenda */}
      <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:14,overflow:"hidden"}}>
        <div style={{padding:"14px 16px",borderBottom:"1px solid var(--color-border-tertiary)",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flex:1}}>
            <Calendar size={15} color="var(--color-text-tertiary)"/>
            <span style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>{date===today?"Hoje":new Date(date+"T12:00:00").toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"short"})}</span>
            {appts.length>0&&<span style={{fontSize:12,color:"var(--color-text-tertiary)"}}>· {appts.length} agendamento{appts.length>1?"s":""}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={prevDay} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}><ChevronLeft size={14}/></button>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{fontSize:12,padding:"6px 8px",background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",borderRadius:7,width:"auto"}}/>
            <button onClick={nextDay} style={{width:30,height:30,borderRadius:7,border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}><ChevronRight size={14}/></button>
            {date!==today&&<button onClick={()=>setDate(today)} style={{fontSize:12,padding:"6px 10px",borderRadius:7,border:"1px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",color:"var(--color-text-tertiary)",cursor:"pointer"}}>Hoje</button>}
          </div>
        </div>
        {apptQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
        {!appts.length&&!apptQ.isLoading&&(
          <div style={{padding:40,textAlign:"center",color:"var(--color-text-tertiary)"}}>
            <Calendar size={32} style={{margin:"0 auto 10px",opacity:.25}}/>
            <div style={{fontSize:14}}>Nenhum agendamento{date===today?" para hoje":""}</div>
          </div>
        )}
        {appts.map((a:any,i:number)=>{
          const st=STATUS[a.status]??STATUS.PENDING
          const time=new Date(a.scheduledAt).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})
          return(
            <div key={a.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<appts.length-1?"1px solid var(--color-border-tertiary)":"none"}}>
              <div style={{fontSize:13,color:"var(--color-text-tertiary)",fontFamily:"monospace",minWidth:40,fontWeight:600}}>{time}</div>
              <div style={{width:36,height:36,borderRadius:"50%",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:"var(--color-text-secondary)",flexShrink:0}}>{a.client?.name?.[0]?.toUpperCase()||"?"}</div>
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
        })}
      </div>
    </div>
  )
}
