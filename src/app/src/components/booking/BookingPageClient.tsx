"use client"
import { useState, useEffect } from "react"
import { CheckCircle, Clock, ChevronRight, ChevronLeft, ShoppingBag, Star, Check, User } from "lucide-react"

interface Service { id:string; name:string; price:number; durationMin:number; description:string }
interface Barber  { id:string; name:string; avatarUrl?:string|null; commissionPct:number }
interface OBump   { id:string; name:string; originalPrice:number; discountedPrice:number; discountPct:number; description:string }
interface Props   {
  barbershop: { id:string; name:string; slug:string; whatsapp?:string }
  services:   Service[]
  barbers:    Barber[]
  orderBumpProduct?: OBump
}

const BRL = (v:number) => "R$ " + v.toLocaleString("pt-BR",{minimumFractionDigits:2})
const STEP_LABELS = ["Serviço","Horário","Oferta","Seus dados"]

function genDays() {
  return Array.from({length:14},(_,i)=>{
    const d = new Date(); d.setDate(d.getDate()+i)
    return { d, num:d.getDate(), wday:d.toLocaleDateString("pt-BR",{weekday:"short"}).replace(".","").slice(0,3), iso:d.toISOString().slice(0,10), disabled:d.getDay()===0 }
  })
}

// ── Step indicator ─────────────────────────────────────────
function StepBar({step}:{step:number}) {
  return (
    <div style={{ padding:"14px 20px", background:"var(--bg-card)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center" }}>
      {STEP_LABELS.map((label,i)=>(
        <div key={i} style={{ display:"flex", alignItems:"center", flex:i<STEP_LABELS.length-1?1:"none" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{
              width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:11, fontWeight:600, flexShrink:0, transition:"all .2s",
              background: step>i+1?"#10b981" : step===i+1?"var(--accent)":"transparent",
              color:       step>i+1?"#fff"    : step===i+1?"var(--accent-fg)":"var(--text-4)",
              border:      step>i+1||step===i+1?"none":"1.5px solid var(--border-2)",
            }}>
              {step>i+1 ? <Check size={13}/> : i+1}
            </div>
            <div style={{ fontSize:9, color:step===i+1?"var(--text)":"var(--text-4)", fontWeight:step===i+1?600:400, textTransform:"uppercase", letterSpacing:".05em", whiteSpace:"nowrap" }}>
              {label}
            </div>
          </div>
          {i<STEP_LABELS.length-1&&(
            <div style={{ flex:1, height:2, borderRadius:2, background:step>i+1?"#10b981":"var(--border)", margin:"0 6px", marginBottom:14, transition:"background .2s" }}/>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Section block ──────────────────────────────────────────
function Section({title,children}:{title:string;children:React.ReactNode}) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13, fontWeight:600, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Tela de confirmação ────────────────────────────────────
function SuccessScreen({svc,barber,day,slot,bump,ob,total,pay}:any) {
  return (
    <div style={{ padding:"48px 20px", textAlign:"center" }}>
      <div style={{ width:72,height:72,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
        <CheckCircle size={36} color="#065f46"/>
      </div>
      <div style={{ fontSize:22,fontWeight:600,marginBottom:8,color:"var(--text)" }}>Agendamento confirmado!</div>
      <div style={{ fontSize:14,color:"var(--text-3)",marginBottom:24,lineHeight:1.7 }}>
        <strong style={{color:"var(--text)"}}>{svc.name}</strong> com <strong style={{color:"var(--text)"}}>{barber.name}</strong><br/>
        {day.d.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} às {slot}
      </div>
      <div style={{ background:"var(--bg-hover)",borderRadius:12,padding:"14px 16px",textAlign:"left",marginBottom:20,border:"1px solid var(--border)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"var(--text-2)" }}>
          <span>{svc.name}</span><span>{BRL(svc.price)}</span>
        </div>
        {bump&&ob&&(
          <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"var(--text-3)" }}>
            <span>{ob.name} (−{ob.discountPct}%)</span><span>{BRL(ob.discountedPrice)}</span>
          </div>
        )}
        <div style={{ borderTop:"1px solid var(--border)",paddingTop:10,marginTop:8,display:"flex",justifyContent:"space-between",fontWeight:600,fontSize:15,color:"var(--text)" }}>
          <span>Total ({pay==="pix"?"PIX":"Cartão"})</span><span>{BRL(total)}</span>
        </div>
      </div>
      <div style={{ fontSize:12,color:"var(--text-4)",lineHeight:1.7 }}>
        Você receberá a confirmação no WhatsApp em instantes.{pay==="pix"&&" O QR Code do PIX será enviado por lá."}
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────
export default function BookingPageClient({barbershop,services,barbers,orderBumpProduct}:Props) {
  const [step,    setStep]    = useState(1)
  const [svc,     setSvc]     = useState<Service|null>(null)
  const [barber,  setBarber]  = useState<Barber|null>(null)
  const [days]                = useState(genDays)
  const [dayIdx,  setDayIdx]  = useState(0)
  const [slots,   setSlots]   = useState<string[]>([])
  const [loadSlots,setLoadSlots]=useState(false)
  const [slot,    setSlot]    = useState<string|null>(null)
  const [bump,    setBump]    = useState(false)
  const [pay,     setPay]     = useState("pix")
  const [name,    setName]    = useState("")
  const [phone,   setPhone]   = useState("")
  const [done,    setDone]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const total = (svc?.price??0) + (bump&&orderBumpProduct?orderBumpProduct.discountedPrice:0)
  const canGo: Record<number,boolean> = {
    1: !!svc,
    2: !!barber && !!slot,
    3: true,
    4: name.trim().length>1 && phone.replace(/\D/g,"").length>=10,
  }

  // Busca horários disponíveis quando muda dia ou barbeiro
  useEffect(()=>{
    if (!barber || !svc) return
    const d = days[dayIdx]
    if (d.disabled) return
    setLoadSlots(true); setSlots([]); setSlot(null)
    fetch(`/api/slots?slug=${barbershop.slug}&date=${d.iso}&barberId=${barber.id}&duration=${svc.durationMin}`)
      .then(r=>r.json())
      .then(j=>{ setSlots(j.data??[]); setLoadSlots(false) })
      .catch(()=>setLoadSlots(false))
  }, [barber, dayIdx, svc])

  async function confirm() {
    if (!svc||!barber||!slot) return
    setLoading(true); setError("")
    try {
      const res = await fetch("/api/appointments", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          slug:barbershop.slug, barberId:barber.id,
          clientName:name, clientPhone:phone,
          serviceIds:[svc.id],
          productIds:bump&&orderBumpProduct?[orderBumpProduct.id]:[],
          scheduledAt:new Date(`${days[dayIdx].iso}T${slot}:00`).toISOString(),
          paymentMethod:pay.toUpperCase().replace("-","_"),
        }),
      })
      if (!res.ok) { const d=await res.json(); throw new Error(d.error||"Erro") }
      setDone(true)
    } catch(e:any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const next = () => { if(step<4) setStep(s=>s+1); else if(canGo[4]) confirm() }
  const back = () => setStep(s=>s-1)

  if (done) return (
    <div style={{ minHeight:"100vh",background:"var(--bg)" }}>
      <div style={{ background:"var(--bg-card)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:36,height:36,borderRadius:8,background:"var(--bg-hover)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,color:"var(--text-3)" }}>{barbershop.name.slice(0,2).toUpperCase()}</div>
        <div>
          <div style={{ fontSize:15,fontWeight:600,color:"var(--text)" }}>{barbershop.name}</div>
        </div>
      </div>
      <SuccessScreen svc={svc} barber={barber} day={days[dayIdx]} slot={slot} bump={bump} ob={orderBumpProduct} total={total} pay={pay}/>
    </div>
  )

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>

      {/* Header da barbearia */}
      <div style={{ background:"var(--bg-card)", borderBottom:"1px solid var(--border)", padding:"14px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:44,height:44,borderRadius:10,background:"var(--bg-hover)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"var(--text-3)",flexShrink:0 }}>
          {barbershop.name.slice(0,2).toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16,fontWeight:600,color:"var(--text)" }}>{barbershop.name}</div>
          <div style={{ fontSize:12,color:"var(--text-4)",display:"flex",alignItems:"center",gap:4,marginTop:2 }}>
            <Star size={11} fill="#fbbf24" color="#fbbf24"/>4.9 · 127 avaliações · Sem cadastro necessário
          </div>
        </div>
      </div>

      {/* Step bar */}
      <StepBar step={step}/>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 40px" }}>

        {/* STEP 1 — Serviço */}
        {step===1&&(
          <Section title="Qual serviço você quer?">
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {services.map(s=>{
                const sel = svc?.id===s.id
                return (
                  <div key={s.id} onClick={()=>setSvc(s)} style={{
                    background:"var(--bg-card)", border:sel?"2px solid var(--accent)":"1px solid var(--border)",
                    borderRadius:12, padding:"14px 16px", cursor:"pointer", position:"relative",
                    boxShadow:sel?"0 0 0 3px rgba(0,0,0,.06)":"var(--shadow)",
                    display:"flex", alignItems:"center", gap:12,
                  }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:15,fontWeight:500,color:"var(--text)" }}>{s.name}</div>
                      <div style={{ fontSize:12,color:"var(--text-3)",display:"flex",alignItems:"center",gap:5,marginTop:3 }}>
                        <Clock size={12}/>{s.durationMin} min{s.description&&<>· {s.description}</>}
                      </div>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
                      <span style={{ fontSize:16,fontWeight:600,color:"var(--text)" }}>{BRL(s.price)}</span>
                      {sel&&<div style={{ width:22,height:22,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center" }}><Check size={13} color="white"/></div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* STEP 2 — Horário */}
        {step===2&&(
          <>
            <Section title="Profissional">
              <div style={{ display:"flex",gap:10 }}>
                {barbers.map(b=>{
                  const sel = barber?.id===b.id
                  return (
                    <div key={b.id} onClick={()=>setBarber(b)} style={{
                      flex:1, background:"var(--bg-card)", border:sel?"2px solid var(--accent)":"1px solid var(--border)",
                      borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"center", boxShadow:"var(--shadow)",
                    }}>
                      {b.avatarUrl ? (
                        <img src={b.avatarUrl} alt={b.name} style={{ width:48,height:48,borderRadius:"50%",objectFit:"cover",margin:"0 auto 8px",display:"block" }}/>
                      ) : (
                        <div style={{ width:48,height:48,borderRadius:"50%",background:"var(--bg-hover)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:600,color:"var(--text-3)",margin:"0 auto 8px" }}>
                          {b.name[0]}
                        </div>
                      )}
                      <div style={{ fontSize:14,fontWeight:500,color:"var(--text)" }}>{b.name}</div>
                      <div style={{ fontSize:12,color:"var(--text-4)",display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginTop:2 }}>
                        <Star size={11} fill="#fbbf24" color="#fbbf24"/>4.9
                      </div>
                      {sel&&<div style={{ marginTop:8,display:"flex",justifyContent:"center" }}><Check size={14} color="#10b981"/></div>}
                    </div>
                  )
                })}
              </div>
            </Section>

            <Section title="Data">
              <div style={{ display:"flex",gap:6,overflowX:"auto",paddingBottom:4 }}>
                {days.map((d,i)=>(
                  <div key={i} onClick={()=>!d.disabled&&setDayIdx(i)} style={{
                    minWidth:48,textAlign:"center",padding:"10px 4px",borderRadius:10,flexShrink:0,
                    cursor:d.disabled?"not-allowed":"pointer", opacity:d.disabled?.4:1,
                    background:dayIdx===i?"var(--accent)":"var(--bg-card)",
                    border:dayIdx===i?"none":"1px solid var(--border)",
                    boxShadow:"var(--shadow)",
                  }}>
                    <div style={{ fontSize:10,color:dayIdx===i?"var(--accent-fg)":"var(--text-4)",textTransform:"uppercase",fontWeight:500 }}>{d.wday}</div>
                    <div style={{ fontSize:17,fontWeight:600,marginTop:2,color:dayIdx===i?"var(--accent-fg)":"var(--text)" }}>{d.num}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title={`Horários disponíveis${!loadSlots&&slots.length?` · ${slots.length} livres`:""}`}>
              {loadSlots && <div style={{ fontSize:13,color:"var(--text-4)",padding:"10px 0" }}>Carregando horários…</div>}
              {!loadSlots && slots.length===0 && barber && (
                <div style={{ fontSize:13,color:"var(--text-4)",padding:"10px 0" }}>Nenhum horário disponível nesta data.</div>
              )}
              {!barber && <div style={{ fontSize:13,color:"var(--text-4)",padding:"10px 0" }}>Selecione um profissional acima.</div>}
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {slots.map(s=>(
                  <div key={s} onClick={()=>setSlot(s)} style={{
                    padding:"9px 16px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,
                    background:slot===s?"var(--accent)":"var(--bg-card)",
                    color:slot===s?"var(--accent-fg)":"var(--text)",
                    border:slot===s?"none":"1px solid var(--border)",
                    boxShadow:"var(--shadow)",
                  }}>{s}</div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* STEP 3 — Order Bump */}
        {step===3&&(
          orderBumpProduct ? (
            <Section title="Oferta especial para você">
              <div style={{ fontSize:12,color:"var(--text-3)",marginBottom:14 }}>Disponível apenas durante este agendamento</div>
              <div onClick={()=>setBump(v=>!v)} style={{
                background:"var(--bg-card)", border:bump?"2px solid var(--accent)":"1px solid var(--border)",
                borderRadius:14, padding:"18px", cursor:"pointer", boxShadow:"var(--shadow)",
              }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:12,marginBottom:14 }}>
                  <div style={{ width:52,height:52,background:"var(--bg-hover)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    <ShoppingBag size={24} color="var(--text-3)"/>
                  </div>
                  <div>
                    <div style={{ fontSize:15,fontWeight:600,color:"var(--text)" }}>{orderBumpProduct.name}</div>
                    <div style={{ fontSize:13,color:"var(--text-3)",marginTop:4,lineHeight:1.5 }}>{orderBumpProduct.description}</div>
                  </div>
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap" }}>
                    <span style={{ fontSize:13,textDecoration:"line-through",color:"var(--text-4)" }}>{BRL(orderBumpProduct.originalPrice)}</span>
                    <span style={{ fontSize:20,fontWeight:700,color:"#10b981" }}>{BRL(orderBumpProduct.discountedPrice)}</span>
                    <span style={{ fontSize:11,background:"#d1fae5",color:"#065f46",padding:"2px 7px",borderRadius:5,fontWeight:600 }}>−{orderBumpProduct.discountPct}%</span>
                  </div>
                  <div style={{ width:26,height:26,borderRadius:7,border:bump?"none":"1px solid var(--border-2)",background:bump?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                    {bump&&<Check size={15} color="white"/>}
                  </div>
                </div>
              </div>
              {!bump&&(
                <div style={{ textAlign:"center",marginTop:12 }}>
                  <button onClick={()=>setStep(4)} style={{ fontSize:12,border:"none",background:"transparent",color:"var(--text-4)",cursor:"pointer" }}>
                    Não, obrigado — continuar sem o produto
                  </button>
                </div>
              )}
            </Section>
          ) : (
            // Sem order bump configurado — pula direto
            <Section title="Quase lá!">
              <div style={{ fontSize:14,color:"var(--text-3)",padding:"10px 0" }}>Confirme seus dados na próxima etapa.</div>
            </Section>
          )
        )}

        {/* STEP 4 — Dados + pagamento */}
        {step===4&&(
          <>
            <Section title="Seus dados">
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                <div>
                  <label style={{ fontSize:12,color:"var(--text-3)",display:"block",marginBottom:4 }}>Nome completo</label>
                  <input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome"/>
                </div>
                <div>
                  <label style={{ fontSize:12,color:"var(--text-3)",display:"block",marginBottom:4 }}>WhatsApp (receberá a confirmação)</label>
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(11) 99999-9999"/>
                </div>
              </div>
            </Section>

            <Section title="Pagamento">
              <div style={{ display:"flex",gap:8,marginBottom:4 }}>
                {[{id:"pix",label:"PIX",sub:"Aprovação imediata"},{id:"card",label:"Cartão",sub:"Crédito ou débito"}].map(p=>(
                  <div key={p.id} onClick={()=>setPay(p.id)} style={{
                    flex:1,background:"var(--bg-card)",border:pay===p.id?"2px solid var(--accent)":"1px solid var(--border)",
                    borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"center",boxShadow:"var(--shadow)",
                  }}>
                    <div style={{ fontSize:15,fontWeight:600,color:"var(--text)" }}>{p.label}</div>
                    <div style={{ fontSize:11,color:"var(--text-4)",marginTop:2 }}>{p.sub}</div>
                    {pay===p.id&&<div style={{ marginTop:6,display:"flex",justifyContent:"center" }}><Check size={14} color="#10b981"/></div>}
                  </div>
                ))}
              </div>
            </Section>

            {/* Resumo */}
            <div style={{ background:"var(--bg-hover)",borderRadius:12,padding:"14px 16px",marginBottom:4,border:"1px solid var(--border)" }}>
              <div style={{ fontSize:12,fontWeight:600,color:"var(--text-3)",marginBottom:10,textTransform:"uppercase",letterSpacing:".04em" }}>Resumo</div>
              <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"var(--text-2)" }}>
                <span>{svc?.name} com {barber?.name}</span><span>{BRL(svc?.price??0)}</span>
              </div>
              <div style={{ fontSize:12,color:"var(--text-3)",marginBottom:6 }}>
                {days[dayIdx].d.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} às {slot}
              </div>
              {bump&&orderBumpProduct&&(
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"var(--text-3)" }}>
                  <span>{orderBumpProduct.name} (−{orderBumpProduct.discountPct}%)</span><span>{BRL(orderBumpProduct.discountedPrice)}</span>
                </div>
              )}
              <div style={{ borderTop:"1px solid var(--border)",paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,color:"var(--text)" }}>
                <span>Total</span><span>{BRL(total)}</span>
              </div>
            </div>
            {error&&<div style={{ color:"#dc2626",fontSize:13,marginTop:8 }}>{error}</div>}
          </>
        )}

        {/* Navegação */}
        <div style={{ display:"flex",gap:8,marginTop:16 }}>
          {step>1&&(
            <button onClick={back} style={{ display:"flex",alignItems:"center",gap:4,fontSize:13,padding:"13px 16px",flexShrink:0,borderRadius:10,background:"var(--bg-card)",border:"1px solid var(--border)",color:"var(--text)" }}>
              <ChevronLeft size={14}/> Voltar
            </button>
          )}
          <button onClick={next} disabled={!canGo[step]||loading} style={{
            flex:1, padding:"14px", borderRadius:10, border:"none",
            cursor:canGo[step]&&!loading?"pointer":"not-allowed",
            background:canGo[step]&&!loading?"var(--accent)":"var(--bg-hover)",
            color:canGo[step]&&!loading?"var(--accent-fg)":"var(--text-4)",
            fontSize:14, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          }}>
            {loading?"Confirmando…":step===4?`Confirmar — ${BRL(total)}`:"Continuar"}
            {!loading&&step<4&&<ChevronRight size={14}/>}
          </button>
        </div>

        <div style={{ textAlign:"center",marginTop:14,fontSize:11,color:"var(--text-4)" }}>
          Sem cadastro necessário · Seus dados são usados apenas para este agendamento
        </div>
      </div>
    </div>
  )
}
