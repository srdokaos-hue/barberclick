"use client"
import { useQuery } from "@tanstack/react-query"
export default function BarberClientes(){
  const {data,isLoading}=useQuery({
    queryKey:["barber-clients"],
    queryFn:()=>fetch("/api/clients").then(r=>r.json()).then(d=>d.data??[]),
  })
  const clients=data??[]
  return(
    <div style={{padding:"24px",maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Meus clientes</div>
      <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)",marginBottom:20}}>Clientes</div>
      <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"}}>
        {isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
        {clients.map((c:any,i:number)=>(
          <div key={c.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<clients.length-1?"1px solid var(--color-border-tertiary)":"none"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:"var(--color-background-secondary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:600,color:"var(--color-text-secondary)",flexShrink:0}}>{c.name?.[0]?.toUpperCase()||"?"}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{c.name}</div>
              <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{c.phone}{c.lastVisitAt?` · Última visita: ${new Date(c.lastVisitAt).toLocaleDateString("pt-BR")}`:""}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
