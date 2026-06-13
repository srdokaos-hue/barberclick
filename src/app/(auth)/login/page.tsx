"use client"
import { signIn, getSession } from "next-auth/react"
import { useState } from "react"
import { Scissors } from "lucide-react"

// Pattern sutil de barbearia (tesoura + pente) — tile 120x120, opacidade baixa
const BARBER_PATTERN = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'>
  <g fill='none' stroke='#e5e7eb' stroke-width='2' stroke-linecap='round' opacity='0.06'>
    <circle cx='20' cy='30' r='6'/>
    <circle cx='20' cy='46' r='6'/>
    <line x1='25' y1='33' x2='54' y2='52'/>
    <line x1='25' y1='43' x2='54' y2='24'/>
    <rect x='68' y='80' width='42' height='11' rx='2'/>
    <line x1='73' y1='91' x2='73' y2='103'/>
    <line x1='80' y1='91' x2='80' y2='103'/>
    <line x1='87' y1='91' x2='87' y2='103'/>
    <line x1='94' y1='91' x2='94' y2='103'/>
    <line x1='101' y1='91' x2='101' y2='103'/>
  </g>
</svg>`)

export default function LoginPage() {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if(!email||!password){setError("Preencha todos os campos");return}
    setLoading(true);setError("")
    const res = await signIn("credentials",{email,password,redirect:false})
    if(res?.error){setError("E-mail ou senha incorretos");setLoading(false);return}
    const session = await getSession()
    const role = (session?.user as any)?.role
    window.location.href = role==="BARBER" ? "/barber/dashboard" : "/dashboard"
  }

  return(
    <div style={{minHeight:"100vh",width:"100%",background:"#0f172a",backgroundImage:`url("data:image/svg+xml,${BARBER_PATTERN}")`,backgroundSize:"120px 120px",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:60,height:60,background:"white",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Scissors size={28} color="#111"/>
          </div>
          <div style={{fontSize:24,fontWeight:700,color:"white",marginBottom:4}}>BarberaSystem</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,.45)"}}>Painel administrativo</div>
        </div>
        <div style={{background:"#1e293b",borderRadius:16,padding:24,border:"1px solid #334155"}}>
          {error&&<div style={{background:"#450a0a",border:"1px solid #7f1d1d",color:"#f87171",borderRadius:9,padding:"10px 14px",fontSize:13,marginBottom:16}}>{error}</div>}
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
            <div>
              <label style={{fontSize:12,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>E-mail</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="seu@email.com"
                style={{width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #334155",color:"white",fontSize:14,borderRadius:8,padding:"10px 12px"}}/>
            </div>
            <div>
              <label style={{fontSize:12,color:"rgba(255,255,255,.45)",display:"block",marginBottom:5}}>Senha</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="••••••••"
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                style={{width:"100%",boxSizing:"border-box",background:"#0f172a",border:"1px solid #334155",color:"white",fontSize:14,borderRadius:8,padding:"10px 12px"}}/>
            </div>
          </div>
          <button onClick={handleLogin} disabled={loading} style={{width:"100%",padding:"13px",borderRadius:10,border:"none",cursor:"pointer",background:"white",color:"#111",fontSize:14,fontWeight:700}}>
            {loading?"Entrando…":"Entrar"}
          </button>
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:12,color:"rgba(255,255,255,.25)"}}>
          BarberaSystem · Gestão inteligente para barbearias
        </div>
      </div>
    </div>
  )
}
