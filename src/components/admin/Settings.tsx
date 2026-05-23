"use client"
import { useState, useEffect } from "react"
import { Check, Bell, Calendar, Package, Scissors, CreditCard, Plus, Trash2, Copy, Link } from "lucide-react"

const WEEK=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]
const DOMAIN="barberasystem.com"

const Toggle=({on,onChange}:{on:boolean;onChange:(v:boolean)=>void})=>(
  <div onClick={()=>onChange(!on)} style={{width:42,height:24,borderRadius:12,cursor:"pointer",flexShrink:0,position:"relative",background:on?"var(--accent,#111)":"var(--border)",transition:"background .2s"}}>
    <div style={{position:"absolute",top:3,left:on?21:3,width:16,height:16,borderRadius:"50%",background:"white",transition:"left .15s",boxShadow:"0 1px 3px rgba(0,0,0,.2)"}}/>
  </div>
)
const Field=({label,hint,children}:{label:string;hint?:string;children:React.ReactNode})=>(
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <label style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{label}</label>
    {children}
    {hint&&<div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>{hint}</div>}
  </div>
)
const SCard=({children}:{children:React.ReactNode})=>(
  <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.07)",display:"flex",flexDirection:"column",gap:16}}>{children}</div>
)
const inp={width:"100%",boxSizing:"border-box" as const,background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"}

const TABS=[
  {id:"barbearia",label:"Barbearia",Icon:Scissors},
  {id:"agenda",   label:"Agenda",   Icon:Calendar},
  {id:"bump",     label:"Order Bump",Icon:Package},
  {id:"lembretes",label:"Lembretes",Icon:Bell},
  {id:"planos",   label:"Planos",   Icon:CreditCard},
]

export default function Settings(){
  const [tab,setTab]=useState("barbearia")
  const [saved,setSaved]=useState("")
  const [copied,setCopied]=useState(false)

  // Barbearia
  const [shopName,setShopName]=useState("")
  const [shopSlug,setShopSlug]=useState("")
  const [shopPhone,setShopPhone]=useState("")
  const [shopAddress,setShopAddress]=useState("")
  const [logoUrl,setLogoUrl]=useState("")
  const [accentColor,setAccentColor]=useState("#111827")

  // Agenda
  const [workDays,setWorkDays]=useState([1,2,3,4,5,6])
  const [openTime,setOpenTime]=useState("09:00")
  const [closeTime,setCloseTime]=useState("19:00")
  const [slotDur,setSlotDur]=useState(30)
  const [hasLunch,setHasLunch]=useState(false)
  const [lunchStart,setLunchStart]=useState("12:00")
  const [lunchEnd,setLunchEnd]=useState("13:00")

  // Bump
  const [bumpOn,setBumpOn]=useState(true)
  const [bumpDisc,setBumpDisc]=useState(15)

  // Lembretes
  const [remOn,setRemOn]=useState(true)
  const [remDays,setRemDays]=useState(25)
  const [remMsg,setRemMsg]=useState("Olá, {nome}! 👋 Faz {dias} dias que você não vem. Que tal agendar? {link}")

  // Planos
  const [planos,setPlanos]=useState([
    {id:"p1",name:"Starter",price:"97", features:["1 barbeiro","Link de agendamento"]},
    {id:"p2",name:"Pro",    price:"197",features:["Até 3 barbeiros","Lembretes WhatsApp","DRE completo"]},
    {id:"p3",name:"Elite",  price:"297",features:["Ilimitado","Tudo do Pro","Relatórios avançados"]},
  ])

  // Carrega dados reais do banco ao montar
  useEffect(()=>{
    fetch("/api/settings").then(r=>r.ok?r.json():null).then(d=>{
      if(!d?.data?.barbershop) return
      const b=d.data.barbershop
      setShopName(b.name||"")
      setShopSlug(b.slug||"")
      setShopPhone(b.whatsapp||"")
      setShopAddress(b.address||"")
      setLogoUrl(b.logoUrl||"")
      if(b.accentColor){
        setAccentColor(b.accentColor)
        document.documentElement.style.setProperty("--accent",b.accentColor)
      }
    }).catch(()=>{})
  },[])

  // Aplica cor imediatamente ao mudar o picker
  const handleColor=(c:string)=>{
    setAccentColor(c)
    document.documentElement.style.setProperty("--accent",c)
    // Calcula fg automático (branco ou preto)
    const r=parseInt(c.slice(1,3),16),g=parseInt(c.slice(3,5),16),b2=parseInt(c.slice(5,7),16)
    const lum=(0.299*r+0.587*g+0.114*b2)/255
    document.documentElement.style.setProperty("--accent-fg",lum>0.5?"#111827":"#ffffff")
  }

  const save=async(section:string)=>{
    if(section==="barbearia"){
      await fetch("/api/settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:shopName,slug:shopSlug,whatsapp:shopPhone,address:shopAddress,logoUrl,accentColor})})
    }
    setSaved(section); setTimeout(()=>setSaved(""),2500)
  }

  const copyLink=()=>{
    navigator.clipboard.writeText(`https://${DOMAIN}/${shopSlug}`)
    setCopied(true); setTimeout(()=>setCopied(false),2000)
  }

  const SaveBtn=({s}:{s:string})=>(
    <button onClick={()=>save(s)} style={{padding:"10px 20px",borderRadius:9,border:"none",cursor:"pointer",background:saved===s?"#10b981":"var(--color-text-primary)",color:"var(--color-background-primary)",fontSize:13,fontWeight:600,display:"inline-flex",alignItems:"center",gap:6,transition:"background .25s"}}>
      {saved===s?<><Check size={14}/>Salvo!</>:"Salvar alterações"}
    </button>
  )

  return(
    <div style={{padding:"24px",maxWidth:680,margin:"0 auto"}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
        <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Configurações</div>
      </div>

      <div style={{display:"flex",borderBottom:"1px solid var(--color-border-tertiary)",marginBottom:20,overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 14px",border:"none",background:"transparent",color:tab===t.id?"var(--color-text-primary)":"var(--color-text-tertiary)",fontSize:13,cursor:"pointer",whiteSpace:"nowrap",borderBottom:tab===t.id?"2px solid var(--color-text-primary)":"2px solid transparent",fontWeight:tab===t.id?600:400,display:"flex",alignItems:"center",gap:5}}>
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
                {logoUrl?<img src={logoUrl} alt="Logo" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Scissors size={28} color="var(--color-text-tertiary)"/>}
              </div>
              <div style={{flex:1}}>
                <input value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://i.imgur.com/xxxx.png" style={{...inp,marginBottom:4}}/>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Suba no <a href="https://imgur.com" target="_blank" style={{color:"var(--color-text-secondary)"}}>imgur.com</a> → clique direito na imagem → "Copiar endereço da imagem"</div>
              </div>
            </div>
          </div>

          {/* Cor principal */}
          <Field label="Cor principal do sistema">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <input type="color" value={accentColor} onChange={e=>handleColor(e.target.value)} style={{width:48,height:40,padding:2,borderRadius:8,border:"1px solid var(--color-border-secondary)",cursor:"pointer",background:"transparent"}}/>
              <div style={{flex:1}}>
                <input value={accentColor} onChange={e=>{if(/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)){setAccentColor(e.target.value);if(e.target.value.length===7)handleColor(e.target.value)}}} style={inp} placeholder="#111827"/>
              </div>
              <div style={{width:40,height:40,borderRadius:8,background:accentColor,border:"1px solid var(--color-border-tertiary)"}}/>
            </div>
          </Field>

          <Field label="Nome da barbearia"><input value={shopName} onChange={e=>setShopName(e.target.value)} style={inp}/></Field>
          <Field label="Slug (URL pública)">
            <input value={shopSlug} onChange={e=>setShopSlug(e.target.value.toLowerCase().replace(/\s/g,"-"))} style={inp}/>
          </Field>

          {/* Link de agendamento */}
          <div>
            <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginBottom:8,display:"flex",alignItems:"center",gap:5}}><Link size={12}/>Link de agendamento</div>
            <div style={{display:"flex",gap:8}}>
              <div style={{flex:1,background:"var(--color-background-secondary)",border:"1px solid var(--color-border-tertiary)",borderRadius:8,padding:"9px 12px",fontSize:13,color:"var(--color-text-secondary)",fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                https://{DOMAIN}/{shopSlug||"sua-barbearia"}
              </div>
              <button onClick={copyLink} style={{padding:"9px 14px",borderRadius:8,border:"1px solid var(--color-border-secondary)",background:copied?"#d1fae5":"var(--color-background-secondary)",color:copied?"#065f46":"var(--color-text-secondary)",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:5,flexShrink:0,fontWeight:500}}>
                {copied?<><Check size={12}/>Copiado!</>:<><Copy size={12}/>Copiar</>}
              </button>
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
                <div key={i} onClick={()=>setWorkDays(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i].sort())} style={{width:46,height:46,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,cursor:"pointer",background:workDays.includes(i)?"var(--color-text-primary)":"var(--color-background-primary)",color:workDays.includes(i)?"var(--color-background-primary)":"var(--color-text-tertiary)",border:workDays.includes(i)?"none":"1px solid var(--color-border-tertiary)"}}>
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
                  <div key={d} onClick={()=>setSlotDur(d)} style={{flex:1,textAlign:"center",padding:"9px 0",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,background:slotDur===d?"var(--color-text-primary)":"var(--color-background-primary)",color:slotDur===d?"var(--color-background-primary)":"var(--color-text-secondary)",border:slotDur===d?"none":"1px solid var(--color-border-tertiary)"}}>
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
              <input type="range" min="5" max="40" value={bumpDisc} onChange={e=>setBumpDisc(Number(e.target.value))} style={{flex:1,accentColor:"var(--color-text-primary)"}}/>
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
            <Field label={`Disparar após — ${remDays} dias sem visita`} hint={`Clientes sem visita há mais de ${remDays} dias receberão a mensagem`}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <input type="range" min="7" max="60" value={remDays} onChange={e=>setRemDays(Number(e.target.value))} style={{flex:1,accentColor:"var(--color-text-primary)"}}/>
                <div style={{fontSize:22,fontWeight:700,minWidth:52,textAlign:"right",color:"var(--color-text-primary)"}}>{remDays}d</div>
              </div>
            </Field>
            <Field label="Template da mensagem">
              <textarea value={remMsg} onChange={e=>setRemMsg(e.target.value)} rows={3} style={{...inp,resize:"none"}}/>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:2}}>
                {["{nome}","{dias}","{link}"].map(v=>(
                  <span key={v} onClick={()=>setRemMsg(m=>m+" "+v)} style={{fontSize:11,background:"var(--color-background-secondary)",padding:"2px 7px",borderRadius:5,border:"1px solid var(--color-border-tertiary)",cursor:"pointer",color:"var(--color-text-tertiary)"}}>{v}</span>
                ))}
              </div>
            </Field>
            <div style={{background:"var(--color-background-secondary)",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:8,textTransform:"uppercase",letterSpacing:".04em"}}>Prévia</div>
              <div style={{fontSize:13,color:"var(--color-text-primary)",lineHeight:1.6}}>
                {remMsg.replace("{nome}","Carlos").replace("{dias}",String(remDays)).replace("{link}",`${DOMAIN}/${shopSlug}`)}
              </div>
            </div>
          </>}
          <SaveBtn s="lembretes"/>
        </SCard>
      )}

      {tab==="planos"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"var(--color-background-info,#eff6ff)",border:"1px solid var(--color-border-info,#bfdbfe)",borderRadius:10,padding:"12px 14px",fontSize:13,color:"var(--color-text-info,#1d4ed8)"}}>
            💡 Configure os planos que seus clientes verão na página de cadastro.
          </div>
          {planos.map((p,i)=>(
            <SCard key={p.id}>
              <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:10,alignItems:"end"}}>
                <Field label="Nome"><input value={p.name} onChange={e=>setPlanos(pp=>pp.map((x,j)=>j===i?{...x,name:e.target.value}:x))} style={inp}/></Field>
                <Field label="R$/mês"><input type="number" value={p.price} onChange={e=>setPlanos(pp=>pp.map((x,j)=>j===i?{...x,price:e.target.value}:x))} style={{...inp,width:100}}/></Field>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:4}}>
                {p.features.map((f,fi)=>(
                  <div key={fi} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--color-text-secondary)"}}>
                    <Check size={12} color="#10b981"/>
                    <span style={{flex:1}}>{f}</span>
                    <button onClick={()=>setPlanos(pp=>pp.map((x,j)=>j===i?{...x,features:x.features.filter((_,fj)=>fj!==fi)}:x))} style={{background:"transparent",border:"none",color:"var(--color-text-tertiary)",cursor:"pointer"}}>×</button>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:6}}>
                <input placeholder="+ Adicionar funcionalidade" style={{...inp,flex:1,fontSize:12}} onKeyDown={e=>{if(e.key==="Enter"&&(e.target as HTMLInputElement).value.trim()){const v=(e.target as HTMLInputElement).value.trim();setPlanos(pp=>pp.map((x,j)=>j===i?{...x,features:[...x.features,v]}:x));(e.target as HTMLInputElement).value=""}}}/>
                <button onClick={()=>setPlanos(pp=>pp.filter((_,j)=>j!==i))} style={{padding:"9px 12px",borderRadius:8,border:"1px solid var(--color-border-danger,#fca5a5)",background:"var(--color-background-danger,#fef2f2)",color:"var(--color-text-danger,#dc2626)",cursor:"pointer",display:"flex"}}><Trash2 size={14}/></button>
              </div>
            </SCard>
          ))}
          <button onClick={()=>setPlanos(p=>[...p,{id:"p"+Date.now(),name:"Novo Plano",price:"0",features:[]}])} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"12px",borderRadius:10,border:"2px dashed var(--color-border-secondary)",background:"transparent",color:"var(--color-text-tertiary)",fontSize:13,cursor:"pointer",fontWeight:500}}>
            <Plus size={14}/>Adicionar plano
          </button>
          <SaveBtn s="planos"/>
        </div>
      )}
    </div>
  )
}
