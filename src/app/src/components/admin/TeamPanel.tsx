"use client"
import { useState } from "react"
import { Plus, Edit2, Check, X, Camera } from "lucide-react"

const PALETTE = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444"]
const BRL     = (v:number) => "R$ " + (+v).toLocaleString("pt-BR",{minimumFractionDigits:2})
const EMPTY   = { name:"", email:"", phone:"", commission:50, role:"BARBER", avatarUrl:"" }

const Field = ({label,children}:{label:string;children:React.ReactNode}) => (
  <div style={{display:"flex",flexDirection:"column",gap:4}}>
    <label style={{fontSize:12,color:"var(--text-3)"}}>{label}</label>
    {children}
  </div>
)

function AvatarPicker({value,onChange,name,color}:{value:string;onChange:(v:string)=>void;name:string;color:string}) {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState(value)
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,marginBottom:14}}>
      <div style={{position:"relative",cursor:"pointer"}} onClick={()=>setEditing(v=>!v)}>
        {value ? (
          <img src={value} alt={name} style={{width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"3px solid var(--border)"}}
            onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        ) : (
          <div style={{width:72,height:72,borderRadius:"50%",background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,fontWeight:600,color,border:"3px solid var(--border)"}}>
            {name[0]||"?"}
          </div>
        )}
        <div style={{position:"absolute",bottom:0,right:0,width:24,height:24,borderRadius:"50%",background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <Camera size={12} color="var(--accent-fg)"/>
        </div>
      </div>
      {editing&&(
        <div style={{display:"flex",gap:6,width:"100%"}}>
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="Cole a URL da foto (https://...)" style={{flex:1,fontSize:12,padding:"7px 10px"}}/>
          <button onClick={()=>{onChange(url);setEditing(false)}} style={{padding:"7px 12px",fontSize:12,background:"var(--accent)",color:"var(--accent-fg)",border:"none",borderRadius:7}}>OK</button>
        </div>
      )}
      <div style={{fontSize:11,color:"var(--text-4)"}}>Clique para {value?"trocar":"adicionar"} foto</div>
    </div>
  )
}

function BarberForm({form,set,onSave,onCancel,canSave,title}:any) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{fontSize:14,fontWeight:600,marginBottom:4,color:"var(--text)"}}>{title}</div>
      <AvatarPicker value={form.avatarUrl} onChange={v=>set("avatarUrl",v)} name={form.name||"?"} color="#3b82f6"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Nome"><input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Nome"/></Field>
        <Field label="Função">
          <select value={form.role} onChange={e=>set("role",e.target.value)}>
            <option value="BARBER">Barbeiro</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
      </div>
      <Field label="E-mail"><input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@barbearia.com"/></Field>
      <Field label="WhatsApp"><input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="(11) 99999-9999"/></Field>
      <Field label={`Comissão — ${form.commission}% do faturamento`}>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-4)",marginBottom:3}}>
            <span>Barbearia {100-form.commission}%</span><span>Barbeiro {form.commission}%</span>
          </div>
          <input type="range" min={20} max={80} value={form.commission} onChange={e=>set("commission",Number(e.target.value))}/>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"var(--text-4)",marginTop:1}}>
            <span>20%</span><span>50%</span><span>80%</span>
          </div>
        </div>
      </Field>
      <div style={{display:"flex",gap:8,paddingTop:2}}>
        <button onClick={onCancel} style={{padding:"9px 14px",fontSize:13,borderRadius:8,flexShrink:0}}>Cancelar</button>
        <button onClick={onSave} disabled={!canSave} style={{
          flex:1,padding:"10px",borderRadius:8,border:"none",
          cursor:canSave?"pointer":"not-allowed",
          background:canSave?"var(--accent)":"var(--bg-hover)",
          color:canSave?"var(--accent-fg)":"var(--text-4)",
          fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5,
        }}>
          <Check size={14}/>{title==="Novo barbeiro"?"Adicionar":"Salvar"}
        </button>
      </div>
    </div>
  )
}

const INIT = [
  {id:1,name:"Henrique",email:"henrique@barb.com",phone:"(11)98765-4321",role:"ADMIN", commission:70,active:true,appts:28,rev:4760,avatarUrl:""},
  {id:2,name:"Igor",    email:"igor@barb.com",    phone:"(11)97654-3210",role:"BARBER",commission:50,active:true,appts:19,rev:3230,avatarUrl:""},
]

