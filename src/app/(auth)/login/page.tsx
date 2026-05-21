"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError("Preencha todos os campos."); return }
    setLoading(true); setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) setError("E-mail ou senha incorretos.")
    else router.push("/dashboard")
  }

  return (
    <div style={{ width:"100%", maxWidth:380, background:"white", border:"1px solid #e5e7eb",
                  borderRadius:16, padding:32, boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontSize:13, color:"#9ca3af", letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>BarberClick</div>
        <div style={{ fontSize:22, fontWeight:500 }}>Entrar na sua conta</div>
      </div>
      {error && (
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626",
                      borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:16 }}>
          {error}
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
        <div>
          <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>E-mail</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="seu@email.com" style={{ width:"100%", boxSizing:"border-box" }}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        </div>
        <div>
          <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>Senha</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            placeholder="••••••••" style={{ width:"100%", boxSizing:"border-box" }}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
        </div>
      </div>
      <button onClick={handleLogin} disabled={loading} style={{
        width:"100%", padding:"13px", borderRadius:10, border:"none", cursor:"pointer",
        background:"#111", color:"white", fontSize:14, fontWeight:500,
      }}>
        {loading ? "Entrando…" : "Entrar"}
      </button>
      <div style={{ textAlign:"center", marginTop:20, fontSize:13, color:"#6b7280" }}>
        Sem conta?{" "}
        <Link href="/cadastro" style={{ color:"#111", fontWeight:500 }}>Criar gratuitamente</Link>
      </div>
    </div>
  )
}
