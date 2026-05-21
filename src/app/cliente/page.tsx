"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Scissors, Eye, EyeOff } from "lucide-react"
import { Suspense } from "react"

function LoginForm() {
  const router  = useRouter()
  const params  = useSearchParams()
  const slug    = params.get("slug") ?? "barbearia-demo"
  const shop    = params.get("shop") ?? "BarberClick"

  const [phone,    setPhone]    = useState(params.get("phone") ?? "")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!phone || !password) { setError("Preencha todos os campos"); return }
    setLoading(true); setError("")
    const res = await fetch("/api/cliente/auth", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ type:"login", phone, password, barbershopSlug: slug }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push(`/cliente/dashboard?slug=${slug}`)
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ width:"100%", maxWidth:380 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:56,height:56,background:"white",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>
            <Scissors size={26} color="#111"/>
          </div>
          <div style={{ fontSize:22,fontWeight:600,color:"white",marginBottom:4 }}>{shop}</div>
          <div style={{ fontSize:14,color:"rgba(255,255,255,.5)" }}>Acesse sua área de cliente</div>
        </div>

        {/* Card */}
        <div style={{ background:"#1e293b",borderRadius:16,padding:24,border:"1px solid #334155" }}>
          {error && (
            <div style={{ background:"#450a0a",border:"1px solid #7f1d1d",color:"#f87171",borderRadius:9,padding:"10px 14px",fontSize:13,marginBottom:16 }}>
              {error}
            </div>
          )}

          <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:20 }}>
            <div>
              <label style={{ fontSize:12,color:"rgba(255,255,255,.5)",display:"block",marginBottom:5 }}>WhatsApp / Telefone</label>
              <input
                value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                style={{ width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #334155",color:"white",fontSize:14 }}
              />
            </div>
            <div>
              <label style={{ fontSize:12,color:"rgba(255,255,255,.5)",display:"block",marginBottom:5 }}>Senha</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Sua senha"
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                  style={{ width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #334155",color:"white",fontSize:14,paddingRight:40 }}
                />
                <button onClick={()=>setShowPw(v=>!v)} style={{ position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",padding:0 }}>
                  {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                </button>
              </div>
            </div>
          </div>

          <button onClick={handleLogin} disabled={loading} style={{
            width:"100%",padding:"13px",borderRadius:10,border:"none",cursor:"pointer",
            background:"white",color:"#111",fontSize:14,fontWeight:600,
          }}>
            {loading?"Entrando…":"Entrar"}
          </button>

          <div style={{ textAlign:"center",marginTop:16,fontSize:13,color:"rgba(255,255,255,.4)" }}>
            Não tem conta ainda?{" "}
            <a href={`/${slug}`} style={{ color:"rgba(255,255,255,.7)",fontWeight:500 }}>Faça um agendamento</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClienteLogin() {
  return <Suspense><LoginForm/></Suspense>
}
