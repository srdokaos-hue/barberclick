"use client"
import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Calendar, Check } from "lucide-react"

const rng = (s:number) => { let x=s; for(let i=0;i<6;i++) x=x*16807%2147483647; return x }

const MONTHLY = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map((mes,i)=>{
  const seasonal=[1.05,1.0,0.95,1.0,1.05,0.9,1.1,1.0,1.05,1.0,1.15,1.2][i]
  const r=Math.round(7800*seasonal*(0.88+(rng(i*3+1)%280)/1000))
  const c=Math.round(r*(0.20+(rng(i*3+2)%70)/1000))
  const a=Math.round(42+(rng(i*3+3)%22))
  const h=Math.round(r*(0.55+(rng(i*4+1)%100)/1000))
  return {mes,idx:i,receita:r,custo:c,lucro:r-c,atendimentos:a,henrique:h,igor:r-h}
})

const SERVICES=[
  {name:"Corte + Barba",   receita:31200,atend:520},
  {name:"Corte Masculino", receita:24000,atend:600},
  {name:"Barba",           receita:13500,atend:450},
  {name:"Corte Navalhado", receita:9400, atend:188},
  {name:"Hidratação",      receita:6800, atend:151},
]
const TOP_CLIENTS=[
  {name:"Lucas Martins", visits:18,spent:1080},
  {name:"Carlos Silva",  visits:12,spent:720},
  {name:"Felipe Rocha",  visits:9, spent:540},
  {name:"Rafael Souza",  visits:8, spent:480},
  {name:"Marcos Santos", visits:6, spent:360},
]

const BRL=(v:number)=>"R$ "+(+v).toLocaleString("pt-BR",{minimumFractionDigits:2})
const fmtDate=(iso:string)=>new Date(iso+"T12:00:00").toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"})

type PeriodId="3m"|"6m"|"ano"|"custom"
const PRESETS=[
  {id:"3m"  as PeriodId,label:"3 meses",n:3 },
  {id:"6m"  as PeriodId,label:"6 meses",n:6 },
  {id:"ano" as PeriodId,label:"Ano",    n:12},
]

