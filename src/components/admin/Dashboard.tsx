"use client"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Package, Users, Target } from "lucide-react"

const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})
const MONTHS=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

const MONTHLY=MONTHS.map((mes,i)=>{
  const s=Math.sin(i*0.8),c=Math.cos(i*0.5)
  const r=Math.round(6200+s*1100+i*120)
  const cost=Math.round(r*0.22+c*80)
  return{mes,receita:r,custo:cost,lucro:r-cost,atendimentos:Math.round(36+i*1.2+s*6)}
})

function ChartTip({active,payload,label}:any){
  if(!active||!payload?.length) return null
  return(
    <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:9,padding:"9px 13px",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.15)"}}>
      <div style={{fontWeight:600,marginBottom:4,color:"var(--color-text-primary)"}}>{label}</div>
      {payload.map((p:any)=>(
        <div key={p.dataKey} style={{color:p.color,display:"flex",justifyContent:"space-between",gap:14}}>
          <span>{p.name}</span><span style={{fontWeight:500}}>{p.value>1000?BRL(p.value):p.value}</span>
        </div>
      ))}
    </div>
  )
}

// Barra de progresso para metas dos barbeiros
function GoalBar({goal,actual}:{goal:any;actual:number}){
  const pct=goal.target>0?Math.min(Math.round(actual/goal.target*100),100):0
  const color=pct>=100?"#10b981":pct>=70?"#f59e0b":"#3b82f6"
  const fmtVal=(v:number)=>goal.type==="cuts"?String(Math.round(v)):BRL(v)
  return(
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
        <span style={{color:"var(--color-text-secondary)",fontWeight:500}}>{goal.name}</span>
        <span style={{color,fontWeight:700}}>{pct}%</span>
      </div>
      <div style={{height:7,borderRadius:4,background:"var(--color-border-tertiary)",overflow:"hidden",marginBottom:3}}>
        <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:4,transition:"width .4s ease"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--color-text-tertiary)"}}>
        <span>{fmtVal(actual)} realizados</span><span>Meta: {fmtVal(goal.target)}</span>
      </div>
    </div>
  )
}

