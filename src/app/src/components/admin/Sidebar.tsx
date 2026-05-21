"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { LayoutDashboard, Calendar, Package, Users, Scissors, BarChart2, Settings, CreditCard, LogOut, Moon, Sun } from "lucide-react"

const NAV = [
  { href:"/dashboard",     label:"Dashboard",     Icon:LayoutDashboard },
  { href:"/agendamentos",  label:"Agendamentos",  Icon:Calendar        },
  { href:"/produtos",      label:"Estoque",       Icon:Package         },
  { href:"/clientes",      label:"Clientes",      Icon:Users           },
  { href:"/equipe",        label:"Equipe",        Icon:Scissors        },
  { href:"/relatorios",    label:"Relatórios",    Icon:BarChart2       },
  { href:"/configuracoes", label:"Configurações", Icon:Settings        },
  { href:"/assinatura",    label:"Assinatura",    Icon:CreditCard      },
]

export default function Sidebar() {
  const path = usePathname()
  const { data: session } = useSession()
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setDark(isDark)
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")
  }, [])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  return (
    <aside style={{ width:220, minHeight:"100vh", background:"var(--sidebar-bg)", color:"var(--sidebar-fg)", display:"flex", flexDirection:"column", flexShrink:0 }}>
      <div style={{ padding:"20px 20px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <div style={{ width:32,height:32,background:"white",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>
          <Scissors size={17} color="#111"/>
        </div>
        <span style={{ fontSize:15,fontWeight:600 }}>BarberClick</span>
      </div>

      <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, padding:"12px 10px" }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:8, textDecoration:"none",
              background:active?"rgba(255,255,255,.12)":"transparent",
              color:active?"var(--sidebar-fg)":"var(--sidebar-muted)",
              fontSize:13, fontWeight:active?500:400,
            }}>
              <Icon size={16}/>{label}
              {active&&<div style={{ marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:"white" }}/>}
            </Link>
          )
        })}
      </nav>

      <div style={{ padding:"0 10px 16px" }}>
        <button onClick={toggleDark} style={{
          width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
          padding:"9px 12px", borderRadius:8, border:"none", background:"transparent",
          color:"var(--sidebar-muted)", fontSize:13, cursor:"pointer", marginBottom:4,
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {dark?<Sun size={15}/>:<Moon size={15}/>}
            {dark?"Modo claro":"Modo escuro"}
          </div>
          <div style={{ width:32,height:18,borderRadius:9,background:dark?"rgba(255,255,255,.35)":"rgba(255,255,255,.15)",position:"relative" }}>
            <div style={{ position:"absolute",top:3,left:dark?15:3,width:12,height:12,borderRadius:"50%",background:"white",transition:"left .15s",boxShadow:"0 1px 3px rgba(0,0,0,.3)" }}/>
          </div>
        </button>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.08)", paddingTop:10, margin:"0 2px" }}>
          <div style={{ padding:"4px 10px 8px" }}>
            <div style={{ fontSize:13,fontWeight:500 }}>{session?.user?.name}</div>
            <div style={{ fontSize:11,color:"var(--sidebar-muted)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{session?.user?.email}</div>
            <div style={{ fontSize:10,color:"var(--sidebar-muted)",opacity:.6,marginTop:2,textTransform:"uppercase",letterSpacing:".04em" }}>Plano {session?.user?.plan}</div>
          </div>
          <button onClick={()=>signOut({callbackUrl:"/login"})} style={{ width:"100%",display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:8,border:"none",background:"transparent",color:"var(--sidebar-muted)",fontSize:13,cursor:"pointer" }}>
            <LogOut size={15}/>Sair
          </button>
        </div>
      </div>
    </aside>
  )
}
