"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, X, Check, Users, Crown, AlertCircle, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"

const BRL=(v:number)=>"R$ "+Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})
const inp:React.CSSProperties={width:"100%",boxSizing:"border-box",background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"}

const PLAN_COLORS=["#f59e0b","#8b5cf6","#f97316"]
const STATUS_STYLE:Record<string,{label:string;bg:string;fg:string}>={
  ACTIVE:    {label:"Ativo",    bg:"#d1fae5",fg:"#065f46"},
  PENDING:   {label:"Pendente", bg:"#fef9c3",fg:"#713f12"},
  CANCELLED: {label:"Cancelado",bg:"#fee2e2",fg:"#991b1b"},
  EXPIRED:   {label:"Vencido",  bg:"#f3f4f6",fg:"#374151"},
}

interface Service {name:string;quota:number}
interface Plan    {id:string;name:string;price:number|string;services:Service[]|string;active:boolean}
interface Sub     {id:string;client_name:string;client_phone:string;plan_name:string;price:number|string;services:string|Service[];status:string;renewal_date:string;uses_this_month:number|string;usage_detail:any}

function parseServices(s:Service[]|string):Service[]{
  if(Array.isArray(s)) return s
  try{return JSON.parse(s as string)}catch{return[]}
}

// ── Modal: Novo Assinante ────────────────────────────────────
function AddSubModal({plans,onClose,onSave}:{plans:Plan[];onClose:()=>void;onSave:(d:any)=>void}){
  const [name,    setName]    = useState("")
  const [phone,   setPhone]   = useState("")
  const [planId,  setPlanId]  = useState(plans[0]?.id??"")
  const [pay,     setPay]     = useState("PIX")
  const [notes,   setNotes]   = useState("")
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState("")

  const handlePhone=(v:string)=>{
    const d=v.replace(/\D/g,"")
    if(d.length<=2) setPhone(d)
    else if(d.length<=7) setPhone(`(${d.slice(0,2)}) ${d.slice(2)}`)
    else if(d.length<=11) setPhone(`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`)
  }

  const plan = plans.find(p=>p.id===planId)

  const save=async()=>{
    if(!name.trim()||phone.replace(/\D/g,"").length<10||!planId){setErr("Preencha nome, WhatsApp e plano");return}
    setLoading(true);setErr("")
    await onSave({clientName:name,clientPhone:phone,planId,planName:plan?.name,price:plan?.price,services:parseServices(plan?.services??[]),paymentMethod:pay,notes})
    setLoading(false)
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"var(--color-background-primary)",borderRadius:14,width:"100%",maxWidth:460,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:"1px solid var(--color-border-tertiary)"}}>
          <div style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:8}}><Crown size={16} color="#f59e0b"/>Novo assinante</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",display:"flex"}}><X size={18}/></button>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
          {err&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",color:"#dc2626",borderRadius:8,padding:"9px 12px",fontSize:13}}>{err}</div>}
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Nome do cliente *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo" style={inp}/></div>
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>WhatsApp *</label><input value={phone} onChange={e=>handlePhone(e.target.value)} placeholder="(11) 99999-9999" style={inp}/></div>

          {/* Seleção do plano */}
          <div>
            <label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:8}}>Plano *</label>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {plans.map((p,i)=>{
                const svcs=parseServices(p.services)
                const sel=planId===p.id
                return(
                  <div key={p.id} onClick={()=>setPlanId(p.id)} style={{padding:"12px 14px",borderRadius:10,cursor:"pointer",border:sel?"2px solid var(--accent,#111)":"1px solid var(--color-border-secondary)",background:sel?"var(--color-background-secondary)":"var(--color-background-primary)"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:14,fontWeight:600,color:PLAN_COLORS[i%PLAN_COLORS.length]}}>{p.name}</span>
                      <span style={{fontSize:15,fontWeight:700,color:"var(--color-text-primary)"}}>{BRL(Number(p.price))}/mês</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                      {svcs.map(s=>(
                        <span key={s.name} style={{fontSize:11,color:"var(--color-text-tertiary)"}}>
                          • {s.quota===-1?"∞":s.quota}x {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagamento */}
          <div>
            <label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:8}}>Pagamento</label>
            <div style={{display:"flex",gap:8}}>
              {["PIX","Cartão","Dinheiro"].map(p=>(
                <button key={p} onClick={()=>setPay(p)} style={{flex:1,padding:"9px",borderRadius:8,border:pay===p?"none":"1px solid var(--color-border-secondary)",background:pay===p?"var(--accent,#111)":"var(--color-background-secondary)",color:pay===p?"var(--accent-fg,#fff)":"var(--color-text-secondary)",fontSize:12,cursor:"pointer",fontWeight:pay===p?600:400}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Observações</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} style={{...inp,resize:"none"} as any} placeholder="Ex: cobra todo dia 10…"/></div>
        </div>
        <div style={{padding:"0 20px 20px"}}>
          <button onClick={save} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",cursor:"pointer",background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {loading?"Salvando…":<><Check size={14}/>Adicionar assinante</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Linha de assinante ───────────────────────────────────────
function SubRow({sub,onUpdateStatus,onUse}:{sub:Sub;onUpdateStatus:(id:string,status:string)=>void;onUse:(id:string,svc:string)=>void}){
  const [expanded,setExpanded]=useState(false)
  const st=STATUS_STYLE[sub.status]??STATUS_STYLE.PENDING
  const services=parseServices(sub.services)
  const usageDetail:any[]=typeof sub.usage_detail==="string"?JSON.parse(sub.usage_detail||"[]"):sub.usage_detail??[]
  const usesThisMonth=usageDetail.length

  // Calcula uso por serviço no mês
  const usageMap:Record<string,number>={}
  usageDetail.forEach((u:any)=>{
    const k=u.service_name
    usageMap[k]=(usageMap[k]||0)+1
  })

  const renewal=sub.renewal_date?new Date(sub.renewal_date).toLocaleDateString("pt-BR"):"–"
  const expiringSoon=sub.renewal_date&&(new Date(sub.renewal_date).getTime()-Date.now())<7*86400000&&sub.status==="ACTIVE"

  return(
    <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden",marginBottom:10}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",cursor:"pointer"}} onClick={()=>setExpanded(v=>!v)}>
        <div style={{width:38,height:38,borderRadius:"50%",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"var(--color-text-secondary)",flexShrink:0}}>
          {sub.client_name[0]?.toUpperCase()}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>{sub.client_name}</div>
          <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:1}}>{sub.plan_name} · {BRL(Number(sub.price))}/mês</div>
        </div>
        <div style={{textAlign:"right",flexShrink:0,marginRight:8}}>
          <div style={{fontSize:10,padding:"3px 8px",borderRadius:10,background:st.bg,color:st.fg,fontWeight:600,display:"inline-block",marginBottom:3}}>{st.label}</div>
          {expiringSoon&&<div style={{fontSize:10,color:"#ef4444",display:"block"}}>⚠ Vence em breve</div>}
          {!expiringSoon&&<div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Renova: {renewal}</div>}
        </div>
        {expanded?<ChevronUp size={15} color="var(--color-text-tertiary)"/>:<ChevronDown size={15} color="var(--color-text-tertiary)"/>}
      </div>

      {expanded&&(
        <div style={{borderTop:"1px solid var(--color-border-tertiary)",padding:"14px 16px",background:"var(--color-background-secondary)"}}>
          <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginBottom:4}}>{sub.client_phone}</div>

          {/* Barras de uso por serviço */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Uso do mês</div>
            {services.map(svc=>{
              const used=usageMap[svc.name]||0
              const quota=svc.quota
              const pct=quota===-1?0:Math.min(Math.round(used/quota*100),100)
              const color=quota===-1?"#10b981":pct>=100?"#ef4444":pct>=70?"#f59e0b":"#3b82f6"
              return(
                <div key={svc.name} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span style={{color:"var(--color-text-secondary)",fontWeight:500}}>{svc.name}</span>
                    <span style={{color,fontWeight:700}}>{quota===-1?"∞":`${used}/${quota}`}</span>
                  </div>
                  {quota!==-1&&(
                    <div style={{height:7,borderRadius:4,background:"var(--color-border-tertiary)",overflow:"hidden",marginBottom:4}}>
                      <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:4,transition:"width .3s"}}/>
                    </div>
                  )}
                  {/* Botão dar baixa */}
                  {sub.status==="ACTIVE"&&(quota===-1||used<quota)&&(
                    <button onClick={()=>onUse(sub.id,svc.name)} style={{fontSize:11,padding:"4px 10px",borderRadius:6,border:"1px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-secondary)",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                      <Check size={11}/>Dar baixa
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          {/* Ações */}
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {sub.status==="PENDING"&&(
              <button onClick={()=>onUpdateStatus(sub.id,"ACTIVE")} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#10b981",color:"white",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                <Check size={13}/>Confirmar pagamento
              </button>
            )}
            {sub.status==="ACTIVE"&&(
              <button onClick={()=>onUpdateStatus(sub.id,"PENDING")} style={{padding:"8px 14px",borderRadius:8,border:"1px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-secondary)",fontSize:12,cursor:"pointer"}}>
                Aguardando renovação
              </button>
            )}
            {sub.status!=="CANCELLED"&&(
              <button onClick={()=>onUpdateStatus(sub.id,"CANCELLED")} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <X size={12}/>Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Painel principal ─────────────────────────────────────────
export default function ClientSubscriptionsPanel(){
  const qc=useQueryClient()
  const [tab,      setTab]      = useState<"subscribers"|"plans">("subscribers")
  const [addModal, setAddModal] = useState(false)
  const [filter,   setFilter]   = useState("ALL")
  const [useMsg,   setUseMsg]   = useState("")

  const plansQ=useQuery({
    queryKey:["sub-plans"],
    queryFn:()=>fetch("/api/subscriptions/plans").then(r=>r.json()).then(d=>d.data??[]),
  })
  const subsQ=useQuery({
    queryKey:["subscriptions",filter],
    queryFn:()=>fetch(`/api/subscriptions${filter!=="ALL"?`?status=${filter}`:""}`).then(r=>r.json()).then(d=>d.data??[]),
  })

  const plans:Plan[] = plansQ.data??[]
  const subs:Sub[]   = subsQ.data??[]

  const active  =subs.filter(s=>s.status==="ACTIVE").length
  const pending =subs.filter(s=>s.status==="PENDING").length
  const monthRev=subs.filter(s=>s.status==="ACTIVE").reduce((t,s)=>t+Number(s.price),0)

  const addMut=useMutation({
    mutationFn:(body:any)=>fetch("/api/subscriptions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["subscriptions"]});setAddModal(false)},
  })
  const statusMut=useMutation({
    mutationFn:({id,status}:{id:string;status:string})=>fetch(`/api/subscriptions/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}),
    onSuccess:()=>qc.invalidateQueries({queryKey:["subscriptions"]}),
  })
  const useMut=useMutation({
    mutationFn:({id,serviceName}:{id:string;serviceName:string})=>fetch(`/api/subscriptions/${id}/use`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({serviceName})}),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["subscriptions"]}); setUseMsg("✓ Baixa registrada!") ; setTimeout(()=>setUseMsg(""),2500) },
    onError:(e:any)=>setUseMsg(e.message||"Erro ao dar baixa"),
  })

  return(
    <div style={{padding:"24px",maxWidth:860,margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Clube de Assinaturas</div>
        </div>
        {tab==="subscribers"&&(
          <button onClick={()=>setAddModal(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:"var(--accent,#111)",color:"var(--accent-fg,#fff)"}}>
            <Plus size={15}/>Novo assinante
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[
          {label:"Assinantes ativos", val:active,        Icon:Crown,  color:"#10b981"},
          {label:"Aguardando pagto",  val:pending,       Icon:AlertCircle,color:"#f59e0b"},
          {label:"Receita mensal",    val:BRL(monthRev), Icon:Users,  color:"#3b82f6"},
        ].map(k=>(
          <div key={k.label} style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,padding:"14px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:10,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em"}}>{k.label}</div>
              <k.Icon size={13} color={k.color}/>
            </div>
            <div style={{fontSize:22,fontWeight:700,color:k.color}}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Feedback de uso */}
      {useMsg&&<div style={{background:"#d1fae5",border:"1px solid #a7f3d0",color:"#065f46",borderRadius:9,padding:"10px 14px",fontSize:13,marginBottom:12,fontWeight:500}}>{useMsg}</div>}

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid var(--color-border-tertiary)",marginBottom:20}}>
        {[{id:"subscribers",label:"Assinantes"},{id:"plans",label:"Planos"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)} style={{padding:"9px 16px",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"var(--color-text-primary)":"var(--color-text-tertiary)",borderBottom:tab===t.id?"2px solid var(--accent,#111)":"2px solid transparent"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ASSINANTES ── */}
      {tab==="subscribers"&&(
        <>
          {/* Filtros */}
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            {[["ALL","Todos"],["ACTIVE","Ativos"],["PENDING","Pendentes"],["CANCELLED","Cancelados"]].map(([v,l])=>(
              <button key={v} onClick={()=>setFilter(v)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid var(--color-border-secondary)",background:filter===v?"var(--accent,#111)":"var(--color-background-primary)",color:filter===v?"var(--accent-fg,#fff)":"var(--color-text-secondary)",fontSize:12,cursor:"pointer",fontWeight:filter===v?600:400}}>
                {l}
              </button>
            ))}
          </div>
          {subsQ.isLoading&&<div style={{textAlign:"center",padding:32,color:"var(--color-text-tertiary)"}}>Carregando…</div>}
          {!subs.length&&!subsQ.isLoading&&(
            <div style={{textAlign:"center",padding:40,color:"var(--color-text-tertiary)"}}>
              <Crown size={32} style={{margin:"0 auto 10px",opacity:.3}}/>
              <div>Nenhum assinante ainda</div>
              <button onClick={()=>setAddModal(true)} style={{marginTop:12,padding:"9px 18px",borderRadius:9,border:"none",background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",fontSize:13,cursor:"pointer"}}>+ Adicionar primeiro assinante</button>
            </div>
          )}
          {subs.map(s=>(
            <SubRow key={s.id} sub={s}
              onUpdateStatus={(id,status)=>statusMut.mutate({id,status})}
              onUse={(id,svc)=>useMut.mutate({id,serviceName:svc})}/>
          ))}
        </>
      )}

      {/* ── PLANOS ── */}
      {tab==="plans"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
          {plansQ.isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
          {plans.map((p,i)=>{
            const svcs=parseServices(p.services)
            const color=PLAN_COLORS[i%PLAN_COLORS.length]
            const count=subs.filter(s=>s.plan_name===p.name&&s.status==="ACTIVE").length
            return(
              <div key={p.id} style={{background:"var(--color-background-primary)",border:`2px solid ${color}30`,borderRadius:14,padding:18,position:"relative"}}>
                <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:".06em",color,fontWeight:700,marginBottom:4}}>Plano</div>
                <div style={{fontSize:18,fontWeight:700,color:"var(--color-text-primary)",marginBottom:2}}>{p.name}</div>
                <div style={{fontSize:22,fontWeight:800,color,marginBottom:14}}>{BRL(Number(p.price))}<span style={{fontSize:13,fontWeight:400,color:"var(--color-text-tertiary)"}}>/mês</span></div>
                <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
                  {svcs.map(s=>(
                    <div key={s.name} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"var(--color-text-secondary)"}}>
                      <Check size={13} color={color}/>{s.quota===-1?"∞":s.quota}x {s.name}
                    </div>
                  ))}
                </div>
                <div style={{fontSize:12,color:"var(--color-text-tertiary)",borderTop:"1px solid var(--color-border-tertiary)",paddingTop:10}}>
                  <strong style={{color:"var(--color-text-primary)"}}>{count}</strong> assinante{count!==1?"s":""} ativo{count!==1?"s":""}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {addModal&&<AddSubModal plans={plans} onClose={()=>setAddModal(false)} onSave={async d=>addMut.mutate(d)}/>}
    </div>
  )
}
