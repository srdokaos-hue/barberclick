"use client"
import { useState } from "react"
import { Check, Bell, Calendar, Package, Scissors, CreditCard, Plus, Trash2, Upload } from "lucide-react"

const PRODUCTS_MOCK = [
  {id:"p1",name:"Pomada Matte Loja",price:45},
  {id:"p2",name:"Óleo de Barba Premium",price:65},
  {id:"p3",name:"Shampoo Antiqueda",price:55},
]
const WEEK = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]

const Toggle = ({on,onChange}:{on:boolean;onChange:(v:boolean)=>void}) => (
  <div onClick={()=>onChange(!on)} style={{width:42,height:24,borderRadius:12,cursor:"pointer",flexShrink:0,position:"relative",background:on?"var(--accent)":"var(--border)",transition:"background .2s"}}>
    <div style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left .15s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
  </div>
)
const Field = ({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <label style={{fontSize:12,color:"var(--text-3)"}}>{label}</label>
    {children}
    {hint&&<div style={{fontSize:11,color:"var(--text-4)"}}>{hint}</div>}
  </div>
)
const SCard = ({children}:{children:React.ReactNode}) => (
  <div style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:14,padding:20,boxShadow:"var(--shadow)",display:"flex",flexDirection:"column",gap:16}}>{children}</div>
)
function SaveBtn({section,saved,onSave}:{section:string;saved:string;onSave:(s:string)=>void}) {
  const ok=saved===section
  return (
    <button onClick={()=>onSave(section)} style={{padding:"10px 20px",borderRadius:9,border:"none",cursor:"pointer",background:ok?"#10b981":"var(--accent)",color:ok?"white":"var(--accent-fg)",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,transition:"background .25s"}}>
      {ok?<><Check size={14}/>Salvo!</>:"Salvar alterações"}
    </button>
  )
}

const TABS = [
  {id:"barbearia",label:"Barbearia",Icon:Scissors},
  {id:"agenda",   label:"Agenda",   Icon:Calendar},
  {id:"bump",     label:"Order Bump",Icon:Package},
  {id:"lembretes",label:"Lembretes",Icon:Bell},
  {id:"planos",   label:"Planos",   Icon:CreditCard},
]

interface Plano{id:string;name:string;price:string;features:string[]}
const PLANOS_INIT:Plano[]=[
  {id:"p1",name:"Starter", price:"97", features:["1 barbeiro","Link de agendamento"]},
  {id:"p2",name:"Pro",     price:"197",features:["Até 3 barbeiros","Order Bump","Lembretes WhatsApp","DRE completo"]},
  {id:"p3",name:"Elite",   price:"297",features:["Barbeiros ilimitados","Tudo do Pro","Relatórios avançados"]},
]

function PlanoEditor({plano,onChange,onRemove}:{plano:Plano;onChange:(p:Plano)=>void;onRemove:()=>void}) {
  const [feat,setFeat]=useState("")
  return (
    <div style={{background:"var(--bg-hover)",border:"1px solid var(--border)",borderRadius:12,padding:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr auto",gap:8}}>
          <Field label="Nome do plano"><input value={plano.name} onChange={e=>onChange({...plano,name:e.target.value})} style={{fontSize:13}}/></Field>
          <Field label="R$/mês"><input type="number" value={plano.price} onChange={e=>onChange({...plano,price:e.target.value})} style={{width:90,fontSize:13}}/></Field>
        </div>
        <button onClick={onRemove} style={{width:32,height:32,borderRadius:8,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginTop:16}}><Trash2 size={14}/></button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:8}}>
        {plano.features.map((f,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:13,color:"var(--text-2)"}}>
            <Check size={12} color="#10b981"/><span style={{flex:1}}>{f}</span>
            <button onClick={()=>onChange({...plano,features:plano.features.filter((_,j)=>j!==i)})} style={{width:20,height:20,borderRadius:4,border:"none",background:"transparent",color:"var(--text-4)",cursor:"pointer"}}>×</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:6}}>
        <input value={feat} onChange={e=>setFeat(e.target.value)} placeholder="+ Adicionar funcionalidade" style={{flex:1,fontSize:12,padding:"7px 10px"}} onKeyDown={e=>{if(e.key==="Enter"&&feat.trim()){onChange({...plano,features:[...plano.features,feat.trim()]});setFeat("")}}}/>
        <button onClick={()=>{if(feat.trim()){onChange({...plano,features:[...plano.features,feat.trim()]});setFeat("")}}} style={{padding:"7px 12px",fontSize:12,background:"var(--accent)",color:"var(--accent-fg)",border:"none",borderRadius:7,cursor:"pointer"}}>OK</button>
      </div>
    </div>
  )
}

