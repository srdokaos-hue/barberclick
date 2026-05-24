"use client"
import { useState } from "react"
import { Check, Crown, X, ArrowRight, Star, Shield, Clock, Scissors, ChevronDown, ChevronUp } from "lucide-react"

const BRL=(v:number)=>"R$ "+Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})

interface Service { name:string; quota:number }
interface Plan    { id:string; name:string; price:number|string; services:Service[]|string }
interface Props   {
  shop:        { name:string; logoUrl?:string|null; whatsapp?:string|null }
  plans:       Plan[]
  activeCount: number
  slug:        string
}

function parseServices(s:Service[]|string):Service[]{
  if(Array.isArray(s)) return s
  try{return JSON.parse(s as string)}catch{return[]}
}

// Modal de assinatura
function SubscribeModal({plan,slug,whatsapp,onClose}:{plan:Plan;slug:string;whatsapp?:string|null;onClose:()=>void}){
  const [name,    setName]    = useState("")
  const [phone,   setPhone]   = useState("")
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [err,     setErr]     = useState("")

  const handlePhone=(v:string)=>{
    const d=v.replace(/\D/g,"")
    if(d.length<=2) setPhone(d)
    else if(d.length<=7) setPhone(`(${d.slice(0,2)}) ${d.slice(2)}`)
    else if(d.length<=11) setPhone(`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`)
  }

  const services = parseServices(plan.services)

  const submit=async()=>{
    if(!name.trim()||phone.replace(/\D/g,"").length<10){setErr("Preencha seu nome e WhatsApp");return}
    setLoading(true); setErr("")
    const res = await fetch(`/api/public/${slug}/subscribe`,{
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({clientName:name,clientPhone:phone,planId:plan.id,planName:plan.name,price:plan.price,services}),
    })
    if(!res.ok){setErr("Erro ao processar. Tente novamente.");setLoading(false);return}
    setDone(true); setLoading(false)
    // Redireciona para WhatsApp após 1.5s
    const waNum=(whatsapp||"").replace(/\D/g,"")
    const msg=encodeURIComponent(`Olá! Quero assinar o *Plano ${plan.name}* - ${BRL(Number(plan.price))}/mês.\nMeu nome: ${name}\nMeu WhatsApp: ${phone}`)
    if(waNum) setTimeout(()=>window.open(`https://wa.me/${waNum}?text=${msg}`,"_blank"),1500)
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0"}} onClick={onClose}>
      <div style={{background:"#111",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto",border:"1px solid #222"}} onClick={e=>e.stopPropagation()}>

        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 0"}}>
          <div style={{width:40,height:4,borderRadius:2,background:"#333"}}/>
        </div>

        <div style={{padding:"16px 24px 32px"}}>
          {!done?(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,color:"#f59e0b",textTransform:"uppercase",letterSpacing:".08em",fontWeight:700,marginBottom:3}}>Assinar agora</div>
                  <div style={{fontSize:20,fontWeight:800,color:"white"}}>{plan.name}</div>
                  <div style={{fontSize:22,fontWeight:800,color:"#f59e0b"}}>{BRL(Number(plan.price))}<span style={{fontSize:13,color:"#666"}}>/mês</span></div>
                </div>
                <button onClick={onClose} style={{background:"#222",border:"none",width:36,height:36,borderRadius:"50%",cursor:"pointer",color:"#666",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={18}/></button>
              </div>

              {/* O que inclui */}
              <div style={{background:"#0a0a0a",borderRadius:12,padding:"14px",marginBottom:20}}>
                {services.map(s=>(
                  <div key={s.name} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:13,color:"#aaa"}}>
                    <Check size={14} color="#f59e0b"/>{s.quota===-1?"∞":s.quota}x {s.name} por mês
                  </div>
                ))}
              </div>

              {err&&<div style={{background:"#1a0000",border:"1px solid #500",color:"#f87171",borderRadius:9,padding:"10px 14px",fontSize:13,marginBottom:14}}>{err}</div>}

              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
                <div>
                  <label style={{fontSize:12,color:"#666",display:"block",marginBottom:5}}>Seu nome completo</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Carlos Silva"
                    style={{width:"100%",boxSizing:"border-box",background:"#1a1a1a",border:"1px solid #333",color:"white",fontSize:15,borderRadius:10,padding:"12px 14px"}}/>
                </div>
                <div>
                  <label style={{fontSize:12,color:"#666",display:"block",marginBottom:5}}>Seu WhatsApp</label>
                  <input value={phone} onChange={e=>handlePhone(e.target.value)} placeholder="(11) 99999-9999"
                    style={{width:"100%",boxSizing:"border-box",background:"#1a1a1a",border:"1px solid #333",color:"white",fontSize:15,borderRadius:10,padding:"12px 14px"}}/>
                </div>
              </div>

              <button onClick={submit} disabled={loading} style={{width:"100%",padding:"16px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:16,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                {loading?"Processando…":<>Confirmar assinatura <ArrowRight size={18}/></>}
              </button>
              <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"#444"}}>Você será redirecionado para confirmar o pagamento via WhatsApp</div>
            </>
          ):(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:"#1a2a0a",border:"2px solid #4ade80",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
                <Check size={34} color="#4ade80"/>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:"white",marginBottom:8}}>Solicitação enviada! 🎉</div>
              <div style={{fontSize:14,color:"#888",lineHeight:1.6}}>Abrindo o WhatsApp para você finalizar o pagamento…</div>
              <div style={{marginTop:20,fontSize:13,color:"#f59e0b"}}>Se não abrir automaticamente, fale com a gente no WhatsApp.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── FAQ ──────────────────────────────────────────────────────
const FAQS=[
  {q:"Como funciona a assinatura?",              a:"Você escolhe um plano, paga mensalmente via PIX ou cartão, e tem direito aos serviços incluídos. É só agendar normalmente!"},
  {q:"Posso usar os serviços quando quiser?",    a:"Sim! Os serviços podem ser usados a qualquer momento durante o mês, sujeito à disponibilidade de agenda."},
  {q:"O que acontece se não usar todos os serviços?", a:"Não acumula para o próximo mês. Os serviços são mensais e se renovam todo mês."},
  {q:"Posso cancelar quando quiser?",            a:"Sim, sem fidelidade. Cancele a qualquer momento pelo WhatsApp. O acesso fica ativo até o fim do período pago."},
  {q:"Como é feito o pagamento?",                a:"Atualmente aceitamos PIX e dinheiro. Em breve cartão de crédito com débito automático."},
]

function FAQ(){
  const [open,setOpen]=useState<number|null>(null)
  return(
    <div>
      {FAQS.map((f,i)=>(
        <div key={i} style={{borderBottom:"1px solid #1a1a1a",overflow:"hidden"}}>
          <button onClick={()=>setOpen(open===i?null:i)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",background:"transparent",border:"none",cursor:"pointer",textAlign:"left",gap:12}}>
            <span style={{fontSize:14,fontWeight:600,color:"white",flex:1}}>{f.q}</span>
            {open===i?<ChevronUp size={16} color="#f59e0b"/>:<ChevronDown size={16} color="#666"/>}
          </button>
          {open===i&&<div style={{fontSize:13,color:"#888",lineHeight:1.7,paddingBottom:16}}>{f.a}</div>}
        </div>
      ))}
    </div>
  )
}

// ── PÁGINA PRINCIPAL ─────────────────────────────────────────
export default function ClubePageClient({ shop, plans, activeCount, slug }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<Plan|null>(null)

  const HIGHLIGHTS=[
    {Icon:Shield, text:"Sem fidelidade, cancele quando quiser"},
    {Icon:Clock,  text:"Horários prioritários para assinantes"},
    {Icon:Star,   text:"Economia de até R$120 por mês"},
  ]

  const PLAN_CONFIG=[
    {color:"#6b7280", bg:"#111",       badge:null},
    {color:"#f59e0b", bg:"#0f0b00",    badge:"🔥 Mais popular"},
    {color:"#8b5cf6", bg:"#0a0015",    badge:"⭐ Premium"},
  ]

  return(
    <div style={{minHeight:"100vh",background:"#080808",color:"white",fontFamily:"system-ui,-apple-system,sans-serif"}}>

      {/* Hero */}
      <div style={{background:"linear-gradient(180deg,#0f0b00 0%,#080808 100%)",padding:"40px 24px 32px",textAlign:"center"}}>
        {shop.logoUrl?(
          <img src={shop.logoUrl} alt={shop.name} style={{width:80,height:80,borderRadius:16,objectFit:"cover",margin:"0 auto 16px",display:"block",border:"2px solid #f59e0b"}}/>
        ):(
          <div style={{width:72,height:72,borderRadius:16,background:"#1a1500",border:"2px solid #f59e0b",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
            <Scissors size={32} color="#f59e0b"/>
          </div>
        )}
        <div style={{fontSize:12,color:"#f59e0b",textTransform:"uppercase",letterSpacing:".12em",fontWeight:700,marginBottom:8}}>
          {shop.name}
        </div>
        <div style={{fontSize:30,fontWeight:900,lineHeight:1.1,marginBottom:12,letterSpacing:"-.5px"}}>
          Clube VIP de<br/>
          <span style={{color:"#f59e0b"}}>Assinaturas</span>
        </div>
        <div style={{fontSize:15,color:"#888",lineHeight:1.6,maxWidth:320,margin:"0 auto 20px"}}>
          Garanta seu visual todo mês com serviços ilimitados e prioridade na agenda.
        </div>
        {activeCount>0&&(
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1a1a1a",borderRadius:20,padding:"6px 14px",fontSize:12,color:"#aaa"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80"}}/>
            <strong style={{color:"white"}}>{activeCount}</strong> assinantes ativos
          </div>
        )}
      </div>

      {/* Highlights */}
      <div style={{padding:"0 24px 32px"}}>
        {HIGHLIGHTS.map((h,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<HIGHLIGHTS.length-1?"1px solid #111":"none"}}>
            <div style={{width:36,height:36,borderRadius:10,background:"#1a1500",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <h.Icon size={17} color="#f59e0b"/>
            </div>
            <span style={{fontSize:14,color:"#ccc"}}>{h.text}</span>
          </div>
        ))}
      </div>

      {/* Planos */}
      <div style={{padding:"0 20px 40px"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:11,color:"#f59e0b",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Escolha seu plano</div>
          <div style={{fontSize:22,fontWeight:800}}>Planos mensais</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {plans.map((plan,i)=>{
            const cfg  = PLAN_CONFIG[i] ?? PLAN_CONFIG[0]
            const svcs = parseServices(plan.services)
            return(
              <div key={plan.id} style={{background:cfg.bg,border:`1.5px solid ${cfg.color}40`,borderRadius:18,padding:"20px",position:"relative",overflow:"hidden"}}>
                {cfg.badge&&(
                  <div style={{position:"absolute",top:12,right:12,fontSize:11,background:cfg.color,color:"#000",padding:"3px 10px",borderRadius:20,fontWeight:700}}>
                    {cfg.badge}
                  </div>
                )}
                <div style={{fontSize:11,color:cfg.color,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:4}}>Plano</div>
                <div style={{fontSize:22,fontWeight:800,marginBottom:2}}>{plan.name}</div>
                <div style={{fontSize:28,fontWeight:900,color:cfg.color,marginBottom:16}}>
                  {BRL(Number(plan.price))}<span style={{fontSize:13,color:"#666",fontWeight:400}}>/mês</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                  {svcs.map(s=>(
                    <div key={s.name} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#ccc"}}>
                      <div style={{width:20,height:20,borderRadius:"50%",background:`${cfg.color}20`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                        <Check size={11} color={cfg.color}/>
                      </div>
                      <strong style={{color:"white"}}>{s.quota===-1?"∞":s.quota}x</strong> {s.name} por mês
                    </div>
                  ))}
                </div>
                <button onClick={()=>setSelectedPlan(plan)} style={{width:"100%",padding:"14px",borderRadius:12,border:`1.5px solid ${cfg.color}`,background:i===1?cfg.color:"transparent",color:i===1?"#000":"white",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                  {i===1&&<Crown size={16}/>}Assinar {plan.name} <ArrowRight size={16}/>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Por que assinar */}
      <div style={{background:"#0f0b00",padding:"32px 24px"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:11,color:"#f59e0b",textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Por que assinar?</div>
          <div style={{fontSize:20,fontWeight:800}}>Seu visual sempre em dia</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          {[
            {emoji:"💰", title:"Economize", desc:"Até R$120 por mês comparado ao avulso"},
            {emoji:"📅", title:"Prioridade", desc:"Você tem prioridade na marcação"},
            {emoji:"✂️", title:"Qualidade", desc:"Os mesmos barbeiros de sempre"},
            {emoji:"🔄", title:"Flexível",   desc:"Cancele quando quiser, sem multa"},
          ].map(c=>(
            <div key={c.title} style={{background:"#111",borderRadius:12,padding:"14px",border:"1px solid #1a1a1a"}}>
              <div style={{fontSize:24,marginBottom:6}}>{c.emoji}</div>
              <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{c.title}</div>
              <div style={{fontSize:11,color:"#666",lineHeight:1.5}}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{padding:"32px 24px 40px"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:20,fontWeight:800}}>Dúvidas frequentes</div>
        </div>
        <FAQ/>
      </div>

      {/* CTA Final */}
      <div style={{background:"linear-gradient(135deg,#1a0f00,#0f0b00)",padding:"32px 24px 48px",textAlign:"center",borderTop:"1px solid #1a1a1a"}}>
        <div style={{fontSize:22,fontWeight:900,marginBottom:8}}>Pronto para entrar<br/>no <span style={{color:"#f59e0b"}}>Clube VIP</span>?</div>
        <div style={{fontSize:13,color:"#888",marginBottom:20}}>Escolha seu plano e garanta sua vaga hoje</div>
        <button onClick={()=>setSelectedPlan(plans[1]??plans[0])} style={{padding:"16px 32px",borderRadius:14,border:"none",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#000",fontSize:16,fontWeight:800,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
          <Crown size={18}/>Assinar agora
        </button>
        <div style={{marginTop:16,fontSize:12,color:"#444"}}>Pagamento via PIX · Sem fidelidade</div>
      </div>

      {/* Footer */}
      <div style={{padding:"16px 24px",textAlign:"center",borderTop:"1px solid #111"}}>
        <div style={{fontSize:11,color:"#333"}}>Powered by BarberaSystem · barberasystem.com</div>
      </div>

      {/* Modal */}
      {selectedPlan&&(
        <SubscribeModal plan={selectedPlan} slug={slug} whatsapp={shop.whatsapp} onClose={()=>setSelectedPlan(null)}/>
      )}
    </div>
  )
}
