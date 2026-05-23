"use client"
import { useQuery } from "@tanstack/react-query"
const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})
export default function BarberEstoque(){
  const {data,isLoading}=useQuery({
    queryKey:["barber-estoque"],
    queryFn:()=>fetch("/api/products").then(r=>r.json()).then(d=>d.data??[]),
  })
  const products=(data??[]).filter((p:any)=>p.active)
  return(
    <div style={{padding:"24px",maxWidth:720,margin:"0 auto"}}>
      <div style={{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase",letterSpacing:".06em",marginBottom:4}}>Consulta</div>
      <div style={{fontSize:20,fontWeight:600,color:"var(--color-text-primary)",marginBottom:20}}>Estoque</div>
      <div style={{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"}}>
        {isLoading&&<div style={{padding:32,textAlign:"center",color:"var(--color-text-tertiary)"}}>Carregando…</div>}
        {products.map((p:any,i:number)=>(
          <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:i<products.length-1?"1px solid var(--color-border-tertiary)":"none"}}>
            <div style={{width:10,height:10,borderRadius:"50%",flexShrink:0,background:p.stockQty<=p.lowStockThreshold?"#ef4444":"#10b981"}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)"}}>{p.name}</div>
              <div style={{fontSize:12,color:"var(--color-text-tertiary)"}}>{BRL(p.salePrice)} · Margem {p.costPrice>0?Math.round((p.salePrice-p.costPrice)/p.salePrice*100):0}%</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:14,fontWeight:600,color:p.stockQty<=p.lowStockThreshold?"#ef4444":"var(--color-text-primary)"}}>{p.stockQty} un.</div>
              <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>mín {p.lowStockThreshold}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
