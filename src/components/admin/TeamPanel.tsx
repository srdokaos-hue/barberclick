"use client"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { Plus, X, Check, Camera, Trash2, Target, ChevronDown, ChevronUp } from "lucide-react"

const inp:React.CSSProperties={width:"100%",boxSizing:"border-box",background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"}
const GOAL_TYPES=[{id:"cuts",label:"Cortes no mês"},{id:"revenue",label:"Faturamento"},{id:"commission",label:"Comissão"},{id:"custom",label:"Personalizado"}]
interface Goal{id:string;name:string;target:number;type:string}
interface Barber{id:string;name:string;email:string;role:string;commissionPct:number;avatarUrl?:string|null;active:boolean}

function GoalEditor({barberId,onClose}:{barberId:string;onClose:()=>void}){
  const [goals,setGoals]=useState<Goal[]>([])
  const [saving,setSaving]=useState(false)
  useEffect(()=>{
    fetch(`/api/barbers/${barberId}/goals`).then(r=>r.json()).then(d=>setGoals(d.data??[]))
  },[barberId])
  const add=()=>{if(goals.length<3)setGoals(g=>[...g,{id:"g"+Date.now(),name:"Meta",target:0,type:"cuts"}])}
  const remove=(id:string)=>setGoals(g=>g.filter(x=>x.id!==id))
  const update=(id:string,f:string,v:any)=>setGoals(g=>g.map(x=>x.id===id?{...x,[f]:v}:x))
  const save=async()=>{
    setSaving(true)
    await fetch(`/api/barbers/${barberId}/goals`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({goals})})
    setSaving(false); onClose()
  }
  return(
    <div style={{marginTop:12,background:"var(--color-background-secondary)",borderRadius:12,padding:14,border:"1px solid var(--color-border-secondary)"}}>
      <div style={{fontSize:12,fontWeight:600,color:"var(--color-text-secondary)",marginBottom:12,display:"flex",alignItems:"center",gap:5}}><Target size={13}/>Metas (até 3)</div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {goals.map((g,i)=>(
          <div key={g.id} style={{display:"flex",gap:6,alignItems:"center"}}>
            <span style={{fontSize:11,color:"var(--color-text-tertiary)",fontWeight:600,minWidth:18}}>#{i+1}</span>
            <select value={g.type} onChange={e=>update(g.id,"type",e.target.value)} style={{...inp,width:130,fontSize:12,padding:"7px 8px"}}>
              {GOAL_TYPES.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <input value={g.name} onChange={e=>update(g.id,"name",e.target.value)} placeholder="Nome" style={{...inp,flex:1,fontSize:12,padding:"7px 8px"}}/>
            <input type="number" value={g.target} onChange={e=>update(g.id,"target",Number(e.target.value))} placeholder="Meta" style={{...inp,width:80,fontSize:12,padding:"7px 8px"}}/>
            <button onClick={()=>remove(g.id)} style={{width:28,height:28,borderRadius:7,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,flexShrink:0}}><X size={12}/></button>
          </div>
        ))}
        {goals.length<3&&<button onClick={add} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 12px",borderRadius:8,border:"2px dashed var(--color-border-secondary)",background:"transparent",color:"var(--color-text-tertiary)",fontSize:12,cursor:"pointer"}}><Plus size={12}/>Adicionar meta</button>}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:10}}>
        <button onClick={onClose} style={{padding:"7px 12px",borderRadius:8,border:"1px solid var(--color-border-secondary)",background:"transparent",color:"var(--color-text-tertiary)",fontSize:12,cursor:"pointer"}}>Cancelar</button>
        <button onClick={save} disabled={saving} style={{padding:"7px 14px",borderRadius:8,border:"none",background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
          {saving?"Salvando…":<><Check size={12}/>Salvar</>}
        </button>
      </div>
    </div>
  )
}

function BarberModal({barber,onClose}:{barber:Barber|null;onClose:()=>void}){
  const qc=useQueryClient()
  const isNew=!barber
  const [name,    setName]    =useState(barber?.name??"")
  const [email,   setEmail]   =useState(barber?.email??"")
  const [password,setPassword]=useState("")
  const [role,    setRole]    =useState(barber?.role??"BARBER")
  const [pct,     setPct]     =useState(Number(barber?.commissionPct??50))
  const [avatar,  setAvatar]  =useState(barber?.avatarUrl??"")
  const [active,  setActive]  =useState(barber?.active??true)
  const [saving,  setSaving]  =useState(false)
  const [showGoals,setShowGoals]=useState(false)

  const save=async()=>{
    setSaving(true)
    const body:any={name,email,role,commissionPct:pct,avatarUrl:avatar||null,active}
    if(password) body.password=password
    const url=barber?`/api/barbers/${barber.id}`:"/api/barbers"
    await fetch(url,{method:barber?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})
    qc.invalidateQueries({queryKey:["team"]}); setSaving(false); onClose()
  }

  const del=async()=>{
    if(!barber||!confirm("Remover este barbeiro?")) return
    await fetch(`/api/barbers/${barber.id}`,{method:"DELETE"})
    qc.invalidateQueries({queryKey:["team"]}); onClose()
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"var(--color-background-primary)",borderRadius:14,width:"100%",maxWidth:480,maxHeight:"90vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:"1px solid var(--color-border-tertiary)"}}>
          <div style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary)"}}>{isNew?"Novo membro":"Editar membro"}</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",display:"flex"}}><X size={18}/></button>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:12}}>
          <div style={{textAlign:"center"}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"var(--color-background-secondary)",margin:"0 auto 8px",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {avatar?<img src={avatar} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Camera size={24} color="var(--color-text-tertiary)"/>}
            </div>
            <input value={avatar} onChange={e=>setAvatar(e.target.value)} placeholder="URL da foto" style={{...inp,fontSize:12,textAlign:"center"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Nome</label><input value={name} onChange={e=>setName(e.target.value)} style={inp}/></div>
            <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Função</label>
              <select value={role} onChange={e=>setRole(e.target.value)} style={inp}>
                <option value="BARBER">Barbeiro</option><option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>E-mail</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" style={inp}/></div>
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>{isNew?"Senha":"Nova senha (em branco = manter)"}</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" style={inp}/></div>
          <div>
            <label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Comissão — {pct}%</label>
            <input type="range" min="0" max="100" value={pct} onChange={e=>setPct(Number(e.target.value))} style={{width:"100%"}}/>
          </div>
          {!isNew&&barber&&(
            <div>
              <button onClick={()=>setShowGoals(v=>!v)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:9,border:"1px solid var(--color-border-secondary)",background:"var(--color-background-secondary)",cursor:"pointer",color:"var(--color-text-secondary)",fontSize:13,fontWeight:500}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><Target size={14}/>Metas do barbeiro</span>
                {showGoals?<ChevronUp size={14}/>:<ChevronDown size={14}/>}
              </button>
              {showGoals&&<GoalEditor barberId={barber.id} onClose={()=>setShowGoals(false)}/>}
            </div>
          )}
        </div>
        <div style={{padding:"0 20px 20px",display:"flex",gap:8}}>
          {!isNew&&<button onClick={del} style={{padding:"11px 14px",borderRadius:9,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center"}}><Trash2 size={14}/></button>}
          <button onClick={save} disabled={saving} style={{flex:1,padding:"12px",borderRadius:9,border:"none",cursor:"pointer",background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            {saving?"Salvando…":<><Check size={14}/>Salvar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TeamPanel(){
  const [modal,setModal]=useState<Barber|null|"new">(null)
  const {data,isLoading}=useQuery({
    queryKey:["team"],
    queryFn:()=>fetch("/api/barbers").then(r=>r.json()).then(d=>d.data??[]),
  })
  const members:Barber[]=data??[]
  return(
    <div style={{padding:"24px",maxWidth:860,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div><div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div><div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Equipe</div></div>
        <button onClick={()=>setModal("new")} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:"var(--accent,#111)",color:"var(--accent-fg,#fff)"}}><Plus size={15}/>Novo membro</button>
      </div>
      {isLoading&&<div style={{textAlign:"center",padding:40,color:"var(--color-text-tertiary)"}}>Carregando…</div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
        {members.map(m=>(
          <div key={m.id} onClick={()=>setModal(m)} style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:14,padding:20,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:"var(--color-background-secondary)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"var(--color-text-secondary)"}}>
                {m.avatarUrl?<img src={m.avatarUrl} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:m.name[0]}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>{m.role==="ADMIN"?"Admin":"Barbeiro"}</div>
              </div>
              <div style={{fontSize:10,padding:"3px 8px",borderRadius:10,background:m.active?"#d1fae5":"#fee2e2",color:m.active?"#065f46":"#991b1b",fontWeight:600,flexShrink:0}}>{m.active?"Ativo":"Inativo"}</div>
            </div>
            <div style={{background:"var(--color-background-secondary)",borderRadius:9,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:700,color:"var(--color-text-primary)"}}>{Number(m.commissionPct)}%</div>
              <div style={{fontSize:10,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em",marginTop:2}}>Comissão · toque para editar metas</div>
            </div>
          </div>
        ))}
      </div>
      {modal&&<BarberModal barber={modal==="new"?null:modal} onClose={()=>setModal(null)}/>}
    </div>
  )
}
