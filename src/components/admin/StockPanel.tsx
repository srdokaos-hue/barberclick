"use client"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Plus, AlertTriangle, Edit2, Check } from "lucide-react"

const BRL = (v: number) => "R$ " + (+v).toLocaleString("pt-BR",{minimumFractionDigits:2})

export default function StockPanel() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:"", salePrice:"", costPrice:"", stockQty:"", lowStockThreshold:"3" })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => { const r = await fetch("/api/products"); return (await r.json()).data ?? [] },
  })

  const addMutation = useMutation({
    mutationFn: async (data: object) => {
      const r = await fetch("/api/products", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data) })
      if (!r.ok) throw new Error("Erro")
    },
    onSuccess: () => { qc.invalidateQueries({queryKey:["products"]}); setShowForm(false); setForm({name:"",salePrice:"",costPrice:"",stockQty:"",lowStockThreshold:"3"}) },
  })

  const lowStock = products.filter((p: any) => p.stockQty <= p.lowStockThreshold)

  return (
    <div style={{ padding:"24px", maxWidth:800, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11,color:"#9ca3af",textTransform:"uppercase",letterSpacing:".06em" }}>Admin</div>
          <div style={{ fontSize:20,fontWeight:500 }}>Estoque</div>
        </div>
        <button onClick={()=>setShowForm(v=>!v)} style={{
          display:"flex",alignItems:"center",gap:5,padding:"9px 16px",borderRadius:8,border:"none",
          background:"#111",color:"white",fontSize:13,fontWeight:500,cursor:"pointer",
        }}><Plus size={14}/> Novo produto</button>
      </div>

      {lowStock.length>0&&(
        <div style={{ background:"#fef9c3",border:"1px solid #fcd34d",borderRadius:10,padding:"12px 16px",marginBottom:16 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:500,color:"#713f12",marginBottom:6 }}>
            <AlertTriangle size={15}/> {lowStock.length} produto(s) com estoque crítico
          </div>
          {lowStock.map((p: any) => (
            <div key={p.id} style={{ fontSize:12,color:"#92400e" }}>{p.name} — {p.stockQty} un. restantes (mín: {p.lowStockThreshold})</div>
          ))}
        </div>
      )}

      {showForm&&(
        <div style={{ background:"white",border:"2px solid #111",borderRadius:12,padding:20,marginBottom:16 }}>
          <div style={{ fontSize:14,fontWeight:500,marginBottom:14 }}>Novo produto</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10 }}>
            {[["Nome","name","text"],["Preço de venda","salePrice","number"],
              ["Custo","costPrice","number"],["Estoque atual","stockQty","number"],["Mínimo alerta","lowStockThreshold","number"]].map(([l,k,t])=>(
              <div key={k}>
                <label style={{ fontSize:12,color:"#6b7280",display:"block",marginBottom:3 }}>{l}</label>
                <input type={t} value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                  style={{ width:"100%",boxSizing:"border-box" }}/>
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={()=>setShowForm(false)}>Cancelar</button>
            <button onClick={()=>addMutation.mutate({...form,salePrice:+form.salePrice,costPrice:+form.costPrice,stockQty:+form.stockQty,lowStockThreshold:+form.lowStockThreshold})}
              style={{ flex:1,padding:"10px",borderRadius:8,border:"none",background:"#111",color:"white",fontSize:13,fontWeight:500,cursor:"pointer" }}>
              <Check size={14} style={{ display:"inline",marginRight:4 }}/>Adicionar
            </button>
          </div>
        </div>
      )}

      {isLoading&&<div style={{ textAlign:"center",padding:40,color:"#9ca3af" }}>Carregando…</div>}
      <div style={{ background:"white",border:"1px solid #e5e7eb",borderRadius:12 }}>
        {products.map((p: any,i: number)=>{
          const low = p.stockQty<=p.lowStockThreshold
          return (
            <div key={p.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 16px",
              borderBottom:i<products.length-1?"1px solid #f3f4f6":"none" }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:low?"#ef4444":"#10b981",flexShrink:0 }}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:500 }}>{p.name}</div>
                <div style={{ fontSize:11,color:"#9ca3af" }}>Venda {BRL(+p.salePrice)} · Custo {BRL(+p.costPrice)} · Margem {Math.round((p.salePrice-p.costPrice)/p.salePrice*100)}%</div>
              </div>
              <div style={{ textAlign:"right",flexShrink:0 }}>
                <div style={{ fontSize:14,fontWeight:500,color:low?"#ef4444":"inherit" }}>{p.stockQty} un.</div>
                <div style={{ fontSize:10,color:"#9ca3af" }}>mín {p.lowStockThreshold}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
