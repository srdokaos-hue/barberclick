"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Search, AlertCircle, UserPlus, X, Check } from "lucide-react"

const S={
  page:{padding:"24px",maxWidth:860,margin:"0 auto"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap" as const,gap:10},
  title:{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"},
  sub:{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase" as const,letterSpacing:".06em"},
  btn:{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:"var(--color-text-primary)",color:"var(--color-background-primary)"},
  card:{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"},
  row:(last:boolean)=>({display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:last?"none":"1px solid var(--color-border-tertiary)"}),
  overlay:{position:"fixed" as const,inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
  modal:{background:"var(--color-background-primary)",borderRadius:14,width:"100%",maxWidth:420,boxShadow:"0 20px 60px rgba(0,0,0,.3)"},
  mhead:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:"1px solid var(--color-border-tertiary)"},
  mbody:{padding:20,display:"flex",flexDirection:"column" as const,gap:12},
  label:{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4},
  input:{width:"100%",boxSizing:"border-box" as const,background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"},
  savebtn:{width:"100%",padding:"12px",borderRadius:9,border:"none",cursor:"pointer",background:"var(--color-text-primary)",color:"var(--color-background-primary)",fontSize:14,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6},
  badge:(bg:string,c:string)=>({fontSize:11,padding:"2px 8px",borderRadius:5,background:bg,color:c,fontWeight:600,flexShrink:0,whiteSpace:"nowrap" as const}),
  stats:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16},
  statCard:{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:10,padding:"14px"},
}

function NovoClienteModal({onClose,onSave}:{onClose:()=>void;onSave:(d:any)=>void}){
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
    if(!name.trim()||!phone.replace(/\D/g,"")) {setErr("Nome e telefone são obrigatórios"); return}
    setLoading(true); setErr("")
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
          {err&&<div style={{fontSize:12,color:"var(--color-text-danger,#dc2626)",background:"var(--color-background-danger,#fef2f2)",padding:"8px 12px",borderRadius:7}}>{err}</div>}
          <div><label style={S.label}>Nome *</label><input style={S.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo"/></div>
          <div><label style={S.label}>WhatsApp *</label><input style={S.input} value={phone} onChange={e=>handlePhone(e.target.value)} placeholder="(11) 99999-9999"/></div>
          <div><label style={S.label}>Observação (opcional)</label><textarea style={{...S.input,resize:"none" as const,rows:undefined} as any} rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Prefere degradê, tem alergia a produto X…"/></div>
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

  const clients=data??[]
  const atRisk=clients.filter((c:any)=>c.status==="at_risk"||c.churnRisk)
  const total=clients.length
  const newThis=clients.filter((c:any)=>c.status==="new").length

  const statusBadge=(c:any)=>{
    if(c.status==="at_risk"||c.churnRisk) return <span style={S.badge("#fef2f2","#dc2626")}>Em risco</span>
    if(c.status==="new") return <span style={S.badge("#d1fae5","#065f46")}>Novo</span>
    return null
  }

  return(
    <div style={S.page}>
      <div style={S.header}>
        <div><div style={S.sub}>Admin</div><div style={S.title}>Clientes</div></div>
        <button style={S.btn} onClick={()=>setModal(true)}><UserPlus size={15}/>Criar cliente</button>
      </div>

      <div style={S.stats}>
        {[{label:"Total",val:total},{label:"Em risco",val:atRisk.length},{label:"Novos (30d)",val:newThis}].map(s=>(
          <div key={s.label} style={S.statCard}>
            <div style={{fontSize:22,fontWeight:700,color:s.label==="Em risco"&&s.val>0?"#ef4444":"var(--color-text-primary)"}}>{s.val}</div>
            <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".04em",marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {atRisk.length>0&&(
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--color-background-danger,#fef2f2)",border:"1px solid var(--color-border-danger,#fca5a5)",borderRadius:9,marginBottom:12,fontSize:13,color:"var(--color-text-danger,#dc2626)"}}>
          <AlertCircle size={15} style={{flexShrink:0}}/><span><strong>{atRisk.length} cliente{atRisk.length>1?"s":""} em risco</strong> de não voltar</span>
        </div>
      )}

      <div style={{position:"relative",marginBottom:12}}>
        <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--color-text-tertiary)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome…"
          style={{width:"100%",boxSizing:"border-box",paddingLeft:36,background:"var(--color-background-primary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",borderRadius:9,padding:"10px 12px 10px 36px",fontSize:13}}/>
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
              <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:1}}>{c.phone}{c.lastVisitAt?` · Última visita: ${new Date(c.lastVisitAt).toLocaleDateString("pt-BR")}`:""}</div>
            </div>
            {statusBadge(c)}
          </div>
        ))}
      </div>

      {modal&&<NovoClienteModal onClose={()=>setModal(false)} onSave={d=>mut.mutate(d)}/>}
    </div>
  )
}