function BarberCard({barber,stats}:{barber:any;stats:any}){
  const commission=Number(barber.commissionPct??0)
  const revenue   =stats?.totalMonth??0
  const myComm    =revenue*(commission/100)
  const cuts      =stats?.cutsMonth??0
  const goals     =stats?.goals??[]
  return(
    <div style={{background:"var(--color-background-secondary)",borderRadius:12,padding:14,border:"1px solid var(--color-border-tertiary)"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:40,height:40,borderRadius:"50%",background:"var(--color-background-primary)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"var(--color-text-secondary)"}}>
          {barber.avatarUrl?<img src={barber.avatarUrl} alt={barber.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:barber.name[0]}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>{barber.name}</div>
          <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{commission}% comissão</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:goals.length?12:0}}>
        {[{label:"Cortes",val:cuts},{label:"Faturado",val:BRL(revenue)},{label:"Comissão",val:BRL(myComm)}].map(k=>(
          <div key={k.label} style={{textAlign:"center",background:"var(--color-background-primary)",borderRadius:8,padding:"8px 4px"}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--color-text-primary)"}}>{k.val}</div>
            <div style={{fontSize:10,color:"var(--color-text-tertiary)",marginTop:1}}>{k.label}</div>
          </div>
        ))}
      </div>
      {goals.length>0&&(
        <div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><Target size={11}/>Metas do mês</div>
          {goals.map((g:any)=>{
            const actual=g.type==="cuts"?cuts:g.type==="revenue"?revenue:g.type==="commission"?myComm:0
            return <GoalBar key={g.id} goal={g} actual={actual}/>
          })}
        </div>
      )}
    </div>
  )
}

export default function Dashboard(){
  const {data:session}=useSession()
  const [tab,      setTab]      =useState("overview")
  const [month,    setMonth]    =useState(new Date().getMonth())
  const [shopName, setShopName] =useState("Admin")

  useEffect(()=>{
    try{
      const n=localStorage.getItem("shopName"); if(n) setShopName(n)
      const ac=localStorage.getItem("accentColor")
      if(ac){
        document.documentElement.style.setProperty("--accent",ac)
        document.documentElement.style.setProperty("--sidebar-bg",ac)
      }
      const h=()=>{const n2=localStorage.getItem("shopName");if(n2)setShopName(n2)}
      window.addEventListener("settingsUpdated",h)
      return()=>window.removeEventListener("settingsUpdated",h)
    }catch{}
  },[])

  const financialQ=useQuery({
    queryKey:["financial",month],
    queryFn:()=>fetch(`/api/financial?month=${month+1}&year=2026`).then(r=>r.json()).then(d=>d.data),
    retry:1,
  })
  const productsQ=useQuery({
    queryKey:["products-dash"],
    queryFn:()=>fetch("/api/products").then(r=>r.json()).then(d=>(d.data??[]).filter((p:any)=>p.active&&p.stockQty<=p.lowStockThreshold)),
    retry:1,
  })
  // Busca barbeiros com stats para aba Profissionais
  const barbersQ=useQuery({
    queryKey:["barbers-dash"],
    queryFn:()=>fetch("/api/barbers").then(r=>r.json()).then(d=>(d.data??[]).filter((b:any)=>b.role==="BARBER"&&b.active)),
    retry:1,
    enabled:tab==="professionals",
  })
  // Stats de cada barbeiro (metas + comissão)
  const barberStatsQ=useQuery({
    queryKey:["barber-stats-admin",month],
    queryFn:async()=>{
      const barbers=barbersQ.data??[]
      const stats=await Promise.all(barbers.map((b:any)=>
        fetch(`/api/barbers/${b.id}/goals`).then(r=>r.json()).then(d=>({id:b.id,goals:d.data??[]}))
      ))
      return Object.fromEntries(stats.map(s=>[s.id,{goals:s.goals,totalMonth:0,cutsMonth:0}]))
    },
    enabled:tab==="professionals"&&(barbersQ.data?.length??0)>0,
  })

  const f=financialQ.data
  const lowStock:any[]=productsQ.data??[]
  const md=MONTHLY[month]
  const receita     =f?.totalRevenue??md.receita
  const custos      =f?.totalCosts  ??md.custo
  const lucro       =receita-custos
  const atendimentos=f?.totalAppt   ??md.atendimentos
  const ticket      =atendimentos>0?receita/atendimentos:0
  const prev        =MONTHLY[month>0?month-1:0]
  const growth      =prev.receita>0?((receita-prev.receita)/prev.receita*100).toFixed(1):"0"
  const growUp      =Number(growth)>=0

  const TABS=[
    {id:"overview",      label:"Visão geral"},
    {id:"professionals", label:"Profissionais"},
    {id:"charts",        label:"Gráficos"},
    {id:"stock",         label:"Estoque"},
  ]

  return(
    <div style={{padding:"24px",maxWidth:960,margin:"0 auto"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>{shopName}</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Dashboard</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <select value={month} onChange={e=>setMonth(Number(e.target.value))}
            style={{fontSize:13,padding:"8px 12px",background:"var(--color-background-primary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",borderRadius:9,cursor:"pointer"}}>
            {MONTHS.map((m,i)=><option key={i} value={i}>{m} 2026</option>)}
          </select>
          <div style={{width:36,height:36,borderRadius:"50%",background:"var(--accent,#111)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"var(--accent-fg,#fff)",flexShrink:0}}>
            {session?.user?.name?.slice(0,2).toUpperCase()||"BS"}
          </div>
        </div>
      </div>

      {lowStock.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"var(--color-background-warning,#fffbeb)",border:"1px solid #fcd34d",borderRadius:10,marginBottom:16,fontSize:13,color:"#92400e"}}>
          ⚠️ <span><strong>{lowStock.length} produto{lowStock.length>1?"s":""} com estoque crítico</strong> · {lowStock.map((p:any)=>p.name).join(" · ")}</span>
        </div>
      )}

      <div style={{display:"flex",borderBottom:"1px solid var(--color-border-tertiary)",marginBottom:20,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"var(--color-text-primary)":"var(--color-text-tertiary)",borderBottom:tab===t.id?"2px solid var(--accent,#111)":"2px solid transparent",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── VISÃO GERAL ── */}
      {tab==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {[
              {label:"Faturamento bruto",val:BRL(receita),sub:`${growUp?"+":""}${growth}% vs mês ant.`,up:growUp,   Icon:TrendingUp},
              {label:"Custos totais",    val:BRL(custos), sub:"produtos + comissões",                   up:undefined,Icon:Package},
              {label:"Lucro líquido",   val:BRL(lucro),  sub:`Margem ${receita>0?Math.round(lucro/receita*100):0}%`,up:lucro>=0,Icon:TrendingUp},
              {label:"Atendimentos",    val:atendimentos, sub:`Ticket médio ${BRL(ticket)}`,             up:undefined,Icon:Users},
            ].map(k=>(
              <div key={k.label} style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontSize:10,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".05em"}}>{k.label}</div>
                  <k.Icon size={14} color="var(--color-text-tertiary)"/>
                </div>
                <div style={{fontSize:22,fontWeight:700,color:k.up===false?"#ef4444":k.up===true&&k.label==="Lucro líquido"?"#10b981":"var(--color-text-primary)"}}>{k.val}</div>
                <div style={{fontSize:12,marginTop:4,display:"flex",alignItems:"center",gap:4,color:k.up===true?"#10b981":k.up===false?"#ef4444":"var(--color-text-tertiary)"}}>
                  {k.up===true&&<TrendingUp size={11}/>}{k.up===false&&<TrendingDown size={11}/>}{k.sub}
                </div>
              </div>
            ))}
          </div>
          <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",marginBottom:12}}>Receita vs Lucro — 2026</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={MONTHLY} margin={{top:4,right:4,bottom:0,left:-16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"var(--color-text-tertiary)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"var(--color-text-tertiary)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={34}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="lucro"   name="Lucro"   fill="#10b981" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── PROFISSIONAIS com metas ── */}
      {tab==="professionals"&&(
        <div>
          {barbersQ.isLoading&&<div style={{textAlign:"center",padding:32,color:"var(--color-text-tertiary)"}}>Carregando…</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
            {(barbersQ.data??[]).map((b:any)=>(
              <BarberCard key={b.id} barber={b} stats={barberStatsQ.data?.[b.id]??{goals:[],totalMonth:0,cutsMonth:0}}/>
            ))}
          </div>
        </div>
      )}

      {/* ── GRÁFICOS ── */}
      {tab==="charts"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",marginBottom:12}}>Atendimentos mensais</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={MONTHLY} margin={{top:4,right:4,bottom:0,left:-16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"var(--color-text-tertiary)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"var(--color-text-tertiary)"}} axisLine={false} tickLine={false} width={30}/>
                <Tooltip content={<ChartTip/>}/>
                <Line type="monotone" dataKey="atendimentos" name="Atendimentos" stroke="#8b5cf6" strokeWidth={2} dot={{r:3,fill:"#8b5cf6"}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── ESTOQUE ── */}
      {tab==="stock"&&(
        <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"}}>
          {productsQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
          {!lowStock.length&&!productsQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Todos os produtos com estoque ok ✓</div>}
          {lowStock.map((p:any,i:number)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<lowStock.length-1?"1px solid var(--color-border-tertiary)":"none"}}>
              <div style={{width:10,height:10,borderRadius:"50%",background:"#ef4444",flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{p.name}</div>
                <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>Estoque: {p.stockQty} un. · Mínimo: {p.lowStockThreshold}</div>
              </div>
              <div style={{fontSize:11,padding:"2px 8px",borderRadius:5,background:"#fef2f2",color:"#dc2626",fontWeight:600}}>Crítico</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
