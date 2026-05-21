// Cadastro SaaS — seleciona plano e cria barbearia
// Para o código completo interativo, ver: /mnt/user-data/outputs/BarberClickSignup.jsx
// Esta versão faz a integração real com a API

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"

const PLANS = [
  { id:"STARTER", name:"Starter", price:97,  color:"#6b7280", highlight:false,
    features:["1 barbeiro","Link de agendamento","Estoque básico"] },
  { id:"PRO",     name:"Pro",     price:197, color:"#3b82f6", highlight:true,
    features:["Até 3 barbeiros","Order Bump","Lembretes WhatsApp","DRE completo"] },
  { id:"ELITE",   name:"Elite",   price:297, color:"#8b5cf6", highlight:false,
    features:["Barbeiros ilimitados","Tudo do Pro","Relatórios avançados","Gerente dedicado"] },
]

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"")

export default function CadastroPage() {
  const router = useRouter()
  const [step,  setStep]  = useState(1)
  const [plan,  setPlan]  = useState("PRO")
  const [form,  setForm]  = useState({ shopName:"", slug:"", ownerName:"", email:"", password:"" })
  const [error, setError] = useState("")
  const [loading,setLoad] = useState(false)

  const set = (k: string, v: string) => setForm(f=>({...f,[k]:v}))
  const onName = (v: string) => { set("shopName",v); set("slug",slugify(v)) }
  const canSave = form.shopName.length>1 && form.slug.length>2 && form.ownerName.length>1 &&
                  form.email.includes("@") && form.password.length>=8

  async function handleSubmit() {
    setLoad(true); setError("")
    try {
      const res = await fetch("/api/auth/signup", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ barbershopName:form.shopName, slug:form.slug,
          ownerName:form.ownerName, email:form.email, password:form.password, plan }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Erro ao criar conta."); setLoad(false); return }
      router.push("/login?welcome=1")
    } catch { setError("Erro de conexão. Tente novamente."); setLoad(false) }
  }

  const sel = PLANS.find(p=>p.id===plan)!

  return (
    <div style={{ width:"100%", maxWidth:680, padding:"0 8px" }}>
      <div style={{ textAlign:"center", marginBottom:24 }}>
        <div style={{ fontSize:11, color:"#9ca3af", letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>BarberClick</div>
        <div style={{ fontSize:22, fontWeight:500, marginBottom:4 }}>14 dias grátis, sem cartão</div>
        <div style={{ fontSize:13, color:"#6b7280" }}>Configure em 2 minutos.</div>
      </div>

      {/* Step 1: Plano */}
      {step===1&&(
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12, marginBottom:16 }}>
            {PLANS.map(p=>(
              <div key={p.id} onClick={()=>setPlan(p.id)} style={{
                border:plan===p.id?`2px solid ${p.color}`:"1px solid #e5e7eb",
                borderRadius:14,padding:"18px 16px",cursor:"pointer",position:"relative",
                background:plan===p.id?`${p.color}09`:"white",
              }}>
                {p.highlight&&<div style={{ position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",
                  background:p.color,color:"white",fontSize:10,fontWeight:500,padding:"3px 12px",borderRadius:10,whiteSpace:"nowrap" }}>
                  Mais popular</div>}
                <div style={{ fontSize:16,fontWeight:500,color:p.color,marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:26,fontWeight:500,marginBottom:14 }}>R${p.price}<span style={{ fontSize:12,color:"#9ca3af" }}>/mês</span></div>
                {p.features.map(f=>(
                  <div key={f} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#4b5563",marginBottom:4 }}>
                    <Check size={12} color="#10b981"/>{f}
                  </div>
                ))}
                {plan===p.id&&<div style={{ position:"absolute",top:12,right:12,width:20,height:20,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center" }}><Check size={11} color="white"/></div>}
              </div>
            ))}
          </div>
          <button onClick={()=>setStep(2)} style={{ width:"100%",padding:"14px",borderRadius:10,border:"none",
            background:"#111",color:"white",fontSize:14,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
            Continuar com {sel.name} <ArrowRight size={14}/>
          </button>
        </div>
      )}

      {/* Step 2: Dados */}
      {step===2&&(
        <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:24 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20 }}>
            <div style={{ fontSize:14,fontWeight:500 }}>Plano {sel.name} · R${sel.price}/mês</div>
            <button onClick={()=>setStep(1)} style={{ fontSize:12,color:"#6b7280",border:"1px solid #e5e7eb",borderRadius:6,padding:"4px 10px" }}>Alterar</button>
          </div>
          {error&&<div style={{ background:"#fef2f2",border:"1px solid #fca5a5",color:"#dc2626",borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16 }}>{error}</div>}
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            <div><label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:4 }}>Nome da barbearia</label>
              <input value={form.shopName} onChange={e=>onName(e.target.value)} placeholder="Ex: Barbearia do Erickson" style={{ width:"100%",boxSizing:"border-box" }}/></div>
            {form.slug&&<div style={{ fontSize:11,color:"#6b7280",paddingLeft:2 }}>barberclick.app/<strong style={{ color:"#111" }}>{form.slug}</strong></div>}
            <div><label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:4 }}>Seu nome</label>
              <input value={form.ownerName} onChange={e=>set("ownerName",e.target.value)} placeholder="Nome completo" style={{ width:"100%",boxSizing:"border-box" }}/></div>
            <div><label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:4 }}>E-mail</label>
              <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="seu@email.com" style={{ width:"100%",boxSizing:"border-box" }}/></div>
            <div><label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:4 }}>Senha (mín. 8 caracteres)</label>
              <input type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" style={{ width:"100%",boxSizing:"border-box" }}/></div>
          </div>
          <div style={{ display:"flex",gap:8,marginTop:16 }}>
            <button onClick={()=>setStep(1)} style={{ padding:"12px 16px",borderRadius:10,flexShrink:0 }}>← Voltar</button>
            <button onClick={handleSubmit} disabled={!canSave||loading} style={{
              flex:1,padding:"13px",borderRadius:10,border:"none",
              background:canSave&&!loading?"#111":"#e5e7eb",
              color:canSave&&!loading?"white":"#9ca3af",fontSize:14,fontWeight:500,cursor:canSave?"pointer":"not-allowed",
            }}>{loading?"Criando…":"Criar barbearia grátis"}</button>
          </div>
        </div>
      )}
      <div style={{ textAlign:"center",marginTop:16,fontSize:12,color:"#9ca3af" }}>
        Já tem conta? <Link href="/login" style={{ color:"#111",fontWeight:500 }}>Entrar</Link>
      </div>
    </div>
  )
}
