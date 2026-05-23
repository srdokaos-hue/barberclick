"use client"
import { useState } from "react"
import { Zap } from "lucide-react"
import VendaRapida from "./VendaRapida"

export default function VendaRapidaFloat() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={()=>setOpen(true)}
        title="Venda Rápida"
        style={{
          position:"fixed", bottom:24, right:24, zIndex:100,
          width:56, height:56, borderRadius:"50%", border:"none", cursor:"pointer",
          background:"linear-gradient(135deg,#6366f1,#8b5cf6)",
          boxShadow:"0 4px 20px rgba(99,102,241,.5)",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"transform .15s, box-shadow .15s",
        }}
        onMouseEnter={e=>{(e.target as HTMLButtonElement).style.transform="scale(1.08)"}}
        onMouseLeave={e=>{(e.target as HTMLButtonElement).style.transform="scale(1)"}}
      >
        <Zap size={22} color="white"/>
      </button>
      {open&&<VendaRapida onClose={()=>setOpen(false)}/>}
    </>
  )
}
