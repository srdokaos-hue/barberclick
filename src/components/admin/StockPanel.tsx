"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Plus, AlertTriangle, Package, X, Check, Trash2 } from "lucide-react"

const BRL=(v:number)=>"R$ "+v.toLocaleString("pt-BR",{minimumFractionDigits:2})
const margin=(s:number,c:number)=>s>0?Math.round((s-c)/s*100):0

const S={
  page:{padding:"24px",maxWidth:860,margin:"0 auto"},
  header:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20},
  title:{fontSize:20,fontWeight:600,color:"var(--color-text-primary)"},
  sub:{fontSize:11,color:"var(--color-text-tertiary)",textTransform:"uppercase" as const,letterSpacing:".06em"},
  btn:{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:"var(--color-text-primary)",color:"var(--color-background-primary)"},
  card:{background:"var(--color-background-primary)",border:"1px solid var(--color-border-tertiary)",borderRadius:12,overflow:"hidden"},
  row:(i:number,last:boolean)=>({display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderBottom:last?"none":"1px solid var(--color-border-tertiary)",cursor:"pointer",background:"var(--color-background-primary)"}),
  dot:(low:boolean)=>({width:10,height:10,borderRadius:"50%",flexShrink:0,background:low?"#ef4444":"#10b981"}),
  badge:(bg:string,c:string)=>({fontSize:11,padding:"2px 8px",borderRadius:5,background:bg,color:c,fontWeight:600,flexShrink:0}),
  overlay:{position:"fixed" as const,inset:0,background:"rgba(0,0,0,.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16},
  modal:{background:"var(--color-background-primary)",borderRadius:14,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,.3)"},
  mhead:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 20px",borderBottom:"1px solid var(--color-border-tertiary)"},
  mtitle:{fontSize:15,fontWeight:600,color:"var(--color-text-primary)"},
  mbody:{padding:20,display:"flex",flexDirection:"column" as const,gap:12},
  label:{fontSize:12,color:"var(--color-text-tertiary)",display:"block",marginBottom:4},
  input:{width:"100%",boxSizing:"border-box" as const,background:"var(--color-background-secondary)",border:"1px solid var(--color-border-secondary)",color:"var(--color-text-primary)",fontSize:14,borderRadius:8,padding:"9px 12px"},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  foot:{padding:"0 20px 20px",display:"flex",gap:8},
  savebtn:{flex:1,padding:"11px",borderRadius:9,border:"none",cursor:"pointer",background:"var(--color-text-primary)",color:"var(--color-background-primary)",fontSize:14,fontWeight:600},
  delbtn:{padding:"11px 14px",borderRadius:9,border:"1px solid var(--color-border-danger,#fca5a5)",background:"var(--color-background-danger,#fef2f2)",color:"var(--color-text-danger,#dc2626)",fontSize:14,cursor:"pointer"},
  alert:{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"var(--color-background-danger,#fef2f2)",border:"1px solid var(--color-border-danger,#fca5a5)",borderRadius:9,marginBottom:12,fontSize:13,color:"var(--color-text-danger,#dc2626)"},
}

interface Product{id:string;name:string;salePrice:number;costPrice:number;stockQty:number;lowStockThreshold:number;active:boolean}

