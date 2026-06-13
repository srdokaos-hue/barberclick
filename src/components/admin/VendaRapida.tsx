"use client"
import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { X, Check, Zap, User, Scissors, ShoppingBag, CreditCard, Banknote, Smartphone } from "lucide-react"

const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})
const inp:React.CSSProperties={width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #334155",color:"white",fontSize:14,borderRadius:8,padding:"9px 12px"}

interface VRProps { onClose: ()=>void; defaultBarberId?: string }

export default function VendaRapida({ onClose, defaultBarberId }: VRProps) {
  const qc = useQueryClient()
  const [clientName,  setClientName]  = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [barberId,    setBarberId]    = useState(defaultBarberId??"")
  const [selSvcs,     setSelSvcs]     = useState<string[]>([])
  const [selProds,    setSelProds]    = useState<string[]>([])
  const [payment,     setPayment]     = useState("PIX")
  const [loading,     setLoading]     = useState(false)
  const [done,        setDone]        = useState(false)
  const [error,       setError]       = useState("")

  const barbersQ  = useQuery({ queryKey:["barbers-vr"],  queryFn:()=>fetch("/api/barbers").then(r=>r.json()).then(d=>d.data??[]) })
  const servicesQ = useQuery({ queryKey:["services-vr"], queryFn:()=>fetch("/api/services").then(r=>r.json()).then(d=>d.data??[]) })
  const productsQ = useQuery({ queryKey:["products-vr"], queryFn:()=>fetch("/api/products").then(r=>r.json()).then(d=>d.data??[]).then((d:any[])=>d.filter(p=>p.active)) })

  const barbers  = barbersQ.data  ?? []
  const services = servicesQ.data ?? []
  const products = productsQ.data ?? []

  const totalSvcs  = services.filter((s:any)=>selSvcs.includes(s.id)).reduce((t:number,s:any)=>t+Number(s.price),0)
  const totalProds = products.filter((p:any)=>selProds.includes(p.id)).reduce((t:number,p:any)=>t+Number(p.salePrice),0)
  const total = totalSvcs+totalProds

  const toggleSvc=(id:string)=>setSelSvcs(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])
  const toggleProd=(id:string)=>setSelProds(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id])

  const handlePhone=(v:string)=>{
    const d=v.replace(/\D/g,"")
    if(d.length<=2)       setClientPhone(d)
    else if(d.length<=7)  setClientPhone(`(${d.slice(0,2)}) ${d.slice(2)}`)
    else if(d.length<=11) setClientPhone(`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`)
  }

  async function submit() {
    if(!barberId)             { setError("Selecione um barbeiro"); return }
    if(!selSvcs.length&&!selProds.length) { setError("Selecione pelo menos um serviço ou produto"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/sales",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ clientName, clientPhone, barberId, serviceIds:selSvcs, productIds:selProds, paymentMethod:payment }),
    })
    const data = await res.json()
    setLoading(false)
    if(!res.ok) { setError(data.error||"Erro ao registrar"); return }
    qc.invalidateQueries({ queryKey:["appointments-day"] })
    setDone(true)
    setTimeout(onClose, 1800)
  }

  const PAY=[
    {id:"PIX",    label:"PIX",    Icon:Smartphone},
    {id:"CARD",   label:"Cartão", Icon:CreditCard},
    {id:"CASH",   label:"Dinheiro",Icon:Banknote},
  ]

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.75)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"#1e293b",borderRadius:18,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column",border:"1px solid #334155",boxShadow:"0 24px 80px rgba(0,0,0,.5)"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{padding:"18px 20px",borderBottom:"1px solid #334155",display:"flex",alignItems:"center",gap:10,background:"#0f172a"}}>
          <div style={{width:36,height:36,borderRadius:10,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Zap size={18} color="white"/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:"white"}}>Venda Rápida</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Registra a venda instantaneamente</div>
          </div>
          <button onClick={onClose} style={{background:"transparent",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",padding:4,display:"flex"}}><X size={20}/></button>
        </div>

        {done ? (
          <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:32,gap:12}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Check size={32} color="#065f46"/>
            </div>
            <div style={{fontSize:18,fontWeight:700,color:"white"}}>Venda registrada!</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,.5)"}}>{BRL(total)} · {payment}</div>
          </div>
        ) : (
          <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:16}}>

            {error&&<div style={{background:"#450a0a",border:"1px solid #7f1d1d",color:"#f87171",borderRadius:9,padding:"10px 14px",fontSize:13}}>{error}</div>}

            {/* Cliente */}
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                <User size={11}/>Cliente (opcional)
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <input value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Nome" style={inp}/>
                <input value={clientPhone} onChange={e=>handlePhone(e.target.value)} placeholder="WhatsApp" style={inp}/>
              </div>
            </div>

            {/* Barbeiro */}
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                <Scissors size={11}/>Barbeiro *
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {barbers.map((b:any)=>(
                  <div key={b.id} onClick={()=>setBarberId(b.id)} style={{
                    flex:1,minWidth:100,padding:"10px 14px",borderRadius:10,cursor:"pointer",textAlign:"center",
                    background:barberId===b.id?"white":"rgba(255,255,255,.06)",
                    border:barberId===b.id?"none":"1px solid #334155",
                    color:barberId===b.id?"#111":"white",
                  }}>
                    <div style={{fontSize:13,fontWeight:600}}>{b.name}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Serviços */}
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                <Scissors size={11}/>Serviços
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {services.map((s:any)=>{
                  const sel=selSvcs.includes(s.id)
                  return(
                    <div key={s.id} onClick={()=>toggleSvc(s.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,cursor:"pointer",background:sel?"rgba(0,0,0,.15)":"rgba(255,255,255,.04)",border:sel?"1px solid var(--accent)":"1px solid #334155"}}>
                      <div style={{width:18,height:18,borderRadius:5,border:sel?"none":"1px solid #475569",background:sel?"var(--accent)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        {sel&&<Check size={11} color="white"/>}
                      </div>
                      <span style={{flex:1,fontSize:13,color:"white"}}>{s.name}</span>
                      <span style={{fontSize:13,fontWeight:600,color:sel?"#a5b4fc":"rgba(255,255,255,.5)"}}>{BRL(Number(s.price))}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Produtos */}
            {products.length>0&&(
              <div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8,display:"flex",alignItems:"center",gap:5}}>
                  <ShoppingBag size={11}/>Produtos
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {products.map((p:any)=>{
                    const sel=selProds.includes(p.id)
                    return(
                      <div key={p.id} onClick={()=>toggleProd(p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:9,cursor:"pointer",background:sel?"rgba(16,185,129,.15)":"rgba(255,255,255,.04)",border:sel?"1px solid #10b981":"1px solid #334155"}}>
                        <div style={{width:18,height:18,borderRadius:5,border:sel?"none":"1px solid #475569",background:sel?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          {sel&&<Check size={11} color="white"/>}
                        </div>
                        <span style={{flex:1,fontSize:13,color:"white"}}>{p.name}</span>
                        <span style={{fontSize:13,fontWeight:600,color:sel?"#6ee7b7":"rgba(255,255,255,.5)"}}>{BRL(Number(p.salePrice))}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pagamento */}
            <div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:8}}>Pagamento</div>
              <div style={{display:"flex",gap:8}}>
                {PAY.map(p=>(
                  <button key={p.id} onClick={()=>setPayment(p.id)} style={{flex:1,padding:"10px 8px",borderRadius:9,border:payment===p.id?"none":"1px solid #334155",background:payment===p.id?"white":"rgba(255,255,255,.04)",color:payment===p.id?"#111":"rgba(255,255,255,.6)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,fontSize:12,fontWeight:500}}>
                    <p.Icon size={16}/>{p.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Footer */}
        {!done&&(
          <div style={{padding:"14px 20px",borderTop:"1px solid #334155",background:"#0f172a"}}>
            {total>0&&(
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,fontSize:13,color:"rgba(255,255,255,.6)"}}>
                <span>Total</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:700,color:"white"}}>{BRL(total)}</div>
                </div>
              </div>
            )}
            <button onClick={submit} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",cursor:"pointer",background:"var(--accent)",color:"var(--accent-fg)",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              {loading?"Registrando…":<><Zap size={15}/>Confirmar venda · {BRL(total)}</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
