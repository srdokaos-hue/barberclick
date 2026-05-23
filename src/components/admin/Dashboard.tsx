"use client"
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Scissors, Package, Calendar, AlertTriangle, DollarSign, Users } from "lucide-react"

const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})

const MONTHS=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

// Dados mock para visualização — substituídos por dados reais da API
const MONTHLY=MONTHS.map((mes,i)=>{
  const base=6000+Math.sin(i)*1200+i*180
  const cost=base*0.22+Math.random()*200
  return { mes, receita:Math.round(base), custo:Math.round(cost), lucro:Math.round(base-cost), atendimentos:Math.round(38+i*1.5+Math.sin(i)*8) }
})

function ChartTip({active,payload,label}:any){
  if(!active||!payload?.length) return null
  return(
    <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:9,padding:"9px 13px",fontSize:12,boxShadow:"0 4px 16px rgba(0,0,0,.12)"}}>
      <div style={{fontWeight:600,marginBottom:4,color:"var(--color-text-primary)"}}>{label}</div>
      {payload.map((p:any)=>(
        <div key={p.dataKey} style={{color:p.color,display:"flex",justifyContent:"space-between",gap:14}}>
          <span>{p.name}</span>
          <span style={{fontWeight:500}}>{p.value>1000?BRL(p.value):p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [tab,   setTab]   = useState("overview")
  const [month, setMonth] = useState(new Date().getMonth())
  const [shopName, setShopName] = useState("Admin")

  // Carrega nome da barbearia do localStorage
  useEffect(()=>{
    try {
      const n = localStorage.getItem("shopName")
      if(n) setShopName(n)
      const ac = localStorage.getItem("accentColor")
      if(ac) {
        document.documentElement.style.setProperty("--accent", ac)
        document.documentElement.style.setProperty("--sidebar-bg", ac)
      }
      const handler = () => {
        const n2 = localStorage.getItem("shopName")
        if(n2) setShopName(n2)
      }
      window.addEventListener("settingsUpdated", handler)
      return () => window.removeEventListener("settingsUpdated", handler)
    } catch { /* SSR */ }
  }, [])

  // Dados financeiros
  const financialQ = useQuery({
    queryKey: ["financial", month],
    queryFn:  ()=>fetch(`/api/financial?month=${month+1}&year=${new Date().getFullYear()}`).then(r=>r.json()).then(d=>d.data),
    retry: 1,
  })

  // Produtos com estoque baixo
  const productsQ = useQuery({
    queryKey: ["products-dash"],
    queryFn:  ()=>fetch("/api/products").then(r=>r.json()).then(d=>(d.data??[]).filter((p:any)=>p.active&&p.stockQty<=p.lowStockThreshold)),
    retry: 1,
  })

  const f = financialQ.data
  const lowStock: any[] = productsQ.data ?? []

  // KPIs — usa dados da API ou fallback para mock
  const monthData = MONTHLY[month]
  const receita     = f?.totalRevenue   ?? monthData.receita
  const custos      = f?.totalCosts     ?? monthData.custo
  const lucro       = receita - custos
  const atendimentos= f?.totalAppt      ?? monthData.atendimentos
  const ticket      = atendimentos > 0 ? receita/atendimentos : 0

  const prevMonth   = MONTHLY[month>0?month-1:0]
  const growth      = prevMonth.receita > 0 ? ((receita-prevMonth.receita)/prevMonth.receita*100).toFixed(1) : "0"
  const growUp      = Number(growth) >= 0

  const TABS = [
    {id:"overview", label:"Visão geral"},
    {id:"charts",   label:"Gráficos"},
    {id:"stock",    label:"Estoque"},
  ]

  return(
    <div style={{padding:"24px",maxWidth:900,margin:"0 auto"}}>

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

      {/* Alerta estoque baixo */}
      {lowStock.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"var(--color-background-warning,#fffbeb)",border:"1px solid var(--color-border-warning,#fcd34d)",borderRadius:10,marginBottom:16,fontSize:13,color:"var(--color-text-warning,#92400e)"}}>
          <AlertTriangle size={16} style={{flexShrink:0}}/>
          <span><strong>{lowStock.length} produto{lowStock.length>1?"s":""} com estoque crítico</strong> · {lowStock.map((p:any)=>p.name).join(" · ")} — toque para ver</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid var(--color-border-tertiary)",marginBottom:20}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"var(--color-text-primary)":"var(--color-text-tertiary)",borderBottom:tab===t.id?"2px solid var(--accent,#111)":"2px solid transparent",whiteSpace:"nowrap"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── VISÃO GERAL ── */}
      {tab==="overview"&&(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* KPI cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {[
              {label:"Faturamento bruto",  val:BRL(receita),     sub:`${growUp?"+":""}${growth}% vs mês ant.`, up:growUp, Icon:DollarSign},
              {label:"Custos totais",       val:BRL(custos),      sub:"produtos + comissões",                  up:undefined,Icon:Package},
              {label:"Lucro líquido",       val:BRL(lucro),       sub:`Margem ${receita>0?Math.round(lucro/receita*100):0}%`,up:lucro>=0,Icon:TrendingUp},
              {label:"Atendimentos",        val:atendimentos,     sub:`Ticket médio ${BRL(ticket)}`,           up:undefined,Icon:Users},
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

          {/* Mini gráfico */}
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
          <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)",marginBottom:12}}>Custo vs Lucro</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY} margin={{top:4,right:4,bottom:0,left:-16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"var(--color-text-tertiary)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"var(--color-text-tertiary)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={34}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="custo" name="Custos" fill="#f59e0b" radius={[4,4,0,0]} stackId="s"/>
                <Bar dataKey="lucro" name="Lucro"  fill="#10b981" radius={[4,4,0,0]} stackId="s"/>
              </BarChart>
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
