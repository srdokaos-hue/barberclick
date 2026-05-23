"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Search, AlertCircle, UserPlus, X, Check } from "lucide-react"

const inp={width:"100%",boxSizing:"border-box" as const,background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"}
const S={
  page:{padding:"24px",maxWidth:860,margin:"0 auto"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap" as const,gap:10},
  btn:{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:"var(--accent,#111)",color:"var(--accent-fg,#fff)"},
  card:{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"},
  row:(last:boolean)=>({display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:last?"none":"1px solid var(--color-border-tertiary)"}),
  overlay:{position:"fixed" as const,inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
  modal:{background:"var(--color-background-primary)",borderRadius:14,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.3)"},
  mhead:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:"1px solid var(--color-border-tertiary)"},
  mbody:{padding:20,display:"flex",flexDirection:"column" as const,gap:12},
  savebtn:{width:"100%",padding:"12px",borderRadius:9,border:"none",cursor:"pointer",background:"var(--accent,#111)",color:"var(--accent-fg,#fff)",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  stats:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16},
  statCard:{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:10,padding:"14px"},
}

// Calcula status pelo lastVisitAt e returnIntervalDays — não depende de campo "status" da API
const getStatus=(c:any)=>{
  const days30=Date.now()-30*86400000
  if(!c.lastVisitAt) return new Date(c.createdAt).getTime()>days30?"new":"unknown"
  const daysSince=(Date.now()-new Date(c.lastVisitAt).getTime())/86400000
  return daysSince>(c.returnIntervalDays||30)?"at_risk":"ok"
}

function NovoClienteModal({onClose,onSave}:{onClose:()=>void;onSave:(d:any)=>Promise<void>}){
  const [name,setName]=useState("")
  const [phone,setPhone]=useState("")
  const [notes,setNotes]=useState("")
  const [loading,setLoading]=useState(false)
  const [err,setErr]=useState("")

  const handlePhone=(v:string)=>{
    const d=v.replace(/\D/g,"")
    if(d.length<=2) setPhone(d)
    else if(d.length<=7) setPhone(`(${d.slice(0,2)}) ${d.slice(2)}`)
    else if(d.length<=11) setPhone(`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`)
  }

  const save=async()=>{
    if(!name.trim()||phone.replace(/\D/g,"").length<10){setErr("Nome e WhatsApp válido são obrigatórios");return}
    setLoading(true);setErr("")
    await onSave({name:name.trim(),phone,notes})
    setLoading(false)
  }

  return(
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.mhead}>
          <div style={{fontSize:15,fontWeight:600,color:"var(--color-text-primary)",display:"flex",alignItems:"center",gap:8}}><UserPlus size={16}/>Novo cliente</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",display:"flex"}}><X size={18}/></button>
        </div>
        <div style={S.mbody}>
          {err&&<div style={{fontSize:12,color:"#dc2626",background:"#fef2f2",padding:"8px 12px",borderRadius:7}}>{err}</div>}
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Nome *</label><input style={inp} value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo"/></div>
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>WhatsApp *</label><input style={inp} value={phone} onChange={e=>handlePhone(e.target.value)} placeholder="(11) 99999-9999"/></div>
          <div><label style={{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4}}>Observação</label><textarea style={{...inp,resize:"none"} as any} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Prefere degradê, alergia a produto X…"/></div>
        </div>
        <div style={{padding:"0 20px 20px"}}>
          <button onClick={save} disabled={loading} style={S.savebtn}>
            {loading?"Salvando…":<><Check size={14}/>Criar cliente</>}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClientsPanel(){
  const qc=useQueryClient()
  const [search,setSearch]=useState("")
  const [modal,setModal]=useState(false)

  const {data,isLoading}=useQuery({
    queryKey:["clients",search],
    queryFn:()=>fetch(`/api/clients${search?`?search=${search}`:""}`).then(r=>r.json()).then(d=>d.data??[]),
  })

  const mut=useMutation({
    mutationFn:(body:any)=>fetch("/api/clients",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),
    onSuccess:()=>{qc.invalidateQueries({queryKey:["clients"]});setModal(false)},
  })

  const clients=(data??[]).map((c:any)=>({...c,_status:getStatus(c)}))
  const atRisk=clients.filter((c:any)=>c._status==="at_risk")
  const newClients=clients.filter((c:any)=>c._status==="new")

  const Badge=({c}:{c:any})=>{
    if(c._status==="at_risk") return <span style={{fontSize:11,padding:"2px 8px",borderRadius:5,background:"#fef2f2",color:"#dc2626",fontWeight:600,flexShrink:0}}>Em risco</span>
    if(c._status==="new")     return <span style={{fontSize:11,padding:"2px 8px",borderRadius:5,background:"#d1fae5",color:"#065f46",fontWeight:600,flexShrink:0}}>Novo</span>
    return null
  }

  return(
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em"}}>Admin</div>
          <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"}}>Clientes</div>
        </div>
        <button style={S.btn} onClick={()=>setModal(true)}><UserPlus size={15}/>Criar cliente</button>
      </div>

      <div style={S.stats}>
        {[
          {label:"Total",          val:clients.length,     danger:false},
          {label:"Em risco",       val:atRisk.length,      danger:atRisk.length>0},
          {label:"Novos (30d)",    val:newClients.length,  danger:false},
        ].map(s=>(
          <div key={s.label} style={S.statCard}>
            <div style={{fontSize:22,fontWeight:700,color:s.danger?"#ef4444":"var(--color-text-primary)"}}>{s.val}</div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {atRisk.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:9,marginBottom:12,fontSize:13,color:"#dc2626"}}>
          <AlertCircle size={15} style={{flexShrink:0}}/><span><strong>{atRisk.length} cliente{atRisk.length>1?"s":""} em risco</strong> — não retornam além do intervalo configurado — toque para ver</span>
        </div>
      )}

      <div style={{position:"relative",marginBottom:12}}>
        <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--color-text-tertiary)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome…"
          style={{...inp,paddingLeft:36,borderRadius:9,fontSize:13}}/>
      </div>

      <div style={S.card}>
        {isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
        {!isLoading&&!clients.length&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Nenhum cliente encontrado</div>}
        {clients.map((c:any,i:number)=>(
          <div key={c.id} style={S.row(i===clients.length-1)}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:"var(--color-text-secondary)",flexShrink:0}}>
              {c.name?.[0]?.toUpperCase()??"?"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{c.name}</div>
              <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:1}}>
                {c.phone}{c.lastVisitAt?` · Última visita: ${new Date(c.lastVisitAt).toLocaleDateString("pt-BR")}`:" · Nunca visitou"}
              </div>
            </div>
            <Badge c={c}/>
          </div>
        ))}
      </div>

      {modal&&<NovoClienteModal onClose={()=>setModal(false)} onSave={async d=>{await mut.mutateAsync(d)}}/>}
    </div>
  )
}