export default function Settings() {
  const [tab,setTab]=useState("barbearia")
  const [saved,setSaved]=useState("")
  const save=(s:string)=>{setSaved(s);setTimeout(()=>setSaved(""),2500)}

  // Barbearia
  const [shopName,    setShopName]    = useState("Henrique Du Corte")
  const [shopSlug,    setShopSlug]    = useState("henrique-du-corte")
  const [shopPhone,   setShopPhone]   = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [logoUrl,     setLogoUrl]     = useState("")
  const [logoPreview, setLogoPreview] = useState(false)

  // Agenda
  const [workDays,  setWorkDays]  = useState([1,2,3,4,5,6])
  const [openTime,  setOpenTime]  = useState("09:00")
  const [closeTime, setCloseTime] = useState("19:00")
  const [slotDur,   setSlotDur]   = useState(30)
  const [hasLunch,  setHasLunch]  = useState(false)
  const [lunchStart,setLunchStart]= useState("12:00")
  const [lunchEnd,  setLunchEnd]  = useState("13:00")

  // Bump
  const [bumpOn,  setBumpOn]  = useState(true)
  const [bumpProd,setBumpProd]= useState("p1")
  const [bumpDisc,setBumpDisc]= useState(15)

  // Lembretes
  const [remOn,  setRemOn]  = useState(true)
  const [remDays,setRemDays]= useState(25)
  const [remMsg, setRemMsg] = useState("Olá, {nome}! 👋 Faz {dias} dias que você não vem nos visitar. Que tal agendar? {link}")

  // Planos
  const [planos,setPlanos]=useState<Plano[]>(PLANOS_INIT)

  const bProd=PRODUCTS_MOCK.find(p=>p.id===bumpProd)
  const discPrice=bProd?(bProd.price*(1-bumpDisc/100)).toFixed(2):"0"
  const previewMsg=remMsg.replace("{nome}","Carlos Silva").replace("{dias}",String(remDays)).replace("{link}",`barberasystem.com/${shopSlug}`)

  return (
    <div style={{padding:"24px",maxWidth:680,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
        <div style={{fontSize:20,fontWeight:600,color:"var(--text)"}}>Configurações</div>
      </div>
      <div style={{display:"flex",borderBottom:"1px solid var(--border)",marginBottom:20,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 14px",border:"none",background:"transparent",color:tab===t.id?"var(--text)":"var(--text-3)",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",borderBottom:tab===t.id?"2px solid var(--accent)":"2px solid transparent",fontWeight:tab===t.id?600:400,display:"flex",alignItems:"center",gap:5}}>
            <t.Icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {/* ── Barbearia ── */}
      {tab==="barbearia"&&(
        <SCard>
          {/* Logo */}
          <div>
            <div style={{fontSize:12,color:"var(--text-3)",marginBottom:10}}>Logo da barbearia</div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:72,height:72,borderRadius:12,border:"1px solid var(--border)",overflow:"hidden",background:"var(--bg-hover)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {logoUrl?(
                  <img src={logoUrl} alt="Logo" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={()=>setLogoPreview(false)}/>
                ):(
                  <Scissors size={28} color="var(--text-4)"/>
                )}
              </div>
              <div style={{flex:1}}>
                <input
                  value={logoUrl} onChange={e=>setLogoUrl(e.target.value)}
                  placeholder="Cole a URL da logo (ex: https://i.imgur.com/...)"
                  style={{width:"100%",boxSizing:"border-box",fontSize:13}}
                />
                <div style={{fontSize:11,color:"var(--text-4)",marginTop:4}}>
                  Suba no <a href="https://imgur.com" target="_blank" style={{color:"var(--text-3)"}}>imgur.com</a> e cole o link direto da imagem
                </div>
              </div>
            </div>
          </div>

          <Field label="Nome da barbearia"><input value={shopName} onChange={e=>setShopName(e.target.value)}/></Field>
          <Field label="Slug (URL pública)" hint={`barberasystem.com/${shopSlug}`}><input value={shopSlug} onChange={e=>setShopSlug(e.target.value)}/></Field>
          <Field label="WhatsApp"><input value={shopPhone} onChange={e=>setShopPhone(e.target.value)} placeholder="(11) 99999-9999"/></Field>
          <Field label="Endereço"><input value={shopAddress} onChange={e=>setShopAddress(e.target.value)} placeholder="Rua, nº — Bairro, Cidade"/></Field>
          <SaveBtn section="barbearia" saved={saved} onSave={save}/>
        </SCard>
      )}

      {/* ── Agenda ── */}
      {tab==="agenda"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <SCard>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Dias de funcionamento</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {WEEK.map((d,i)=>(
                <div key={i} onClick={()=>setWorkDays(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i].sort())} style={{width:46,height:46,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,cursor:"pointer",border:workDays.includes(i)?"none":"1px solid var(--border)",background:workDays.includes(i)?"var(--accent)":"var(--bg-card)",color:workDays.includes(i)?"var(--accent-fg)":"var(--text-3)"}}>{d}</div>
              ))}
            </div>
          </SCard>
          <SCard>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Horários e slots</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Abertura"><input type="time" value={openTime} onChange={e=>setOpenTime(e.target.value)}/></Field>
              <Field label="Fechamento"><input type="time" value={closeTime} onChange={e=>setCloseTime(e.target.value)}/></Field>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:13,color:"var(--text)"}}>Pausa para almoço</div><div style={{fontSize:11,color:"var(--text-4)"}}>Bloqueia slots no intervalo</div></div>
              <Toggle on={hasLunch} onChange={setHasLunch}/>
            </div>
            {hasLunch&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Início"><input type="time" value={lunchStart} onChange={e=>setLunchStart(e.target.value)}/></Field>
              <Field label="Fim"><input type="time" value={lunchEnd} onChange={e=>setLunchEnd(e.target.value)}/></Field>
            </div>}
            <Field label="Duração dos slots">
              <div style={{display:"flex",gap:6}}>
                {[15,30,45,60].map(d=>(
                  <div key={d} onClick={()=>setSlotDur(d)} style={{flex:1,textAlign:"center",padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,background:slotDur===d?"var(--accent)":"var(--bg-card)",color:slotDur===d?"var(--accent-fg)":"var(--text-2)",border:slotDur===d?"none":"1px solid var(--border)"}}>{d}min</div>
                ))}
              </div>
            </Field>
            <SaveBtn section="agenda" saved={saved} onSave={save}/>
          </SCard>
        </div>
      )}

      {/* ── Order Bump ── */}
      {tab==="bump"&&(
        <SCard>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>Order Bump ativo</div><div style={{fontSize:12,color:"var(--text-3)",marginTop:2}}>Oferece produto com desconto no checkout</div></div>
            <Toggle on={bumpOn} onChange={setBumpOn}/>
          </div>
          {bumpOn&&<>
            <div>
              <div style={{fontSize:12,color:"var(--text-3)",marginBottom:8}}>Produto em oferta</div>
              {PRODUCTS_MOCK.map(p=>(
                <div key={p.id} onClick={()=>setBumpProd(p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:9,cursor:"pointer",marginBottom:6,border:bumpProd===p.id?"2px solid var(--accent)":"1px solid var(--border)",background:bumpProd===p.id?"var(--bg-hover)":"var(--bg-card)"}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:bumpProd===p.id?"none":"1px solid var(--border-2)",background:bumpProd===p.id?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{bumpProd===p.id&&<Check size={11} color="white"/>}</div>
                  <span style={{flex:1,fontSize:13,color:"var(--text)"}}>{p.name}</span>
                  <span style={{fontSize:13,color:"var(--text-3)"}}>R$ {p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Field label={`Desconto — ${bumpDisc}%`}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <input type="range" min="5" max="40" value={bumpDisc} onChange={e=>setBumpDisc(Number(e.target.value))} style={{flex:1}}/>
                <div style={{fontSize:22,fontWeight:700,minWidth:52,textAlign:"right",color:"var(--text)"}}>{bumpDisc}%</div>
              </div>
            </Field>
            {bProd&&<div style={{background:"var(--bg-hover)",borderRadius:10,padding:"12px 14px",border:"1px solid var(--border)"}}>
              <div style={{fontSize:13,fontWeight:600,color:"var(--text)",marginBottom:4}}>{bProd.name}</div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,textDecoration:"line-through",color:"var(--text-4)"}}>R$ {bProd.price.toFixed(2)}</span>
                <span style={{fontSize:18,fontWeight:700,color:"#10b981"}}>R$ {discPrice}</span>
                <span style={{fontSize:11,background:"#d1fae5",color:"#065f46",padding:"2px 7px",borderRadius:5,fontWeight:600}}>−{bumpDisc}%</span>
              </div>
            </div>}
          </>}
          <SaveBtn section="bump" saved={saved} onSave={save}/>
        </SCard>
      )}

      {/* ── Lembretes ── */}
      {tab==="lembretes"&&(
        <SCard>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:"var(--text)"}}>Lembretes automáticos</div><div style={{fontSize:12,color:"var(--text-3)",marginTop:2}}>Envia WhatsApp após N dias sem visita</div></div>
            <Toggle on={remOn} onChange={setRemOn}/>
          </div>
          {remOn&&<>
            <Field label={`Disparar após — ${remDays} dias sem visita`} hint={`Clientes sem visita há mais de ${remDays} dias receberão a mensagem`}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <input type="range" min="7" max="60" value={remDays} onChange={e=>setRemDays(Number(e.target.value))} style={{flex:1}}/>
                <div style={{fontSize:22,fontWeight:700,minWidth:52,textAlign:"right",color:"var(--text)"}}>{remDays}d</div>
              </div>
            </Field>
            <Field label="Template da mensagem">
              <textarea value={remMsg} onChange={e=>setRemMsg(e.target.value)} rows={3} style={{resize:"none",padding:"10px 12px",borderRadius:9,border:"1px solid var(--border-2)",fontSize:13,lineHeight:1.6,background:"var(--bg-card)",color:"var(--text)",width:"100%",boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
                {["{nome}","{dias}","{link}"].map(v=>(
                  <span key={v} onClick={()=>setRemMsg(m=>m+" "+v)} style={{fontSize:11,background:"var(--bg-hover)",padding:"2px 7px",borderRadius:5,border:"1px solid var(--border)",cursor:"pointer",color:"var(--text-3)"}}>{v}</span>
                ))}
              </div>
            </Field>
            <div style={{background:"var(--bg-hover)",borderRadius:10,padding:"12px 14px",border:"1px solid var(--border)"}}>
              <div style={{fontSize:11,color:"var(--text-4)",marginBottom:8,textTransform:"uppercase",letterSpacing:".04em"}}>Prévia</div>
              <div style={{display:"flex",gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"#25d36622",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:18}}>💬</div>
                <div style={{background:"white",borderRadius:"0 10px 10px 10px",padding:"10px 12px",fontSize:13,color:"#111",lineHeight:1.6,boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>{previewMsg}</div>
              </div>
            </div>
          </>}
          <SaveBtn section="lembretes" saved={saved} onSave={save}/>
        </SCard>
      )}

      {/* ── Planos ── */}
      {tab==="planos"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"#fef9c3",border:"1px solid #fcd34d",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#713f12"}}>
            💡 Configure os planos que seus clientes verão na página de cadastro. Conecte os preços ao Stripe para cobrança automática.
          </div>
          {planos.map((p,i)=>(
            <PlanoEditor key={p.id} plano={p} onChange={np=>setPlanos(prev=>prev.map((x,j)=>j===i?np:x))} onRemove={()=>setPlanos(prev=>prev.filter((_,j)=>j!==i))}/>
          ))}
          <button onClick={()=>setPlanos(p=>[...p,{id:"p"+Date.now(),name:"Novo Plano",price:"0",features:[]}])} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",borderRadius:10,border:"2px dashed var(--border-2)",background:"transparent",color:"var(--text-3)",fontSize:13,cursor:"pointer",fontWeight:500}}>
            <Plus size={14}/>Adicionar plano
          </button>
          <SCard>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>Integração Stripe</div>
            {["STRIPE_PRICE_STARTER","STRIPE_PRICE_PRO","STRIPE_PRICE_ELITE"].map(v=>(
              <Field key={v} label={v}><input placeholder="price_..." style={{fontFamily:"monospace",fontSize:12}}/></Field>
            ))}
            <SaveBtn section="planos" saved={saved} onSave={save}/>
          </SCard>
        </div>
      )}
    </div>
  )
}
