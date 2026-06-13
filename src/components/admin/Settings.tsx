"use client"
import { useState, useEffect } from "react"
import { Check, Bell, Calendar, Package, Scissors, Copy, Link, ExternalLink, RotateCcw } from "lucide-react"

const DOMAIN = "barberasystem.com"
const DEFAULT_COLOR = "#111827"
const WEEK = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const inp: React.CSSProperties = {width:"100%",boxSizing:"border-box",background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"}

const Toggle = ({on,onChange}:{on:boolean;onChange:(v:boolean)=>void}) => (
  <div onClick={()=>onChange(!on)} style={{width:42,height:24,borderRadius:12,cursor:"pointer",flexShrink:0,position:"relative",background:on?"var(--accent,#111)":"var(--color-border-secondary)",transition:"background .2s"}}>
    <div style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left .15s"}}/>
  </div>
)
const Field = ({label,hint,children}:{label:string;hint?:string;children:React.ReactNode}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <label style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{label}</label>
    {children}
    {hint&&<div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{hint}</div>}
  </div>
)
const SCard = ({children}:{children:React.ReactNode}) => (
  <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.07)",display:"flex",flexDirection:"column",gap:16}}>{children}</div>
)
const TABS = [
  {id:"barbearia",label:"Barbearia",Icon:Scissors},
  {id:"agenda",   label:"Agenda",   Icon:Calendar},
  {id:"bump",     label:"Order Bump",Icon:Package},
  {id:"lembretes",label:"Lembretes",Icon:Bell},
]

function applyAccent(color: string) {
  document.documentElement.style.setProperty("--accent", color)
  document.documentElement.style.setProperty("--sidebar-bg", color)
  const r=parseInt(color.slice(1,3),16),g=parseInt(color.slice(3,5),16),b=parseInt(color.slice(5,7),16)
  const lum=(0.299*r+0.587*g+0.114*b)/255
  const fg = lum>0.5?"#111827":"#ffffff"
  document.documentElement.style.setProperty("--accent-fg", fg)
  document.documentElement.style.setProperty("--sidebar-fg", fg)
  document.documentElement.style.setProperty("--sidebar-muted", lum>0.5?"rgba(17,24,39,.5)":"rgba(255,255,255,.55)")
  document.documentElement.style.setProperty("--color-border-primary", color)
  localStorage.setItem("accentColor", color)
}

