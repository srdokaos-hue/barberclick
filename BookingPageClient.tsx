"use client"
import { useState, useEffect } from "react"
import { CheckCircle, Clock, ChevronRight, ChevronLeft, ShoppingBag, Star, Check, Sparkles, Calendar, MessageCircle, Tag, History } from "lucide-react"

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

function StepBar({step}:{step:number}) {
  return (
    <div style={{padding:"14px 20px",background:"var(--bg-card,#fff)",borderBottom:"1px solid var(--border,#e5e7eb)",display:"flex",alignItems:"center"}}>
      {STEP_LABELS.map((label,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:i<STEP_LABELS.length-1?1:"none"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{
              width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:11,fontWeight:600,flexShrink:0,transition:"all .2s",
              background:step>i+1?"#10b981":step===i+1?"var(--accent,#111)":"transparent",
              color:step>i+1?"#fff":step===i+1?"var(--accent-fg,#fff)":"var(--text-4,#9ca3af)",
              border:step>i+1||step===i+1?"none":"1.5px solid var(--border-2,#d1d5db)",
            }}>
              {step>i+1?<Check size={13}/>:i+1}
            </div>
            <div style={{fontSize:9,color:step===i+1?"var(--text,#111)":"var(--text-4,#9ca3af)",fontWeight:step===i+1?600:400,textTransform:"uppercase",letterSpacing:".05em",whiteSpace:"nowrap"}}>
              {label}
            </div>
          </div>
          {i<STEP_LABELS.length-1&&<div style={{flex:1,height:2,borderRadius:2,background:step>i+1?"#10b981":"var(--border,#e5e7eb)",margin:"0 6px",marginBottom:14,transition:"background .2s"}}/>}
        </div>
      ))}
    </div>
  )
}

