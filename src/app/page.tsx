"use client"
import { useState } from "react"
import { Check, Scissors, Calendar, Users, BarChart2, Zap, Crown, Shield, ArrowRight, Menu, X, Star, MessageCircle, Package } from "lucide-react"

const GOLD="#f59e0b"
const DARK="#080808"

function Nav(){
  const [open,setOpen]=useState(false)
  return(
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(8,8,8,.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid #111"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,background:GOLD,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Scissors size={18} color="#000"/>
          </div>
          <span style={{fontSize:18,fontWeight:800,color:"white",letterSpacing:"-.3px"}}>BarberaSystem</span>
        </div>
        {/* Desktop nav */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <a href="#features"  style={{padding:"8px 14px",color:"#888",fontSize:14,textDecoration:"none",display:"none"}}>Recursos</a>
          <a href="#pricing"   style={{padding:"8px 14px",color:"#888",fontSize:14,textDecoration:"none"}}>Planos</a>
          <a href="/barbearia-demo" target="_blank" style={{padding:"8px 14px",color:"#888",fontSize:14,textDecoration:"none"}}>Ver demo</a>
          <a href="/login"     style={{padding:"9px 16px",borderRadius:9,border:"1px solid #222",color:"white",fontSize:14,textDecoration:"none",fontWeight:500}}>Entrar</a>
          <a href="/cadastro"  style={{padding:"9px 16px",borderRadius:9,background:GOLD,color:"#000",fontSize:14,textDecoration:"none",fontWeight:700}}>Começar grátis</a>
        </div>
      </div>
    </nav>
  )
}

const FEATURES=[
  {Icon:Calendar,  title:"Agendamento online",    desc:"Link de agendamento para o cliente marcar sem precisar ligar. Funciona 24h.",          color:"#3b82f6"},
  {Icon:Crown,     title:"Clube de assinaturas",  desc:"Crie planos mensais, fidelize clientes e tenha receita recorrente todo mês.",          color:GOLD},
  {Icon:Users,     title:"Painel do barbeiro",    desc:"Cada barbeiro acessa só os próprios dados: agenda, comissão e metas.",                  color:"#10b981"},
  {Icon:BarChart2, title:"Relatórios e DRE",      desc:"Faturamento, lucro, comissões e estoque num painel completo.",                         color:"#8b5cf6"},
  {Icon:Zap,       title:"Venda rápida",          desc:"Lance vendas em segundos diretamente pelo celular, sem burocracia.",                   color:"#f97316"},
  {Icon:Package,   title:"Controle de estoque",   desc:"Gerencie produtos, alertas de estoque baixo e margem de lucro.",                       color:"#ec4899"},
]

const STEPS=[
  {n:"01", title:"Cadastre sua barbearia",  desc:"Crie sua conta em minutos. Configure serviços, barbeiros e horários de funcionamento."},
  {n:"02", title:"Compartilhe o link",      desc:"Coloque o link de agendamento na bio do Instagram e deixe os clientes marcarem sozinhos."},
  {n:"03", title:"Gerencie tudo aqui",      desc:"Acompanhe agendamentos, comissões, estoque e clube de assinaturas num só lugar."},
]

const PLANS=[
  {name:"Starter", price:"97",  color:"#6b7280", features:["1 barbeiro","Link de agendamento","Controle de estoque","Histórico de clientes"]},
  {name:"Pro",     price:"197", color:GOLD,       badge:"Mais popular", features:["Até 3 barbeiros","Clube de assinaturas","Lembretes WhatsApp","DRE completo","Comissões automáticas","Venda rápida"]},
  {name:"Elite",   price:"297", color:"#8b5cf6", features:["Barbeiros ilimitados","Tudo do Pro","Relatórios avançados","Exportação de dados","Suporte prioritário","Múltiplas unidades"]},
]

export default function LandingPage(){
  return(
    <div style={{background:DARK,color:"white",fontFamily:"system-ui,-apple-system,sans-serif",minHeight:"100vh"}}>
      <Nav/>

      {/* HERO */}
      <section style={{padding:"140px 24px 80px",textAlign:"center",background:`linear-gradient(180deg,#0f0b00 0%,${DARK} 60%)`}}>
        <div style={{maxWidth:720,margin:"0 auto"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#1a1500",border:"1px solid #3a2800",borderRadius:20,padding:"6px 14px",fontSize:12,color:GOLD,fontWeight:700,letterSpacing:".06em",textTransform:"uppercase",marginBottom:20}}>
            <Star size={12} fill={GOLD}/> Gestão completa para barbearias
          </div>
          <h1 style={{fontSize:"clamp(32px,6vw,56px)",fontWeight:900,lineHeight:1.05,letterSpacing:"-1px",marginBottom:20}}>
            Tudo que sua barbearia<br/>
            precisa em <span style={{color:GOLD}}>um só lugar</span>
          </h1>
          <p style={{fontSize:18,color:"#888",lineHeight:1.7,maxWidth:520,margin:"0 auto 36px"}}>
            Agendamento online, clube de assinaturas, controle de comissões e muito mais. Do Starter ao Elite, seu negócio organizado do jeito certo.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/cadastro" style={{padding:"15px 28px",borderRadius:12,background:`linear-gradient(135deg,${GOLD},#d97706)`,color:"#000",fontSize:16,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
              Começar grátis <ArrowRight size={18}/>
            </a>
            <a href="/barbearia-demo" target="_blank" style={{padding:"15px 28px",borderRadius:12,border:"1px solid #222",color:"white",fontSize:16,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
              Ver demonstração
            </a>
          </div>
          <p style={{marginTop:16,fontSize:12,color:"#444"}}>Sem cartão de crédito · Cancele quando quiser</p>
        </div>

        {/* Preview do app */}
        <div style={{maxWidth:900,margin:"60px auto 0",background:"#0f0f0f",borderRadius:20,border:"1px solid #1a1a1a",padding:"24px",boxShadow:"0 40px 100px rgba(0,0,0,.6)"}}>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {["#ff5f57","#ffbd2e","#28c840"].map(c=><div key={c} style={{width:12,height:12,borderRadius:"50%",background:c}}/>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:10}}>
            {[
              {label:"Faturamento",    val:"R$ 8.540",  color:"#10b981"},
              {label:"Agendamentos",   val:"47",         color:"#3b82f6"},
              {label:"Assinantes",     val:"12",         color:GOLD     },
              {label:"Lucro líquido",  val:"R$ 6.693",  color:"#8b5cf6"},
            ].map(k=>(
              <div key={k.label} style={{background:"#111",borderRadius:12,padding:"16px",border:"1px solid #1a1a1a"}}>
                <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>{k.label}</div>
                <div style={{fontSize:22,fontWeight:800,color:k.color}}>{k.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{padding:"80px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:10}}>Recursos</div>
          <h2 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,marginBottom:12}}>Tudo que você precisa para crescer</h2>
          <p style={{color:"#666",fontSize:16,maxWidth:480,margin:"0 auto"}}>Do agendamento ao clube de assinaturas, tudo integrado e fácil de usar.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {FEATURES.map(f=>(
            <div key={f.title} style={{background:"#0f0f0f",border:"1px solid #1a1a1a",borderRadius:16,padding:24}}>
              <div style={{width:44,height:44,borderRadius:12,background:`${f.color}15`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14}}>
                <f.Icon size={20} color={f.color}/>
              </div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:6}}>{f.title}</div>
              <div style={{fontSize:14,color:"#666",lineHeight:1.6}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{padding:"80px 24px",background:"#0a0a0a"}}>
        <div style={{maxWidth:900,margin:"0 auto",textAlign:"center"}}>
          <div style={{fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:10}}>Como funciona</div>
          <h2 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,marginBottom:48}}>Pronto em menos de 10 minutos</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:24}}>
            {STEPS.map((s,i)=>(
              <div key={i} style={{textAlign:"left"}}>
                <div style={{fontSize:40,fontWeight:900,color:"#1a1a1a",marginBottom:12,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:17,fontWeight:700,marginBottom:8}}>{s.title}</div>
                <div style={{fontSize:14,color:"#666",lineHeight:1.7}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CLUBE DE ASSINATURAS */}
      <section style={{padding:"80px 24px",maxWidth:1100,margin:"0 auto"}}>
        <div style={{background:"linear-gradient(135deg,#1a0f00,#0f0b00)",borderRadius:24,padding:"48px 40px",border:"1px solid #2a1a00",display:"flex",alignItems:"center",gap:40,flexWrap:"wrap"}}>
          <div style={{flex:1,minWidth:260}}>
            <div style={{fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:12}}>Novidade</div>
            <h2 style={{fontSize:"clamp(22px,3vw,32px)",fontWeight:900,marginBottom:14,lineHeight:1.2}}>Clube de assinaturas<br/>para sua barbearia</h2>
            <p style={{color:"#888",fontSize:15,lineHeight:1.7,marginBottom:24}}>Crie planos mensais, fidelize seus clientes e garanta uma receita previsível todo mês. Seus clientes pagam um valor fixo e têm direito a cortes ilimitados ou pacotes de serviços.</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:28}}>
              {["Planos personalizados (Na Régua, Navalha, Golden Boy…)","Controle de uso por serviço com barras de progresso","Página pública para o cliente assinar pela bio do Instagram","Gestão completa de assinantes no painel admin"].map(t=>(
                <div key={t} style={{display:"flex",alignItems:"flex-start",gap:8,fontSize:14,color:"#aaa"}}>
                  <Check size={15} color={GOLD} style={{flexShrink:0,marginTop:2}}/>{t}
                </div>
              ))}
            </div>
            <a href="/barbearia-demo/clube" target="_blank" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"12px 22px",borderRadius:10,background:GOLD,color:"#000",fontSize:14,fontWeight:700,textDecoration:"none"}}>
              <Crown size={16}/>Ver exemplo de clube
            </a>
          </div>
          <div style={{flex:1,minWidth:260,display:"flex",flexDirection:"column",gap:10}}>
            {[{name:"Na Régua",price:"R$ 109,90",svcs:"3x Corte com sobrancelha"},{name:"Navalha",price:"R$ 139,90",svcs:"4x Corte + 1x Pigmentação + 2x Pezinho"},{name:"Golden Boy",price:"R$ 199,90",svcs:"4x Corte + ∞ Pezinho + 2x Pigmentação + 1x Luzes"}].map((p,i)=>(
              <div key={i} style={{background:"rgba(0,0,0,.4)",border:`1px solid ${[GOLD,"#8b5cf6","#f97316"][i]}30`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:["#f59e0b","#a78bfa","#fb923c"][i]}}>{p.name}</div>
                  <div style={{fontSize:11,color:"#555",marginTop:2}}>{p.svcs}</div>
                </div>
                <div style={{fontSize:16,fontWeight:800,color:"white",flexShrink:0}}>{p.price}<span style={{fontSize:11,color:"#444"}}>/mês</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section id="pricing" style={{padding:"80px 24px",background:"#0a0a0a"}}>
        <div style={{maxWidth:1000,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:48}}>
            <div style={{fontSize:11,color:GOLD,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:10}}>Planos</div>
            <h2 style={{fontSize:"clamp(24px,4vw,36px)",fontWeight:800,marginBottom:12}}>Simples e transparente</h2>
            <p style={{color:"#666",fontSize:16}}>Sem taxa de adesão. Cancele quando quiser.</p>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
            {PLANS.map((p,i)=>(
              <div key={p.name} style={{background:i===1?"#0f0b00":"#0f0f0f",border:`1.5px solid ${i===1?p.color+"40":"#1a1a1a"}`,borderRadius:20,padding:28,position:"relative"}}>
                {p.badge&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:p.color,color:"#000",fontSize:11,fontWeight:700,padding:"4px 14px",borderRadius:20,whiteSpace:"nowrap"}}>{p.badge}</div>}
                <div style={{fontSize:11,color:p.color,textTransform:"uppercase",letterSpacing:".1em",fontWeight:700,marginBottom:6}}>Plano</div>
                <div style={{fontSize:22,fontWeight:800,marginBottom:4}}>{p.name}</div>
                <div style={{fontSize:32,fontWeight:900,color:p.color,marginBottom:20}}>R$ {p.price}<span style={{fontSize:14,color:"#444",fontWeight:400}}>/mês</span></div>
                <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:24}}>
                  {p.features.map(f=>(
                    <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#ccc"}}>
                      <Check size={13} color={p.color}/>{f}
                    </div>
                  ))}
                </div>
                <a href="/cadastro" style={{display:"block",padding:"13px",borderRadius:11,border:`1.5px solid ${p.color}`,background:i===1?p.color:"transparent",color:i===1?"#000":"white",fontSize:14,fontWeight:700,textDecoration:"none",textAlign:"center"}}>
                  Começar com {p.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:"80px 24px",textAlign:"center"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{width:64,height:64,background:GOLD,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px"}}>
            <Scissors size={30} color="#000"/>
          </div>
          <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:900,marginBottom:14,letterSpacing:"-.5px"}}>
            Pronto para transformar<br/>sua barbearia?
          </h2>
          <p style={{color:"#666",fontSize:16,lineHeight:1.7,marginBottom:32}}>
            Junte-se às barbearias que já usam o BarberaSystem e organize tudo num só lugar.
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <a href="/cadastro" style={{padding:"15px 32px",borderRadius:12,background:`linear-gradient(135deg,${GOLD},#d97706)`,color:"#000",fontSize:16,fontWeight:800,textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
              Criar conta grátis <ArrowRight size={18}/>
            </a>
            <a href="https://wa.me/5511999999999?text=Quero+saber+mais+sobre+o+BarberaSystem" target="_blank" style={{padding:"15px 24px",borderRadius:12,border:"1px solid #222",color:"white",fontSize:15,fontWeight:500,textDecoration:"none",display:"flex",alignItems:"center",gap:8}}>
              <MessageCircle size={17}/>Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid #111",padding:"32px 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:28,height:28,background:GOLD,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Scissors size={14} color="#000"/>
            </div>
            <span style={{fontSize:15,fontWeight:700,color:"white"}}>BarberaSystem</span>
          </div>
          <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
            {[["Ver demo","/barbearia-demo"],["Entrar","/login"],["Cadastro","/cadastro"],["Clube demo","/barbearia-demo/clube"]].map(([l,h])=>(
              <a key={l} href={h} style={{fontSize:13,color:"#555",textDecoration:"none"}}>{l}</a>
            ))}
          </div>
          <div style={{fontSize:12,color:"#333"}}>© 2026 BarberaSystem</div>
        </div>
      </footer>
    </div>
  )
}
