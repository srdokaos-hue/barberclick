"use client"
import { useState, useEffect } from "react"
import { CheckCircle, Clock, X, ChevronRight, User, Calendar, Scissors, LogOut, Plus } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

const BRL = (v:number) => "R$ " + (+v).toLocaleString("pt-BR",{minimumFractionDigits:2})

const STATUS: Record<string,{label:string;bg:string;fg:string}> = {
  PENDING:   {label:"Pendente",   bg:"#fef9c3",fg:"#713f12"},
  CONFIRMED: {label:"Confirmado", bg:"#dbeafe",fg:"#1e3a8a"},
  DONE:      {label:"Concluído",  bg:"#d1fae5",fg:"#065f46"},
  CANCELLED: {label:"Cancelado",  bg:"#fee2e2",fg:"#991b1b"},
}

interface ClientSession { id:string; name:string; phone:string; email:string; slug:string }

// ── Login / Cadastro ──────────────────────────────────────────
function AuthScreen({ slug, onAuth }:{ slug:string; onAuth:(s:ClientSession)=>void }) {
  const [mode,     setMode]     = useState<"login"|"register">("login")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [name,     setName]     = useState("")
  const [phone,    setPhone]    = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  async function submit() {
    setLoading(true); setError("")
    const url  = mode==="login" ? "/api/cliente/login" : "/api/cliente/register"
    const body = mode==="login" ? { email, password, slug } : { name, phone, email, password, slug }
    try {
      const res  = await fetch(url, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) { setError(data.error||"Erro"); return }
      localStorage.setItem("bc_client", JSON.stringify(data.data))
      onAuth(data.data)
    } catch { setError("Erro de conexão") }
    finally   { setLoading(false) }
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column"}}>
      {/* Header */}
      <div style={{background:"var(--bg-card)",borderBottom:"1px solid var(--border)",padding:"14px 20px",display:"flex",alignItems:"center",gap:10}}>
        <Link href={`/${slug}`} style={{textDecoration:"none",display:"flex",alignItems:"center",gap:6,color:"var(--text-3)",fontSize:13}}>
          ← Voltar
        </Link>
      </div>

      <div style={{maxWidth:400,margin:"40px auto",padding:"0 20px",width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <User size={26} color="var(--text-3)"/>
          </div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--text)",marginBottom:4}}>
            {mode==="login"?"Entrar na sua conta":"Criar sua conta"}
          </div>
          <div style={{fontSize:13,color:"var(--text-3)"}}>
            {mode==="login"?"Acesse seu histórico de agendamentos":"Agende mais rápido e acompanhe seus cortes"}
          </div>
        </div>

        <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,padding:24}}>
          {error&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",color:"#dc2626",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:14}}>{error}</div>}

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {mode==="register"&&<>
              <div>
                <label style={{fontSize:12,color:"var(--text-3)",display:"block",marginBottom:4}}>Nome completo</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome"/>
              </div>
              <div>
                <label style={{fontSize:12,color:"var(--text-3)",display:"block",marginBottom:4}}>WhatsApp</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(11) 99999-9999"/>
              </div>
            </>}
            <div>
              <label style={{fontSize:12,color:"var(--text-3)",display:"block",marginBottom:4}}>E-mail</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
            </div>
            <div>
              <label style={{fontSize:12,color:"var(--text-3)",display:"block",marginBottom:4}}>Senha</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
            </div>
          </div>

          <button onClick={submit} disabled={loading} style={{
            width:"100%",marginTop:16,padding:"13px",borderRadius:10,border:"none",cursor:"pointer",
            background:"var(--accent)",color:"var(--accent-fg)",fontSize:14,fontWeight:600,
          }}>
            {loading?"Aguarde…":mode==="login"?"Entrar":"Criar conta grátis"}
          </button>

          <div style={{textAlign:"center",marginTop:14,fontSize:13,color:"var(--text-3)"}}>
            {mode==="login"?"Não tem conta?":"Já tem conta?"}{" "}
            <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}}
              style={{border:"none",background:"transparent",color:"var(--accent)",fontWeight:500,cursor:"pointer",fontSize:13}}>
              {mode==="login"?"Criar grátis":"Entrar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Painel do cliente ─────────────────────────────────────────
function ClientDashboard({ session, slug, onLogout }:{ session:ClientSession; slug:string; onLogout:()=>void }) {
  const [appts,   setAppts]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<"proximos"|"historico">("proximos")
  const [cancelling, setCancelling] = useState<string|null>(null)

  useEffect(()=>{
    fetch(`/api/cliente/appointments?clientId=${session.id}`)
      .then(r=>r.json()).then(j=>{ setAppts(j.data??[]); setLoading(false) })
      .catch(()=>setLoading(false))
  },[session.id])

  async function cancel(id:string) {
    setCancelling(id)
    await fetch("/api/cliente/appointments", { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ appointmentId:id }) })
    setAppts(prev=>prev.map(a=>a.id===id?{...a,status:"CANCELLED"}:a))
    setCancelling(null)
  }

  const now     = new Date()
  const proximos = appts.filter(a=>new Date(a.scheduledAt)>=now && a.status!=="CANCELLED")
  const historico = appts.filter(a=>new Date(a.scheduledAt)<now || a.status==="DONE" || a.status==="CANCELLED")

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)"}}>
      {/* Header */}
      <div style={{background:"var(--bg-card)",borderBottom:"1px solid var(--border)",padding:"14px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:11,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:".04em"}}>Minha conta</div>
            <div style={{fontSize:17,fontWeight:600,color:"var(--text)"}}>Olá, {session.name.split(" ")[0]}! 👋</div>
          </div>
          <button onClick={onLogout} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"var(--text-3)",background:"transparent",border:"1px solid var(--border)",borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>
            <LogOut size={13}/>Sair
          </button>
        </div>
      </div>

      {/* Stats rápidos */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,padding:"14px 16px 0"}}>
        {[
          {label:"Próximos",    val:proximos.length},
          {label:"Realizados",  val:appts.filter(a=>a.status==="DONE").length},
          {label:"Total gasto", val:"R$"+appts.filter(a=>a.status==="DONE").reduce((s:number,a:any)=>s+Number(a.totalAmount),0).toLocaleString("pt-BR")},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"10px 12px"}}>
            <div style={{fontSize:16,fontWeight:600,color:"var(--text)"}}>{s.val}</div>
            <div style={{fontSize:10,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:".04em",marginTop:1}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Botão agendar */}
      <div style={{padding:"12px 16px 0"}}>
        <Link href={`/${slug}`} style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          background:"var(--accent)",color:"var(--accent-fg)",borderRadius:12,
          padding:"14px",textDecoration:"none",fontSize:14,fontWeight:600,
        }}>
          <Plus size={16}/>Agendar novo horário
        </Link>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",margin:"14px 0 0",padding:"0 16px"}}>
        {([["proximos","Próximos","proximos"],["historico","Histórico","historico"]] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:"8px 14px",border:"none",background:"transparent",
            color:tab===id?"var(--text)":"var(--text-3)",fontSize:13,cursor:"pointer",
            borderBottom:tab===id?"2px solid var(--accent)":"2px solid transparent",fontWeight:tab===id?500:400,
          }}>{label}</button>
        ))}
      </div>

      <div style={{padding:"14px 16px"}}>
        {loading&&<div style={{textAlign:"center",padding:32,color:"var(--text-4)",fontSize:13}}>Carregando…</div>}

        {!loading&&(tab==="proximos"?proximos:historico).length===0&&(
          <div style={{textAlign:"center",padding:"32px 16px",color:"var(--text-4)",fontSize:13}}>
            {tab==="proximos"?"Nenhum agendamento próximo.":"Nenhum agendamento no histórico."}
          </div>
        )}

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {(tab==="proximos"?proximos:historico).map((a:any)=>{
            const st   = STATUS[a.status]??STATUS.PENDING
            const date = new Date(a.scheduledAt)
            const past = date < now
            return (
              <div key={a.id} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:"14px",boxShadow:"var(--shadow)"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                  <div style={{width:44,height:44,borderRadius:10,background:"var(--bg-hover)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Scissors size={20} color="var(--text-3)"/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:15,fontWeight:600,color:"var(--text)",marginBottom:2}}>
                      {a.items?.map((i:any)=>i.name).join(", ")||"Agendamento"}
                    </div>
                    <div style={{fontSize:12,color:"var(--text-3)"}}>com {a.barber?.name}</div>
                  </div>
                  <div style={{fontSize:10,padding:"3px 8px",borderRadius:5,background:st.bg,color:st.fg,fontWeight:500,flexShrink:0}}>{st.label}</div>
                </div>

                <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--text-3)",marginBottom:12}}>
                  <Calendar size={13}/>
                  {date.toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long"})} às {date.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}
                </div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:15,fontWeight:600,color:"var(--text)"}}>{BRL(Number(a.totalAmount))}</div>
                  <div style={{display:"flex",gap:8}}>
                    {a.status==="CONFIRMED"&&!past&&(
                      <button onClick={()=>cancel(a.id)} disabled={cancelling===a.id} style={{
                        fontSize:12,padding:"7px 14px",borderRadius:8,
                        border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",cursor:"pointer",
                      }}>
                        {cancelling===a.id?"…":"Cancelar"}
                      </button>
                    )}
                    {(a.status==="DONE"||a.status==="CANCELLED")&&(
                      <Link href={`/${slug}`} style={{
                        fontSize:12,padding:"7px 14px",borderRadius:8,
                        border:"1px solid var(--border)",background:"var(--bg-hover)",
                        color:"var(--text)",textDecoration:"none",display:"flex",alignItems:"center",gap:4,
                      }}>
                        Repetir <ChevronRight size={12}/>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── PÁGINA PRINCIPAL ──────────────────────────────────────────
export default function MinhaContaPage() {
  const params = useParams()
  const slug   = params.slug as string
  const [session, setSession] = useState<ClientSession|null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(()=>{
    try {
      const saved = localStorage.getItem("bc_client")
      if (saved) {
        const data = JSON.parse(saved) as ClientSession
        if (data.slug === slug) setSession(data)
      }
    } catch {}
    setChecked(true)
  },[slug])

  const handleAuth  = (s:ClientSession) => setSession(s)
  const handleLogout = () => {
    localStorage.removeItem("bc_client")
    setSession(null)
  }

  if (!checked) return null

  return session
    ? <ClientDashboard session={session} slug={slug} onLogout={handleLogout}/>
    : <AuthScreen slug={slug} onAuth={handleAuth}/>
}