export default function Settings() {
  const [tab,     setTab]     = useState("barbearia")
  const [saved,   setSaved]   = useState("")
  const [saving,  setSaving]  = useState(false)
  const [copied,  setCopied]  = useState(false)

  const [shopName,    setShopName]    = useState("")
  const [shopSlug,    setShopSlug]    = useState("")
  const [shopPhone,   setShopPhone]   = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [logoUrl,     setLogoUrl]     = useState("")
  const [accentColor, setAccentColor] = useState(DEFAULT_COLOR)  // estado local sem aplicar
  const [workDays,  setWorkDays]  = useState([1,2,3,4,5,6])
  const [openTime,  setOpenTime]  = useState("09:00")
  const [closeTime, setCloseTime] = useState("19:00")
  const [slotDur,   setSlotDur]   = useState(30)
  const [hasLunch,  setHasLunch]  = useState(false)
  const [lunchStart,setLunchStart]= useState("12:00")
  const [lunchEnd,  setLunchEnd]  = useState("13:00")
  const [bumpOn,    setBumpOn]    = useState(true)
  const [bumpDisc,  setBumpDisc]  = useState(15)
  const [remOn,     setRemOn]     = useState(true)
  const [remDays,   setRemDays]   = useState(25)
  const [remMsg,    setRemMsg]    = useState("Olá, {nome}! 👋 Faz {dias} dias que você não vem. Que tal agendar? {link}")

  useEffect(()=>{
    fetch("/api/settings").then(r=>r.ok?r.json():null).then(d=>{
      if(!d?.data?.barbershop) return
      const b=d.data.barbershop
      if(b.name)     setShopName(b.name)
      if(b.slug)     setShopSlug(b.slug)
      if(b.whatsapp) setShopPhone(b.whatsapp)
      if(b.address)  setShopAddress(b.address)
      if(b.logoUrl)  setLogoUrl(b.logoUrl)
    }).catch(()=>{})
    // Carrega cor atual mas NÃO aplica aqui (a Sidebar já aplica no mount)
    const ac = localStorage.getItem("accentColor")
    if(ac) setAccentColor(ac)
  },[])

  const resetColor = () => {
    setAccentColor(DEFAULT_COLOR)
    applyAccent(DEFAULT_COLOR)
  }

  const save = async (section: string) => {
    setSaving(true)
    if(section==="barbearia"){
      await fetch("/api/settings",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({name:shopName, slug:shopSlug, whatsapp:shopPhone, address:shopAddress, logoUrl}),
      }).catch(()=>{})
      // Aplica e salva a cor escolhida SÓ ao clicar em salvar
      applyAccent(accentColor)
      // Salva nome e slug no localStorage para outros componentes
      localStorage.setItem("shopName", shopName)
      localStorage.setItem("shopSlug", shopSlug)
      window.dispatchEvent(new Event("settingsUpdated"))
    }
    setSaving(false); setSaved(section)
    setTimeout(()=>setSaved(""),2500)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${DOMAIN}/${shopSlug}`)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  const SaveBtn = ({s}:{s:string}) => (
    <button onClick={()=>save(s)} disabled={saving} style={{padding:"10px 20px",borderRadius:9,border:"none",cursor:"pointer",background:saved===s?"#10b981":"var(--accent,#111)",color:saved===s?"white":"var(--accent-fg,#fff)",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,transition:"background .25s"}}>
      {saved===s?<><Check size={14}/>Salvo!</>:saving?"Salvando…":"Salvar alterações"}
    </button>
  )

  return (
    <div style={{padding:"24px",maxWidth:680,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
        <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Configurações</div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid var(--color-border-tertiary)",marginBottom:20,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 14px",border:"none",background:"transparent",color:tab===t.id?"var(--color-text-primary)":"var(--color-text-tertiary)",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",borderBottom:tab===t.id?"2px solid var(--accent,#111)":"2px solid transparent",fontWeight:tab===t.id?600:400,display:"flex",alignItems:"center",gap:5}}>
            <t.Icon size={13}/>{t.label}
          </button>
        ))}
      </div>

      {tab==="barbearia"&&(
        <SCard>
          {/* Logo */}
          <div>
            <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginBottom:10}}>Logo da barbearia</div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:72,height:72,borderRadius:12,border:"1px solid var(--color-border-tertiary)",overflow:"hidden",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {logoUrl?<img src={logoUrl} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<Scissors size={28} color="var(--color-text-tertiary)"/>}
              </div>
              <div style={{flex:1}}>
                <input value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://i.imgur.com/xxxx.png" style={{...inp,marginBottom:4}}/>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>
                  <a href="https://imgur.com" target="_blank" style={{color:"var(--color-text-secondary)"}}>imgur.com</a> → clique na imagem → botão direito → "Copiar endereço da imagem" (deve terminar em .png ou .jpg)
                </div>
              </div>
            </div>
          </div>

          {/* Cor — só aplica ao salvar */}
          <div>
            <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginBottom:8}}>Cor principal do sistema</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input type="color" value={accentColor} onChange={e=>setAccentColor(e.target.value)}
                style={{width:48,height:40,padding:2,borderRadius:8,border:"1px solid var(--color-border-secondary)",cursor:"pointer",background:"transparent"}}/>
              <input value={accentColor} onChange={e=>{if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))setAccentColor(e.target.value)}} style={{...inp,flex:1,fontFamily:"monospace"}}/>
              <div style={{width:40,height:40,borderRadius:8,background:accentColor,border:"1px solid var(--color-border-tertiary)",flexShrink:0}}/>
              <button onClick={resetColor} title="Voltar cor padrão" style={{width:40,height:40,borderRadius:8,border:"1px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-tertiary)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <RotateCcw size={15}/>
              </button>
            </div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginTop:4}}>A cor é aplicada ao clicar em "Salvar alterações"</div>
          </div>

          <Field label="Nome da barbearia"><input value={shopName} onChange={e=>setShopName(e.target.value)} style={inp}/></Field>
          <Field label="Slug (URL pública)"><input value={shopSlug} onChange={e=>setShopSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} style={inp}/></Field>

          {/* Link de agendamento */}
          <div>
            <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Link size={12}/>Link de agendamento</div>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,background:"var(--color-background-secondary)",border:"1px solid var(--color-border-tertiary)",borderRadius:8,padding:"9px 12px",fontSize:13,color:"var(--color-text-secondary)",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                https://{DOMAIN}/{shopSlug||"sua-barbearia"}
              </div>
              <button onClick={copyLink} style={{padding:"9px 12px",borderRadius:8,border:"1px solid var(--color-border-secondary)",background:copied?"#d1fae5":"var(--color-background-secondary)",color:copied?"#065f46":"var(--color-text-secondary)",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                {copied?<><Check size={12}/>Copiado</>:<><Copy size={12}/>Copiar</>}
              </button>
              <a href={`/${shopSlug}`} target="_blank" style={{padding:"9px 12px",borderRadius:8,border:"1px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",fontSize:12,display:"flex",alignItems:"center",gap:5,flexShrink:0,textDecoration:"none"}}>
                <ExternalLink size={12}/>Ver
              </a>
            </div>
          </div>

          <Field label="WhatsApp"><input value={shopPhone} onChange={e=>setShopPhone(e.target.value)} placeholder="(11) 99999-9999" style={inp}/></Field>
          <Field label="Endereço"><input value={shopAddress} onChange={e=>setShopAddress(e.target.value)} placeholder="Rua, nº — Bairro, Cidade" style={inp}/></Field>
          <SaveBtn s="barbearia"/>
        </SCard>
      )}

      {tab==="agenda"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <SCard>
            <div style={{fontSize:13,fontWeight:600,color:"var(--color-text-primary)"}}>Dias de funcionamento</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {WEEK.map((d,i)=>(
                <div key={i} onClick={()=>setWorkDays(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i].sort())} style={{width:46,height:46,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,cursor:"pointer",background:workDays.includes(i)?"var(--accent,#111)":"var(--color-background-primary)",color:workDays.includes(i)?"var(--accent-fg,#fff)":"var(--color-text-tertiary)",border:workDays.includes(i)?"none":"1px solid var(--color-border-tertiary)"}}>
                  {d}
                </div>
              ))}
            </div>
          </SCard>
          <SCard>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Abertura"><input type="time" value={openTime} onChange={e=>setOpenTime(e.target.value)} style={inp}/></Field>
              <Field label="Fechamento"><input type="time" value={closeTime} onChange={e=>setCloseTime(e.target.value)} style={inp}/></Field>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div><div style={{fontSize:13,color:"var(--color-text-primary)"}}>Pausa para almoço</div><div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Bloqueia slots no intervalo</div></div>
              <Toggle on={hasLunch} onChange={setHasLunch}/>
            </div>
            {hasLunch&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Início"><input type="time" value={lunchStart} onChange={e=>setLunchStart(e.target.value)} style={inp}/></Field>
              <Field label="Fim"><input type="time" value={lunchEnd} onChange={e=>setLunchEnd(e.target.value)} style={inp}/></Field>
            </div>}
            <Field label="Duração dos slots">
              <div style={{display:"flex",gap:6}}>
                {[15,30,45,60].map(d=>(
                  <div key={d} onClick={()=>setSlotDur(d)} style={{flex:1,textAlign:"center",padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,background:slotDur===d?"var(--accent,#111)":"var(--color-background-primary)",color:slotDur===d?"var(--accent-fg,#fff)":"var(--color-text-secondary)",border:slotDur===d?"none":"1px solid var(--color-border-tertiary)"}}>
                    {d}min
                  </div>
                ))}
              </div>
            </Field>
            <SaveBtn s="agenda"/>
          </SCard>
        </div>
      )}

      {tab==="bump"&&(
        <SCard>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>Order Bump ativo</div><div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>Oferece produto com desconto no checkout</div></div>
            <Toggle on={bumpOn} onChange={setBumpOn}/>
          </div>
          {bumpOn&&<Field label={`Desconto — ${bumpDisc}%`}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <input type="range" min="5" max="40" value={bumpDisc} onChange={e=>setBumpDisc(Number(e.target.value))} style={{flex:1}}/>
              <div style={{fontSize:22,fontWeight:700,minWidth:52,textAlign:"right",color:"var(--color-text-primary)"}}>{bumpDisc}%</div>
            </div>
          </Field>}
          <SaveBtn s="bump"/>
        </SCard>
      )}

      {tab==="lembretes"&&(
        <SCard>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>Lembretes automáticos</div><div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>Envia WhatsApp após N dias sem visita</div></div>
            <Toggle on={remOn} onChange={setRemOn}/>
          </div>
          {remOn&&<>
            <Field label={`Disparar após — ${remDays} dias`}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <input type="range" min="7" max="60" value={remDays} onChange={e=>setRemDays(Number(e.target.value))} style={{flex:1}}/>
                <div style={{fontSize:22,fontWeight:700,minWidth:52,textAlign:"right",color:"var(--color-text-primary)"}}>{remDays}d</div>
              </div>
            </Field>
            <Field label="Template">
              <textarea value={remMsg} onChange={e=>setRemMsg(e.target.value)} rows={3} style={{...inp,resize:"none"} as any}/>
              <div style={{display:"flex",gap:6,marginTop:2}}>
                {["{nome}","{dias}","{link}"].map(v=>(
                  <span key={v} onClick={()=>setRemMsg(m=>m+" "+v)} style={{fontSize:11,background:"var(--color-background-secondary)",padding:"2px 7px",borderRadius:5,border:"1px solid var(--color-border-tertiary)",cursor:"pointer",color:"var(--color-text-tertiary)"}}>{v}</span>
                ))}
              </div>
            </Field>
          </>}
          <SaveBtn s="lembretes"/>
        </SCard>
      )}

    </div>
  )
}