// ── Tela pós-confirmação com CTA de conta ──────────────────
function SuccessWithCTA({svc,barber,day,slot,bump,ob,total,pay,clientName,clientPhone,slug,shopName}:any) {
  const [step,    setStep]    = useState<"cta"|"creating"|"done">("cta")
  const [password,setPassword]= useState("")
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  async function createAccount() {
    if(password.length<6) { setError("Senha deve ter pelo menos 6 caracteres"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/cliente/auth",{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({type:"register",phone:clientPhone,password,name:clientName,barbershopSlug:slug}),
    })
    const data = await res.json()
    setLoading(false)
    if(!res.ok) { setError(data.error); return }
    setStep("done")
  }

  return (
    <div style={{padding:"24px 20px 40px",maxWidth:480,margin:"0 auto"}}>

      {/* Confirmação */}
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{width:68,height:68,borderRadius:"50%",background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <CheckCircle size={34} color="#065f46"/>
        </div>
        <div style={{fontSize:22,fontWeight:700,marginBottom:6,color:"var(--text,#111)"}}>Agendamento confirmado!</div>
        <div style={{fontSize:14,color:"var(--text-3,#6b7280)",lineHeight:1.7}}>
          <strong>{svc.name}</strong> com <strong>{barber.name}</strong><br/>
          {day.d.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} às {slot}
        </div>
        <div style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:12,background:"var(--bg-hover,#f3f4f6)",borderRadius:9,padding:"8px 14px",fontSize:13,fontWeight:600,color:"var(--text,#111)"}}>
          Total: {BRL(total)} · {pay==="pix"?"PIX":"Cartão"}
        </div>
      </div>

      {/* CTA de conta */}
      {step==="cta"&&(
        <div style={{background:"linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",borderRadius:16,padding:"20px",color:"white",border:"1px solid #334155"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <Sparkles size={18} color="#fbbf24"/>
            <div style={{fontSize:16,fontWeight:700}}>Ative sua conta VIP</div>
          </div>
          <div style={{fontSize:13,color:"rgba(255,255,255,.6)",marginBottom:18}}>
            Gerencie seus cortes sem precisar ligar
          </div>

          {/* Benefícios */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {[
              [Calendar,    "Veja e cancele seus agendamentos aqui"],
              [MessageCircle,"Lembretes automáticos antes do horário"],
              [Tag,          "Ofertas exclusivas para clientes VIP"],
              [History,      "Histórico completo dos seus cortes"],
            ].map(([Icon,text]:any,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,fontSize:13}}>
                <div style={{width:30,height:30,borderRadius:8,background:"rgba(255,255,255,.08)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Icon size={15} color="#fbbf24"/>
                </div>
                <span style={{color:"rgba(255,255,255,.85)"}}>{text}</span>
              </div>
            ))}
          </div>

          {/* Campo de senha */}
          <div style={{background:"rgba(255,255,255,.05)",borderRadius:10,padding:"14px"}}>
            <div style={{fontSize:12,color:"rgba(255,255,255,.5)",marginBottom:8}}>
              Só falta criar uma senha para <strong style={{color:"rgba(255,255,255,.8)"}}>{clientPhone}</strong>:
            </div>
            <input
              type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="Criar senha (mínimo 6 caracteres)"
              onKeyDown={e=>e.key==="Enter"&&createAccount()}
              style={{width:"100%",boxSizing:"border-box",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"white",fontSize:14,marginBottom:10,borderRadius:8}}
            />
            {error&&<div style={{fontSize:12,color:"#f87171",marginBottom:8}}>{error}</div>}
            <button onClick={createAccount} disabled={loading} style={{
              width:"100%",padding:"13px",borderRadius:9,border:"none",cursor:"pointer",
              background:"white",color:"#111",fontSize:14,fontWeight:700,
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            }}>
              {loading?"Criando conta…":<><Sparkles size={15} color="#f59e0b"/>Ativar minha conta VIP →</>}
            </button>
          </div>

          <button onClick={()=>setStep("done")} style={{width:"100%",marginTop:10,background:"transparent",border:"none",color:"rgba(255,255,255,.3)",fontSize:12,cursor:"pointer",padding:"6px"}}>
            Não agora, obrigado
          </button>
        </div>
      )}

      {/* Conta criada! */}
      {step==="done"&&(
        <div style={{textAlign:"center",background:"var(--bg-card,#fff)",border:"1px solid var(--border,#e5e7eb)",borderRadius:14,padding:"20px"}}>
          {step==="done"&&password ? (
            <>
              <div style={{fontSize:16,fontWeight:600,marginBottom:6,color:"var(--text,#111)"}}>🎉 Conta VIP ativada!</div>
              <div style={{fontSize:13,color:"var(--text-3,#6b7280)",marginBottom:16}}>Agora você pode acompanhar seus cortes</div>
              <a href={`/cliente/dashboard?slug=${slug}`} style={{display:"block",padding:"12px",borderRadius:10,background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",textDecoration:"none",fontSize:14,fontWeight:600}}>
                Acessar minha área →
              </a>
            </>
          ) : (
            <>
              <div style={{fontSize:14,color:"var(--text-3,#6b7280)",marginBottom:16}}>Até a próxima! ✂️</div>
              <a href={`/${slug}`} style={{display:"block",padding:"12px",borderRadius:10,background:"var(--bg-hover,#f3f4f6)",color:"var(--text,#111)",textDecoration:"none",fontSize:14,fontWeight:500}}>
                Fazer outro agendamento
              </a>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────
export default function BookingPageClient({barbershop,services,barbers,orderBumpProduct}:Props) {
  const [step,   setStep]   = useState(1)
  const [svc,    setSvc]    = useState<Service|null>(null)
  const [barber, setBarber] = useState<Barber|null>(null)
  const [days]              = useState(genDays)
  const [dayIdx, setDayIdx] = useState(0)
  const [slots,  setSlots]  = useState<string[]>([])
  const [loadSlots,setLS]   = useState(false)
  const [slot,   setSlot]   = useState<string|null>(null)
  const [bump,   setBump]   = useState(false)
  const [pay,    setPay]    = useState("pix")
  const [name,   setName]   = useState("")
  const [phone, setPhone] = useState("")

  function handlePhone(v: string) {
    const d = v.replace(/\D/g,"")
    if(d.length<=2)       setPhone(d)
    else if(d.length<=7)  setPhone(`(${d.slice(0,2)}) ${d.slice(2)}`)
    else if(d.length<=11) setPhone(`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`)
  }

  const phoneValid = phone.replace(/\D/g,"").length>=10 &&
    /^[1-9]{2}/.test(phone.replace(/\D/g,"").slice(0,2)) &&
    /^[6-9]/.test(phone.replace(/\D/g,"").slice(2,3))
  const [done,   setDone]   = useState(false)
  const [loading,setLoad]   = useState(false)
  const [error,  setError]  = useState("")

  const total = (svc?.price??0)+(bump&&orderBumpProduct?orderBumpProduct.discountedPrice:0)
  const canGo: Record<number,boolean> = {
    1: !!svc,
    2: !!barber&&!!slot,
    3: true,
    4: name.trim().length>1 && phoneValid,
  }

  useEffect(()=>{
    if(!barber||!svc) return
    const d=days[dayIdx]; if(d.disabled) return
    setLS(true); setSlots([]); setSlot(null)
    fetch(`/api/slots?slug=${barbershop.slug}&date=${d.iso}&barberId=${barber.id}&duration=${svc.durationMin}`)
      .then(r=>r.json()).then(j=>{ setSlots(j.data??[]); setLS(false) })
      .catch(()=>setLS(false))
  },[barber,dayIdx,svc])

  async function confirm() {
    if(!svc||!barber||!slot) return
    setLoad(true); setError("")
    try {
      const res = await fetch("/api/appointments",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          slug:barbershop.slug,barberId:barber.id,
          clientName:name,clientPhone:phone,
          serviceIds:[svc.id],
          productIds:bump&&orderBumpProduct?[orderBumpProduct.id]:[],
          scheduledAt:new Date(`${days[dayIdx].iso}T${slot}:00`).toISOString(),
          paymentMethod:pay.toUpperCase().replace("-","_"),
        }),
      })
      if(!res.ok){ const d=await res.json(); throw new Error(d.error||"Erro") }
      setDone(true)
    } catch(e:any){ setError(e.message) }
    finally{ setLoad(false) }
  }

  const next = () => { if(step<4) setStep(s=>s+1); else if(canGo[4]) confirm() }
  const back = () => setStep(s=>s-1)

  if(done) return (
    <div style={{minHeight:"100vh",background:"var(--bg,#f9fafb)"}}>
      <div style={{background:"var(--bg-card,#fff)",borderBottom:"1px solid var(--border,#e5e7eb)",padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:40,height:40,borderRadius:9,background:"var(--bg-hover,#f3f4f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"var(--text-3,#6b7280)"}}>
          {barbershop.name.slice(0,2).toUpperCase()}
        </div>
        <div style={{fontSize:15,fontWeight:600,color:"var(--text,#111)"}}>{barbershop.name}</div>
      </div>
      <SuccessWithCTA svc={svc} barber={barber} day={days[dayIdx]} slot={slot} bump={bump} ob={orderBumpProduct} total={total} pay={pay} clientName={name} clientPhone={phone} slug={barbershop.slug} shopName={barbershop.name}/>
    </div>
  )

  return (
    <div style={{minHeight:"100vh",background:"var(--bg,#f9fafb)"}}>

      {/* Header */}
      <div style={{background:"var(--bg-card,#fff)",borderBottom:"1px solid var(--border,#e5e7eb)",padding:"14px 20px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:10,background:"var(--bg-hover,#f3f4f6)",border:"1px solid var(--border,#e5e7eb)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"var(--text-3,#6b7280)",flexShrink:0}}>
          {barbershop.name.slice(0,2).toUpperCase()}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:600,color:"var(--text,#111)"}}>{barbershop.name}</div>
          <div style={{fontSize:12,color:"var(--text-4,#9ca3af)",display:"flex",alignItems:"center",gap:4,marginTop:2}}>
            <Star size={11} fill="#fbbf24" color="#fbbf24"/>4.9 · Sem cadastro necessário
          </div>
        </div>
      </div>
      <StepBar step={step}/>

      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 40px"}}>

        {/* STEP 1 */}
        {step===1&&(
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:12}}>Qual serviço você quer?</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {services.map(s=>{
                const sel=svc?.id===s.id
                return(
                  <div key={s.id} onClick={()=>setSvc(s)} style={{
                    background:"var(--bg-card,#fff)",border:sel?"2px solid var(--accent,#111)":"1px solid var(--border,#e5e7eb)",
                    borderRadius:12,padding:"14px 16px",cursor:"pointer",position:"relative",
                    boxShadow:sel?"0 0 0 3px rgba(0,0,0,.06)":"0 1px 3px rgba(0,0,0,.07)",
                    display:"flex",alignItems:"center",gap:12,
                  }}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:500,color:"var(--text,#111)"}}>{s.name}</div>
                      <div style={{fontSize:12,color:"var(--text-3,#6b7280)",display:"flex",alignItems:"center",gap:5,marginTop:3}}>
                        <Clock size={12}/>{s.durationMin} min{s.description&&<>· {s.description}</>}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                      <span style={{fontSize:16,fontWeight:600,color:"var(--text,#111)"}}>{BRL(s.price)}</span>
                      {sel&&<div style={{width:22,height:22,borderRadius:"50%",background:"#10b981",display:"flex",alignItems:"center",justifyContent:"center"}}><Check size={13} color="white"/></div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2&&(
          <>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Profissional</div>
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              {barbers.map(b=>{
                const sel=barber?.id===b.id
                return(
                  <div key={b.id} onClick={()=>setBarber(b)} style={{
                    flex:1,background:"var(--bg-card,#fff)",border:sel?"2px solid var(--accent,#111)":"1px solid var(--border,#e5e7eb)",
                    borderRadius:12,padding:"14px 12px",cursor:"pointer",textAlign:"center",
                    boxShadow:"0 1px 3px rgba(0,0,0,.07)",
                  }}>
                    {b.avatarUrl?(
                      <img src={b.avatarUrl} alt={b.name} style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",margin:"0 auto 8px",display:"block"}}/>
                    ):(
                      <div style={{width:48,height:48,borderRadius:"50%",background:"var(--bg-hover,#f3f4f6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:600,color:"var(--text-3,#6b7280)",margin:"0 auto 8px"}}>
                        {b.name[0]}
                      </div>
                    )}
                    <div style={{fontSize:14,fontWeight:500,color:"var(--text,#111)"}}>{b.name}</div>
                    <div style={{fontSize:12,color:"var(--text-4,#9ca3af)",display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginTop:2}}>
                      <Star size={11} fill="#fbbf24" color="#fbbf24"/>4.9
                    </div>
                    {sel&&<div style={{marginTop:8,display:"flex",justifyContent:"center"}}><Check size={14} color="#10b981"/></div>}
                  </div>
                )
              })}
            </div>

            <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Data</div>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:20}}>
              {days.map((d,i)=>(
                <div key={i} onClick={()=>!d.disabled&&setDayIdx(i)} style={{
                  minWidth:48,textAlign:"center",padding:"10px 4px",borderRadius:10,flexShrink:0,
                  cursor:d.disabled?"not-allowed":"pointer",opacity:d.disabled?.4:1,
                  background:dayIdx===i?"var(--accent,#111)":"var(--bg-card,#fff)",
                  border:dayIdx===i?"none":"1px solid var(--border,#e5e7eb)",
                  boxShadow:"0 1px 3px rgba(0,0,0,.07)",
                }}>
                  <div style={{fontSize:10,color:dayIdx===i?"var(--accent-fg,#fff)":"var(--text-4,#9ca3af)",textTransform:"uppercase",fontWeight:500}}>{d.wday}</div>
                  <div style={{fontSize:17,fontWeight:600,marginTop:2,color:dayIdx===i?"var(--accent-fg,#fff)":"var(--text,#111)"}}>{d.num}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>
              Horários{!loadSlots&&slots.length>0&&<span style={{fontWeight:400,textTransform:"none",marginLeft:6}}>{slots.length} disponíveis</span>}
            </div>
            {loadSlots&&<div style={{fontSize:13,color:"var(--text-4,#9ca3af)",padding:"8px 0"}}>Buscando horários…</div>}
            {!barber&&<div style={{fontSize:13,color:"var(--text-4,#9ca3af)",padding:"8px 0"}}>Selecione um profissional acima</div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {slots.map(s=>(
                <div key={s} onClick={()=>setSlot(s)} style={{
                  padding:"9px 16px",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:500,
                  background:slot===s?"var(--accent,#111)":"var(--bg-card,#fff)",
                  color:slot===s?"var(--accent-fg,#fff)":"var(--text,#111)",
                  border:slot===s?"none":"1px solid var(--border,#e5e7eb)",
                  boxShadow:"0 1px 3px rgba(0,0,0,.07)",
                }}>{s}</div>
              ))}
            </div>
          </>
        )}

        {/* STEP 3 — Order Bump */}
        {step===3&&(
          orderBumpProduct?(
            <>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4}}>Oferta especial</div>
              <div style={{fontSize:12,color:"var(--text-3,#6b7280)",marginBottom:14}}>Disponível apenas durante este agendamento</div>
              <div onClick={()=>setBump(v=>!v)} style={{
                background:"var(--bg-card,#fff)",border:bump?"2px solid var(--accent,#111)":"1px solid var(--border,#e5e7eb)",
                borderRadius:14,padding:"16px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.07)",
              }}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
                  <div style={{width:52,height:52,background:"var(--bg-hover,#f3f4f6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <ShoppingBag size={24} color="var(--text-3,#6b7280)"/>
                  </div>
                  <div>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--text,#111)"}}>{orderBumpProduct.name}</div>
                    <div style={{fontSize:13,color:"var(--text-3,#6b7280)",marginTop:4,lineHeight:1.5}}>{orderBumpProduct.description}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,textDecoration:"line-through",color:"var(--text-4,#9ca3af)"}}>{BRL(orderBumpProduct.originalPrice)}</span>
                    <span style={{fontSize:20,fontWeight:700,color:"#10b981"}}>{BRL(orderBumpProduct.discountedPrice)}</span>
                    <span style={{fontSize:11,background:"#d1fae5",color:"#065f46",padding:"2px 7px",borderRadius:5,fontWeight:600}}>−{orderBumpProduct.discountPct}%</span>
                  </div>
                  <div style={{width:26,height:26,borderRadius:7,border:bump?"none":"1px solid var(--border-2,#d1d5db)",background:bump?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {bump&&<Check size={15} color="white"/>}
                  </div>
                </div>
              </div>
              {!bump&&<div style={{textAlign:"center",marginTop:12}}><button onClick={()=>setStep(4)} style={{fontSize:12,border:"none",background:"transparent",color:"var(--text-4,#9ca3af)",cursor:"pointer"}}>Não, obrigado</button></div>}
            </>
          ):(
            <div style={{fontSize:14,color:"var(--text-3,#6b7280)",padding:"10px 0"}}>Continue para confirmar seu agendamento.</div>
          )
        )}

        {/* STEP 4 */}
        {step===4&&(
          <>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:12}}>Seus dados</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              <div>
                <label style={{fontSize:12,color:"var(--text-3,#6b7280)",display:"block",marginBottom:4}}>Nome completo</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome"/>
              </div>
              <div>
                <label style={{fontSize:12,color:"var(--text-3,#6b7280)",display:"block",marginBottom:4}}>WhatsApp</label>
                <input value={phone} onChange={e=>handlePhone(e.target.value)} placeholder="(11) 99999-9999"
                style={{borderColor:phone.length>0&&!phoneValid?"#ef4444":undefined}}/>
              {phone.length>0&&!phoneValid&&(
                <div style={{fontSize:11,color:"#ef4444",marginTop:3}}>WhatsApp inválido — verifique o DDD e o número</div>
              )}
              </div>
            </div>

            {/* Gatilho mental sutil — hint de conta */}
            {name.trim().length>1&&phone.replace(/\D/g,"").length>=10&&(
              <div style={{background:"#fef9c3",border:"1px solid #fcd34d",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>💡</span>
                <span style={{fontSize:12,color:"#713f12",lineHeight:1.5}}>
                  Após confirmar, você poderá criar uma senha e <strong>gerenciar seus cortes pelo app</strong> sem precisar ligar.
                </span>
              </div>
            )}

            <div style={{fontSize:13,fontWeight:600,color:"var(--text-3,#6b7280)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:10}}>Pagamento</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {[{id:"pix",label:"PIX",sub:"Aprovação imediata"},{id:"card",label:"Cartão",sub:"Crédito ou débito"}].map(p=>(
                <div key={p.id} onClick={()=>setPay(p.id)} style={{
                  flex:1,background:"var(--bg-card,#fff)",border:pay===p.id?"2px solid var(--accent,#111)":"1px solid var(--border,#e5e7eb)",
                  borderRadius:12,padding:"12px",cursor:"pointer",textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,.07)",
                }}>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--text,#111)"}}>{p.label}</div>
                  <div style={{fontSize:11,color:"var(--text-4,#9ca3af)",marginTop:2}}>{p.sub}</div>
                  {pay===p.id&&<div style={{marginTop:6,display:"flex",justifyContent:"center"}}><Check size={14} color="#10b981"/></div>}
                </div>
              ))}
            </div>

            <div style={{background:"var(--bg-hover,#f3f4f6)",borderRadius:12,padding:"14px 16px",marginBottom:4,border:"1px solid var(--border,#e5e7eb)"}}>
              <div style={{fontSize:12,fontWeight:600,color:"var(--text-3,#6b7280)",marginBottom:10,textTransform:"uppercase",letterSpacing:".04em"}}>Resumo</div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"var(--text-2,#374151)"}}>
                <span>{svc?.name} com {barber?.name}</span><span>{BRL(svc?.price??0)}</span>
              </div>
              <div style={{fontSize:12,color:"var(--text-3,#6b7280)",marginBottom:6}}>
                {days[dayIdx].d.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} às {slot}
              </div>
              {bump&&orderBumpProduct&&(
                <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6,color:"var(--text-3,#6b7280)"}}>
                  <span>{orderBumpProduct.name} (−{orderBumpProduct.discountPct}%)</span><span>{BRL(orderBumpProduct.discountedPrice)}</span>
                </div>
              )}
              <div style={{borderTop:"1px solid var(--border,#e5e7eb)",paddingTop:10,marginTop:6,display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:16,color:"var(--text,#111)"}}>
                <span>Total</span><span>{BRL(total)}</span>
              </div>
            </div>
            {error&&<div style={{color:"#dc2626",fontSize:13,marginTop:8}}>{error}</div>}
          </>
        )}

        {/* Navegação */}
        <div style={{display:"flex",gap:8,marginTop:20}}>
          {step>1&&(
            <button onClick={back} style={{display:"flex",alignItems:"center",gap:4,fontSize:13,padding:"13px 16px",flexShrink:0,borderRadius:10,background:"var(--bg-card,#fff)",border:"1px solid var(--border,#e5e7eb)",color:"var(--text,#111)"}}>
              <ChevronLeft size={14}/>Voltar
            </button>
          )}
          <button onClick={next} disabled={!canGo[step]||loading} style={{
            flex:1,padding:"14px",borderRadius:10,border:"none",
            cursor:canGo[step]&&!loading?"pointer":"not-allowed",
            background:canGo[step]&&!loading?"var(--accent,#111)":"var(--bg-hover,#f3f4f6)",
            color:canGo[step]&&!loading?"var(--accent-fg,#fff)":"var(--text-4,#9ca3af)",
            fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,
          }}>
            {loading?"Confirmando…":step===4?`Confirmar — ${BRL(total)}`:"Continuar"}
            {!loading&&step<4&&<ChevronRight size={14}/>}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"var(--text-4,#9ca3af)"}}>
          Sem cadastro necessário · Seus dados são usados apenas para este agendamento
        </div>
      </div>
    </div>
  )
}
