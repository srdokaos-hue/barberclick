"use client"
import { useState } from "react"
import { Zap } from "lucide-react"
import dynamic from "next/dynamic"
const VendaRapida = dynamic(()=>import("@/components/admin/VendaRapida"),{ssr:false})

export default function BarberVendaFloat({ barberId }: { barberId: string }) {
  const [open,    setOpen]    = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <button
        onClick={()=>setOpen(true)}
        title="Venda Rápida"
        onMouseEnter={()=>setHovered(true)}
        onMouseLeave={()=>setHovered(false)}
        style={{
          position:"fixed", bottom:24, right:24, zIndex:100,
          width:56, height:56, borderRadius:"50%", border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow:"0 4px 20px rgba(99,102,241,.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transform:hovered?"scale(1.1)":"scale(1)",
          transition:"transform .15s",
        }}>
        <Zap size={22} color="white"/>
      </button>
      {/* Abre com o barbeiro pré-selecionado */}
      {open&&<VendaRapida onClose={()=>setOpen(false)} defaultBarberId={barberId}/>}
    </>
  )
}