const ChartTip=({active,payload,label}:any)=>{
  if(!active||!payload?.length) return null
  return (
    <div style={{background:"var(--bg-card)",border:"1px solid var(--border-2)",borderRadius:9,padding:"9px 13px",fontSize:12,boxShadow:"var(--shadow)"}}>
      <div style={{fontWeight:600,marginBottom:4,color:"var(--text)"}}>{label}</div>
      {payload.map((p:any)=>(
        <div key={p.dataKey} style={{color:p.color,display:"flex",justifyContent:"space-between",gap:14}}>
          <span>{p.name}</span>
          <span style={{fontWeight:500}}>{p.value>1000?BRL(p.value):p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Reports() {
  const [period, setPeriod] = useState<PeriodId>("6m")

  // Valores nos inputs (ainda não aplicados)
  const [startInput, setStartInput] = useState("2026-01-01")
  const [endInput,   setEndInput]   = useState("2026-12-31")

  // Valores APLICADOS (só mudam ao clicar em Aplicar)
  const [appliedStart, setAppliedStart] = useState("2026-01-01")
  const [appliedEnd,   setAppliedEnd]   = useState("2026-12-31")
  const [pendingChange, setPendingChange] = useState(false)

  const handleStartChange = (v:string) => { setStartInput(v); setPendingChange(true) }
  const handleEndChange   = (v:string) => { setEndInput(v);   setPendingChange(true) }

  const applyPeriod = () => {
    setAppliedStart(startInput)
    setAppliedEnd(endInput)
    setPendingChange(false)
  }

  const data = useMemo(()=>{
    if(period==="custom"){
      const start = new Date(appliedStart+"T00:00:00")
      const end   = new Date(appliedEnd  +"T23:59:59")
      return MONTHLY.filter(d=>{
        const mStart = new Date(2026, d.idx, 1)
        const mEnd   = new Date(2026, d.idx+1, 0, 23, 59, 59)
        return mStart <= end && mEnd >= start
      })
    }
    const n = PRESETS.find(p=>p.id===period)?.n??6
    return MONTHLY.slice(-n)
  },[period, appliedStart, appliedEnd])

  const prev = useMemo(()=>{
    if(period==="custom") return []
    const n = PRESETS.find(p=>p.id===period)?.n??6
    return MONTHLY.slice(-n*2,-n)
  },[period])

  const totRec  = data.reduce((s,d)=>s+d.receita,0)
  const totLuc  = data.reduce((s,d)=>s+d.lucro,0)
  const totAppt = data.reduce((s,d)=>s+d.atendimentos,0)
  const prevRec = prev.reduce((s,d)=>s+d.receita,0)
  const growth  = prevRec>0?((totRec-prevRec)/prevRec*100).toFixed(1):null
  const growUp  = growth!==null&&Number(growth)>=0
  const svcMax  = Math.max(...SERVICES.map(s=>s.receita))

  const periodLabel = period==="custom"
    ? `${fmtDate(appliedStart)} – ${fmtDate(appliedEnd)}`
    : PRESETS.find(p=>p.id===period)?.label

  return (
    <div style={{padding:"24px",maxWidth:680,margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--text)"}}>Relatórios</div>
        </div>
        <div style={{display:"flex",background:"var(--bg-hover)",borderRadius:10,padding:3,border:"1px solid var(--border)"}}>
          {PRESETS.map(p=>(
            <button key={p.id} onClick={()=>setPeriod(p.id)} style={{
              padding:"7px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:500,
              background:period===p.id?"var(--bg-card)":"transparent",
              color:period===p.id?"var(--text)":"var(--text-3)",
              boxShadow:period===p.id?"var(--shadow)":"none",
            }}>{p.label}</button>
          ))}
          <button onClick={()=>{setPeriod("custom");setPendingChange(false)}} style={{
            padding:"7px 14px",borderRadius:8,border:"none",fontSize:12,fontWeight:500,
            display:"flex",alignItems:"center",gap:5,
            background:period==="custom"?"var(--bg-card)":"transparent",
            color:period==="custom"?"var(--text)":"var(--text-3)",
            boxShadow:period==="custom"?"var(--shadow)":"none",
          }}>
            <Calendar size={12}/>Período
          </button>
        </div>
      </div>

      {/* ── Seletor de datas ── */}
      {period==="custom"&&(
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",marginBottom:14,boxShadow:"var(--shadow)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Selecione o período</div>
            <div style={{fontSize:11,color:"var(--text-4)"}}>Dados disponíveis: Jan – Dez 2026</div>
          </div>

          <div style={{display:"flex",alignItems:"flex-end",gap:10,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:130}}>
              <label style={{fontSize:11,color:"var(--text-4)",display:"block",marginBottom:5}}>Data inicial</label>
              <input
                type="date" value={startInput} max={endInput}
                onChange={e=>handleStartChange(e.target.value)}
                style={{width:"100%",fontSize:13,
                  borderColor:pendingChange?"var(--warn)":"var(--border-2)"}}
              />
            </div>
            <div style={{fontSize:18,color:"var(--text-4)",paddingBottom:8,flexShrink:0}}>→</div>
            <div style={{flex:1,minWidth:130}}>
              <label style={{fontSize:11,color:"var(--text-4)",display:"block",marginBottom:5}}>Data final</label>
              <input
                type="date" value={endInput} min={startInput}
                onChange={e=>handleEndChange(e.target.value)}
                style={{width:"100%",fontSize:13,
                  borderColor:pendingChange?"var(--warn)":"var(--border-2)"}}
              />
            </div>

            {/* Botão Aplicar */}
            <button
              onClick={applyPeriod}
              style={{
                padding:"9px 20px",borderRadius:9,border:"none",cursor:"pointer",
                background:pendingChange?"var(--accent)":"var(--bg-hover)",
                color:pendingChange?"var(--accent-fg)":"var(--text-3)",
                fontSize:13,fontWeight:600,flexShrink:0,
                display:"flex",alignItems:"center",gap:6,
                boxShadow:pendingChange?"0 0 0 3px rgba(0,0,0,.1)":"none",
                transition:"all .2s",
              }}
            >
              {pendingChange ? (
                <><Check size={14}/>Aplicar</>
              ) : (
                <><Check size={14}/>Aplicado</>
              )}
            </button>
          </div>

          {/* Aviso quando está com alteração pendente */}
          {pendingChange&&(
            <div style={{marginTop:10,fontSize:12,color:"#f59e0b",display:"flex",alignItems:"center",gap:5}}>
              ⚠ Clique em <strong>Aplicar</strong> para atualizar os gráficos
            </div>
          )}

          {/* Sem dados no período */}
          {!pendingChange&&data.length===0&&(
            <div style={{marginTop:10,fontSize:12,color:"#ef4444"}}>
              Nenhum dado no período selecionado. Os dados disponíveis são de Jan a Dez de 2026.
            </div>
          )}
        </div>
      )}

      {data.length===0 ? (
        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"40px",textAlign:"center",color:"var(--text-4)",fontSize:14,boxShadow:"var(--shadow)"}}>
          Sem dados para o período selecionado
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>

          {/* KPIs */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[
              {label:"Faturamento",  val:BRL(totRec),sub:growth?`${growUp?"+":""}${growth}% vs ant.`:"–",up:growUp},
              {label:"Lucro líquido",val:BRL(totLuc),sub:`Margem ${(totLuc/totRec*100).toFixed(1)}%`,up:undefined},
              {label:"Atendimentos", val:totAppt,    sub:`Ticket ${BRL(Math.round(totRec/totAppt))}`,up:undefined},
            ].map((k,i)=>(
              <div key={i} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:11,padding:"13px 14px",boxShadow:"var(--shadow)"}}>
                <div style={{fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".04em",marginBottom:4}}>{k.label}</div>
                <div style={{fontSize:18,fontWeight:600,color:"var(--text)",lineHeight:1.2}}>{k.val}</div>
                <div style={{fontSize:11,marginTop:3,display:"flex",alignItems:"center",gap:3,
                  color:k.up===true?"#10b981":k.up===false?"#ef4444":"var(--text-3)"}}>
                  {k.up===true&&<TrendingUp size={11}/>}
                  {k.up===false&&<TrendingDown size={11}/>}
                  {k.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Receita vs lucro */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"var(--shadow)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Receita vs lucro</div>
              <div style={{fontSize:11,color:"var(--text-4)"}}>{periodLabel}</div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={data} margin={{top:4,right:4,bottom:0,left:-16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"var(--text-4)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"var(--text-4)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={36}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="receita" name="Receita" fill="#3b82f6" radius={[4,4,0,0]}/>
                <Bar dataKey="lucro"   name="Lucro"   fill="#10b981" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <div style={{display:"flex",gap:16,marginTop:8,fontSize:11,paddingLeft:4}}>
              {[["#3b82f6","Receita"],["#10b981","Lucro"]].map(([c,l])=>(
                <span key={l} style={{display:"flex",alignItems:"center",gap:4,color:c}}>
                  <span style={{width:12,height:10,background:c,display:"inline-block",borderRadius:2}}/>{l}
                </span>
              ))}
            </div>
          </div>

          {/* Por profissional */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"var(--shadow)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:12}}>Por profissional (empilhado)</div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={data} margin={{top:4,right:4,bottom:0,left:-16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"var(--text-4)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"var(--text-4)"}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} width={36}/>
                <Tooltip content={<ChartTip/>}/>
                <Bar dataKey="henrique" name="Henrique" stackId="s" fill="#3b82f6" radius={[0,0,0,0]}/>
                <Bar dataKey="igor"     name="Igor"     stackId="s" fill="#8b5cf6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Serviços */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"var(--shadow)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:14}}>Serviços mais rentáveis</div>
            {SERVICES.map((s,i)=>(
              <div key={i} style={{marginBottom:i<SERVICES.length-1?12:0}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:5}}>
                  <span style={{fontWeight:500,color:"var(--text)"}}>{s.name}</span>
                  <span style={{color:"var(--text-3)"}}>{BRL(s.receita)} · {s.atend} atend.</span>
                </div>
                <div style={{height:7,borderRadius:4,background:"var(--bg-hover)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${s.receita/svcMax*100}%`,background:`hsl(${220-i*28},65%,${52+i*3}%)`,borderRadius:4}}/>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket médio */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"var(--shadow)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:12}}>Ticket médio — evolução</div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={data.map(d=>({...d,ticket:Math.round(d.receita/d.atendimentos)}))} margin={{top:4,right:4,bottom:0,left:-16}}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="mes" tick={{fontSize:11,fill:"var(--text-4)"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"var(--text-4)"}} axisLine={false} tickLine={false} tickFormatter={v=>`R$${v}`} width={48}/>
                <Tooltip formatter={(v:any)=>[BRL(v),"Ticket médio"]}/>
                <Line type="monotone" dataKey="ticket" stroke="#f59e0b" strokeWidth={2} dot={{r:3,fill:"#f59e0b"}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top clientes */}
          <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"16px",boxShadow:"var(--shadow)"}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:12}}>Top 5 clientes por receita</div>
            {[...TOP_CLIENTS].sort((a,b)=>b.spent-a.spent).map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<TOP_CLIENTS.length-1?"1px solid var(--border)":"none"}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:["#fef9c3","#f3f4f6","#fef3c7","var(--bg-hover)","var(--bg-hover)"][i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:["#713f12","#374151","#92400e","var(--text-3)","var(--text-3)"][i],flexShrink:0}}>{i+1}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--text)"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"var(--text-4)"}}>{c.visits} visitas no período</div>
                </div>
                <div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>{BRL(c.spent)}</div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  )
}
