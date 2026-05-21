"use client"
import { useState } from "react"
import { Check, CreditCard, FileText, AlertTriangle, ChevronRight, Shield, Zap } from "lucide-react"

const PLANS = [
  { id:"STARTER", name:"Starter", price:97,  color:"#6b7280",
    features:["1 barbeiro","Link de agendamento","Estoque básico","Histórico de clientes"] },
  { id:"PRO",     name:"Pro",     price:197, color:"#3b82f6",
    features:["Até 3 barbeiros","Order Bump no checkout","Lembretes automáticos WhatsApp","DRE e relatório financeiro","Comissões por barbeiro"] },
  { id:"ELITE",   name:"Elite",   price:297, color:"#8b5cf6",
    features:["Barbeiros ilimitados","Tudo do plano Pro","Relatórios avançados exportáveis","Integração PIX + Stripe","Gerente de conta dedicado"] },
]

const INVOICES = [
  {date:"01/05/2026",desc:"Plano Pro — Maio 2026",  amount:197,status:"paid"},
  {date:"01/04/2026",desc:"Plano Pro — Abril 2026", amount:197,status:"paid"},
  {date:"01/03/2026",desc:"Plano Pro — Março 2026", amount:197,status:"paid"},
]

export default function Billing() {
  const [planId,      setPlanId]      = useState("PRO")
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgraded,    setUpgraded]    = useState(false)
  const [showCancel,  setShowCancel]  = useState(false)
  const [cancelled,   setCancelled]   = useState(false)

  const plan       = PLANS.find(p=>p.id===planId)!
  const planIndex  = PLANS.findIndex(p=>p.id===planId)
  const nextPlans  = PLANS.filter((_,i)=>i>planIndex)
  const prevPlans  = PLANS.filter((_,i)=>i<planIndex)
  const nextBilling = "01/06/2026"

  const handleUpgrade = (newId: string) => {
    setPlanId(newId); setUpgraded(true); setShowUpgrade(false)
    setTimeout(()=>setUpgraded(false),3500)
  }

  return (
    <div style={{fontFamily:"var(--font-sans,system-ui)",color:"var(--color-text-primary)",maxWidth:580,margin:"0 auto",paddingBottom:40}}>
      <div style={{padding:"16px 16px 0"}}>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>BarberClick Admin</div>
        <div style={{fontSize:18,fontWeight:500}}>Assinatura e cobrança</div>
      </div>
      <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>

        {/* Plano atual */}
        <div style={{background:"var(--color-background-primary)",border:`1.5px solid ${plan.color}50`,borderRadius:14,padding:"18px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16}}>
            <div style={{width:48,height:48,borderRadius:12,background:plan.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Shield size={22} color={plan.color}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em",marginBottom:3}}>Plano atual</div>
              <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                <span style={{fontSize:22,fontWeight:500}}>{plan.name}</span>
                <span style={{fontSize:14,color:"var(--color-text-secondary)"}}>R$ {plan.price}/mês</span>
              </div>
            </div>
            <div style={{fontSize:10,background:plan.color+"18",color:plan.color,padding:"4px 10px",borderRadius:20,fontWeight:500,flexShrink:0}}>Ativo</div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
            {plan.features.map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:4,fontSize:12,color:"var(--color-text-secondary)"}}>
                <Check size={12} color="#10b981"/>{f}
              </div>
            ))}
          </div>
          <div style={{background:"var(--color-background-secondary)",borderRadius:9,padding:"10px 14px",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{color:"var(--color-text-secondary)"}}>Próxima cobrança</span>
            <span style={{fontWeight:500}}>{nextBilling} — R$ {plan.price}.00</span>
          </div>
          {upgraded ? (
            <div style={{background:"#d1fae5",borderRadius:9,padding:"11px 14px",fontSize:13,color:"#065f46",display:"flex",alignItems:"center",gap:6,fontWeight:500}}>
              <Check size={14}/> Plano atualizado com sucesso!
            </div>
          ) : cancelled ? (
            <div style={{background:"var(--color-background-secondary)",borderRadius:9,padding:"11px 14px",fontSize:13,color:"var(--color-text-secondary)",textAlign:"center"}}>
              Assinatura cancelada. Acesso até {nextBilling}.
            </div>
          ) : (
            <div style={{display:"flex",gap:8}}>
              {nextPlans.length>0&&(
                <button onClick={()=>setShowUpgrade(true)} style={{flex:1,padding:"11px",borderRadius:9,border:"none",cursor:"pointer",background:"var(--color-text-primary)",color:"var(--color-background-primary)",fontSize:13,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                  <Zap size={14}/>Fazer upgrade
                </button>
              )}
              {prevPlans.length>0&&(
                <button onClick={()=>setShowUpgrade(true)} style={{flex:1,padding:"11px",borderRadius:9,border:"0.5px solid var(--color-border-secondary)",cursor:"pointer",background:"transparent",color:"var(--color-text-secondary)",fontSize:13}}>
                  Fazer downgrade
                </button>
              )}
            </div>
          )}
        </div>

        {/* Seleção de plano */}
        {showUpgrade&&(
          <div style={{background:"var(--color-background-primary)",border:"2px solid var(--color-text-primary)",borderRadius:14,padding:"16px"}}>
            <div style={{fontSize:14,fontWeight:500,marginBottom:14}}>Mudar de plano</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {PLANS.filter(p=>p.id!==planId).map(p=>(
                <div key={p.id} onClick={()=>handleUpgrade(p.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:`0.5px solid ${p.color}40`,cursor:"pointer",background:"var(--color-background-primary)"}}>
                  <div style={{width:32,height:32,borderRadius:8,background:p.color+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <Shield size={16} color={p.color}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:p.color}}>{p.name}</div>
                    <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:1}}>{p.features.slice(0,3).join(" · ")}</div>
                  </div>
                  <div style={{fontSize:14,fontWeight:500,flexShrink:0}}>R$ {p.price}/mês</div>
                  <ChevronRight size={14} style={{color:"var(--color-text-tertiary)",flexShrink:0}}/>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowUpgrade(false)} style={{marginTop:10,width:"100%",padding:"9px",borderRadius:8,fontSize:13,border:"0.5px solid var(--color-border-tertiary)",background:"transparent",cursor:"pointer",color:"var(--color-text-secondary)"}}>
              Cancelar
            </button>
          </div>
        )}

        {/* Método de pagamento */}
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>Método de pagamento</div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:34,background:"var(--color-background-secondary)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <CreditCard size={18} style={{color:"var(--color-text-secondary)"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:500}}>Cartão de crédito</div>
              <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>•••• •••• •••• 4242 · Validade 12/27</div>
            </div>
            <button style={{fontSize:12,color:"var(--color-text-secondary)",flexShrink:0}}>Alterar</button>
          </div>
        </div>

        {/* Faturas */}
        <div style={{background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:12,padding:"16px"}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>Faturas</div>
          {INVOICES.map((inv,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<INVOICES.length-1?"0.5px solid var(--color-border-tertiary)":"none"}}>
              <div style={{width:34,height:34,borderRadius:8,background:"#d1fae5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <FileText size={14} color="#065f46"/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.desc}</div>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:1}}>{inv.date}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:13,fontWeight:500}}>R$ {inv.amount}.00</div>
                <div style={{fontSize:10,background:"#d1fae5",color:"#065f46",padding:"2px 7px",borderRadius:4,fontWeight:500,display:"inline-block",marginTop:2}}>Pago</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cancelamento */}
        {!cancelled&&(
          <div style={{background:"var(--color-background-danger)",border:"0.5px solid var(--color-border-danger)",borderRadius:12,padding:"14px"}}>
            {!showCancel ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-danger)"}}>Cancelar assinatura</div>
                  <div style={{fontSize:12,color:"var(--color-text-danger)",opacity:.85,marginTop:2}}>Você perderá o acesso ao painel ao final do período</div>
                </div>
                <button onClick={()=>setShowCancel(true)} style={{fontSize:12,border:"0.5px solid var(--color-border-danger)",borderRadius:6,padding:"6px 12px",background:"transparent",color:"var(--color-text-danger)",cursor:"pointer",flexShrink:0}}>
                  Cancelar
                </button>
              </div>
            ) : (
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                  <AlertTriangle size={16} style={{color:"var(--color-text-danger)",flexShrink:0}}/>
                  <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-danger)"}}>Tem certeza?</div>
                </div>
                <div style={{fontSize:12,color:"var(--color-text-danger)",opacity:.9,marginBottom:14,lineHeight:1.6}}>
                  Você terá acesso até <strong>{nextBilling}</strong>. Após essa data sua barbearia ficará desativada.
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setShowCancel(false)} style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",background:"var(--color-text-primary)",color:"var(--color-background-primary)",fontSize:13,fontWeight:500}}>
                    Manter assinatura
                  </button>
                  <button onClick={()=>{setCancelled(true);setShowCancel(false)}} style={{padding:"10px 16px",borderRadius:8,border:"0.5px solid var(--color-border-danger)",background:"transparent",color:"var(--color-text-danger)",fontSize:13,cursor:"pointer"}}>
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