export default function TeamPanel() {
  const [barbers,setBarbers] = useState<any[]>(INIT)
  const [editing,setEditing] = useState<any>(null)
  const [form,setForm]       = useState<any>({...EMPTY})

  const set     = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))
  const canSave = form.name.trim().length>1 && form.email.includes("@")
  const cancel  = () => { setEditing(null); setForm({...EMPTY}) }

  const startEdit = (b:any) => { setEditing(b.id); setForm({name:b.name,email:b.email,phone:b.phone,commission:b.commission,role:b.role,avatarUrl:b.avatarUrl||""}) }

  const save = () => {
    if(editing==="new") setBarbers((prev:any[])=>[...prev,{id:Date.now(),...form,active:true,appts:0,rev:0}])
    else setBarbers((prev:any[])=>prev.map((b:any)=>b.id===editing?{...b,...form}:b))
    cancel()
  }

  const toggle = (id:number) => setBarbers((prev:any[])=>prev.map((b:any)=>b.id===id?{...b,active:!b.active}:b))

  const totalRev = barbers.reduce((s:number,b:any)=>s+b.rev,0)
  const totalCom = barbers.reduce((s:number,b:any)=>s+(b.rev*b.commission/100),0)

  return (
    <div style={{padding:"24px",maxWidth:700,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{flex:1}}>
          <div style={{fontSize:11,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--text)"}}>Equipe</div>
        </div>
        {editing!=="new"&&(
          <button onClick={()=>{setEditing("new");setForm({...EMPTY})}} style={{
            display:"flex",alignItems:"center",gap:5,padding:"9px 16px",borderRadius:9,border:"none",
            background:"var(--accent)",color:"var(--accent-fg)",fontSize:13,fontWeight:600,cursor:"pointer",
          }}><Plus size={14}/>Novo barbeiro</button>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[{label:"Barbeiros ativos",val:barbers.filter((b:any)=>b.active).length},
          {label:"Faturado",val:BRL(totalRev)},
          {label:"Comissões",val:BRL(totalCom)}].map(s=>(
          <div key={s.label} style={{background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:10,padding:"12px 14px",boxShadow:"var(--shadow)"}}>
            <div style={{fontSize:20,fontWeight:600,color:"var(--text)"}}>{s.val}</div>
            <div style={{fontSize:10,color:"var(--text-4)",marginTop:2,textTransform:"uppercase",letterSpacing:".04em"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {editing==="new"&&(
          <div style={{background:"var(--bg-card)",border:"2px solid var(--accent)",borderRadius:14,padding:20,boxShadow:"var(--shadow)"}}>
            <BarberForm form={form} set={set} onSave={save} onCancel={cancel} canSave={canSave} title="Novo barbeiro"/>
          </div>
        )}

        {barbers.map((b:any,i:number)=>{
          const color  = PALETTE[i%PALETTE.length]
          const isEdit = editing===b.id
          const com    = b.rev*b.commission/100
          const shop   = b.rev-com
          return (
            <div key={b.id} style={{
              background:"var(--bg-card)",
              border:isEdit?"2px solid var(--accent)":"1px solid var(--border)",
              borderRadius:14,padding:16,opacity:b.active?1:.55,
              boxShadow:"var(--shadow)",transition:"opacity .2s",
            }}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:isEdit?16:0}}>
                {b.avatarUrl ? (
                  <img src={b.avatarUrl} alt={b.name} style={{width:50,height:50,borderRadius:"50%",objectFit:"cover",flexShrink:0,border:"2px solid var(--border)"}}/>
                ) : (
                  <div style={{width:50,height:50,borderRadius:"50%",background:color+"1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:600,color,flexShrink:0,border:"2px solid "+color+"30"}}>
                    {b.name[0]}
                  </div>
                )}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15,fontWeight:600,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",color:"var(--text)"}}>
                    {b.name}
                    {b.role==="ADMIN"&&<span style={{fontSize:10,background:color+"1a",color,padding:"2px 7px",borderRadius:5,fontWeight:600}}>Admin</span>}
                    {!b.active&&<span style={{fontSize:10,background:"var(--bg-hover)",color:"var(--text-4)",padding:"2px 7px",borderRadius:5}}>Inativo</span>}
                  </div>
                  <div style={{fontSize:12,color:"var(--text-4)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.email}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>toggle(b.id)} style={{
                    width:32,height:32,borderRadius:8,border:"1px solid var(--border)",
                    background:b.active?"#d1fae5":"var(--bg-hover)",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,
                    color:b.active?"#065f46":"var(--text-3)",fontWeight:600,
                  }}>{b.active?"✓":"○"}</button>
                  <button onClick={()=>isEdit?cancel():startEdit(b)} style={{
                    width:32,height:32,borderRadius:8,border:"1px solid var(--border)",
                    background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    {isEdit?<X size={14} color="var(--text-3)"/>:<Edit2 size={14} color="var(--text-4)"/>}
                  </button>
                </div>
              </div>

              {!isEdit&&(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginTop:14,paddingTop:14,borderTop:"1px solid var(--border)"}}>
                    {[{l:"Atendimentos",v:b.appts,a:undefined},{l:"Faturado",v:BRL(b.rev),a:undefined},{l:"A receber",v:BRL(com),a:"#10b981"}].map(m=>(
                      <div key={m.l} style={{background:"var(--bg-hover)",borderRadius:8,padding:"9px 10px"}}>
                        <div style={{fontSize:10,color:"var(--text-4)",textTransform:"uppercase",letterSpacing:".04em"}}>{m.l}</div>
                        <div style={{fontSize:14,fontWeight:600,marginTop:2,color:m.a||"var(--text)"}}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text-4)",marginBottom:4}}>
                      <span>Barbearia ({100-b.commission}%) — {BRL(shop)}</span>
                      <span>Barbeiro ({b.commission}%) — {BRL(com)}</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:"var(--border)",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${100-b.commission}%`,background:color,borderRadius:3,transition:"width .3s"}}/>
                    </div>
                  </div>
                </>
              )}
              {isEdit&&<BarberForm form={form} set={set} onSave={save} onCancel={cancel} canSave={canSave} title="Editar barbeiro"/>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
