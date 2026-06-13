"use client"
import { useState } from "react"
import { Zap } from "lucide-react"
import dynamic from "next/dynamic"
const VendaRapida = dynamic(()=>import("./VendaRapida"),{ssr:false})

export default function VendaRapidaFloat() {
  const [open,    setOpen]    = useState(false)
  const [hovered, setHovered] = useState(false)
  return (
    <>
      <button onClick={()=>setOpen(true)} title="Venda Rápida"
        onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{
          position:"fixed",bottom:24,right:24,zIndex:100,
          width:56,height:56,borderRadius:"50%",border:"none",cursor:"pointer",
          background:"var(--accent)",
          boxShadow:"0 4px 20px rgba(0,0,0,0.3)",
          display:"flex",alignItems:"center",justifyContent:"center",
          transform:hovered?"scale(1.1)":"scale(1)",
          transition:"transform .15s",
        }}>
        <Zap size={22} color="white"/>
      </button>
      {open&&<VendaRapida onClose={()=>setOpen(false)}/>}
    </>
  )
}