function Modal({prod,onClose,onSave}:{prod:Product|null;onClose:()=>void;onSave:(d:any)=>void}){
  const [name,setName]  = useState(prod?.name??"")
  const [sale,setSale]  = useState(prod?.salePrice!=null?String(prod.salePrice):"")
  const [cost,setCost]  = useState(prod?.costPrice!=null?String(prod.costPrice):"")
  const [qty, setQty]   = useState(prod?.stockQty!=null?String(prod.stockQty):"")
  const [low, setLow]   = useState(prod?.lowStockThreshold!=null?String(prod.lowStockThreshold):"3")
  const saleN=Number(sale)||0, costN=Number(cost)||0, qtyN=Number(qty)||0, lowN=Number(low)||0
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.mhead}>
          <div style={S.mtitle}>{prod?"Editar produto":"Novo produto"}</div>
          <button onClick={onClose} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-tertiary)",display:"flex"}}><X size={18}/></button>
        </div>
        <div style={S.mbody}>
          <div><label style={S.label}>Nome</label><input style={S.input} value={name} onChange={e=>setName(e.target.value)} placeholder="Ex: Pomada Matte"/></div>
          <div style={S.grid2}>
            <div><label style={S.label}>Preço de venda (R$)</label><input style={S.input} type="number" value={sale} onChange={e=>setSale(e.target.value)}/></div>
            <div><label style={S.label}>Custo (R$)</label><input style={S.input} type="number" value={cost} onChange={e=>setCost(e.target.value)}/></div>
          </div>
          <div style={S.grid2}>
            <div><label style={S.label}>Estoque atual</label><input style={S.input} type="number" value={qty} onChange={e=>setQty(e.target.value)}/></div>
            <div><label style={S.label}>Alerta abaixo de</label><input style={S.input} type="number" value={low} onChange={e=>setLow(e.target.value)}/></div>
          </div>
          {saleN>0&&costN>0&&<div style={{fontSize:13,color:"var(--color-text-secondary)",background:"var(--color-background-secondary)",borderRadius:8,padding:"9px 12px"}}>
            Margem: <strong>{margin(saleN,costN)}%</strong> · Lucro por unidade: <strong>{BRL(saleN-costN)}</strong>
          </div>}
        </div>
        <div style={S.foot}>
          {prod&&<button onClick={()=>onSave({id:prod.id,delete:true})} style={S.delbtn}><Trash2 size={14}/></button>}
          <button onClick={()=>onSave({id:prod?.id,name,salePrice:saleN,costPrice:costN,stockQty:qtyN,lowStockThreshold:lowN})} style={S.savebtn}>
            <Check size={14} style={{display:"inline",marginRight:4}}/>Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StockPanel(){
  const qc = useQueryClient()
  const [modal,setModal] = useState<Product|"new"|null>(null)

  const {data,isLoading} = useQuery({
    queryKey:["products"],
    queryFn:()=>fetch("/api/products").then(r=>r.json()).then(d=>d.data??[]),
  })

  const mut = useMutation({
    mutationFn:(body:any)=>body.delete
      ? fetch(`/api/products/${body.id}`,{method:"DELETE"})
      : fetch(body.id?`/api/products/${body.id}`:"/api/products",{method:body.id?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}),
    onSuccess:()=>{ qc.invalidateQueries({queryKey:["products"]}); setModal(null) },
  })

  const products:Product[] = data??[]
  const low = products.filter(p=>p.stockQty<=p.lowStockThreshold&&p.active)

  return(
    <div style={S.page}>
      <div style={S.header}>
        <div><div style={S.sub}>Admin</div><div style={S.title}>Estoque</div></div>
        <button style={S.btn} onClick={()=>setModal("new")}><Plus size={15}/>Novo produto</button>
      </div>

      {low.length>0&&(
        <div style={S.alert}>
          <AlertTriangle size={16} style={{flexShrink:0}}/>
          <span><strong>{low.length} produto{low.length>1?"s":""}</strong> com estoque baixo: {low.map(p=>p.name).join(", ")}</span>
        </div>
      )}

      {isLoading&&<div style={{textAlign:"center",padding:40,color:"var(--color-text-tertiary)"}}>Carregando…</div>}

      <div style={S.card}>
        {!isLoading&&!products.filter(p=>p.active).length&&(
          <div style={{padding:40,textAlign:"center",color:"var(--color-text-tertiary)",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <Package size={32} style={{opacity:.3}}/><span>Nenhum produto cadastrado</span>
          </div>
        )}
        {products.filter(p=>p.active).map((p,i,arr)=>{
          const low=p.stockQty<=p.lowStockThreshold
          const mg=margin(p.salePrice,p.costPrice)
          return(
            <div key={p.id} style={S.row(i,i===arr.length-1)} onClick={()=>setModal(p)}>
              <div style={S.dot(low)}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:14,fontWeight:500,color:"var(--color-text-primary)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:12,color:"var(--color-text-tertiary)",marginTop:2}}>
                  Venda {BRL(p.salePrice)} · Custo {BRL(p.costPrice)} · Margem {mg}%
                </div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:600,color:"var(--color-text-primary)"}}>{p.stockQty} un.</div>
                <div style={{fontSize:11,color:"var(--color-text-tertiary)"}}>mín {p.lowStockThreshold}</div>
              </div>
              {low&&<span style={S.badge("#fef2f2","#dc2626")}>Baixo</span>}
            </div>
          )
        })}
      </div>

      {modal&&<Modal prod={modal==="new"?null:modal} onClose={()=>setModal(null)} onSave={d=>mut.mutate(d)}/>}
    </div>
  )
}
