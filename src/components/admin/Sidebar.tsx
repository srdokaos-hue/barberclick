"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Calendar, Package, Users, Scissors,
  BarChart2, Settings, CreditCard, LogOut, Moon, Sun, Menu, X
} from "lucide-react"

const NAV = [
  { href:"/dashboard",     label:"Dashboard",    Icon:LayoutDashboard },
  { href:"/agendamentos",  label:"Agendamentos", Icon:Calendar        },
  { href:"/produtos",      label:"Estoque",      Icon:Package         },
  { href:"/clientes",      label:"Clientes",     Icon:Users           },
  { href:"/equipe",        label:"Equipe",       Icon:Scissors        },
  { href:"/relatorios",    label:"Relatórios",   Icon:BarChart2       },
  { href:"/configuracoes", label:"Configurações",Icon:Settings        },
  { href:"/assinatura",    label:"Assinatura",   Icon:CreditCard      },
]

export default function Sidebar() {
  const path = usePathname()
  const { data: session } = useSession()
  const [dark,     setDark]     = useState(false)
  const [open,     setOpen]     = useState(false)
  const [mobile,   setMobile]   = useState(false)
  const [shopName, setShopName] = useState("BarberaSystem")
  const [logoUrl,  setLogoUrl]  = useState("")

  // Detecta mobile
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    fn()
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])

  // Tema + cor + nome da barbearia
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    const isDark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setDark(isDark)
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light")

    const ac = localStorage.getItem("accentColor")
    if (ac) {
      document.documentElement.style.setProperty("--accent", ac)
      document.documentElement.style.setProperty("--sidebar-bg", ac)
      const r=parseInt(ac.slice(1,3),16), g=parseInt(ac.slice(3,5),16), b=parseInt(ac.slice(5,7),16)
      const lum = (0.299*r+0.587*g+0.114*b)/255
      const fg = lum > 0.5 ? "#111827" : "#ffffff"
      document.documentElement.style.setProperty("--accent-fg", fg)
      document.documentElement.style.setProperty("--sidebar-fg", fg)
      document.documentElement.style.setProperty("--sidebar-muted", lum>0.5?"rgba(17,24,39,.5)":"rgba(255,255,255,.55)")
    }

    const n = localStorage.getItem("shopName")
    if (n) setShopName(n)

    const handler = () => {
      const n2 = localStorage.getItem("shopName")
      if (n2) setShopName(n2)
    }
    window.addEventListener("settingsUpdated", handler)
    return () => window.removeEventListener("settingsUpdated", handler)
  }, [])

  // Busca logo da API
  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.data?.barbershop?.logoUrl) setLogoUrl(d.data.barbershop.logoUrl)
        if (d?.data?.barbershop?.name)    setShopName(d.data.barbershop.name)
      })
      .catch(() => {})
  }, [])

  // Fecha ao navegar
  useEffect(() => { setOpen(false) }, [path])

  const toggleDark = () => {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light")
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  const navItems = (
    <>
      {NAV.map(({ href, label, Icon }) => {
        const active = path === href || (href !== "/dashboard" && path.startsWith(href))
        return (
          <Link key={href} href={href} style={{
            display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
            borderRadius:8, textDecoration:"none",
            background: active ? "rgba(255,255,255,.15)" : "transparent",
            color: active ? "var(--sidebar-fg)" : "var(--sidebar-muted)",
            fontSize:14, fontWeight: active ? 500 : 400,
          }}>
            <Icon size={17} />{label}
            {active && <div style={{ marginLeft:"auto", width:4, height:4, borderRadius:"50%", background:"var(--sidebar-fg)" }} />}
          </Link>
        )
      })}
    </>
  )

  const bottomSection = (
    <div style={{ padding:"0 10px 16px" }}>
      <button onClick={toggleDark} style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 12px", borderRadius:8, border:"none", background:"transparent", color:"var(--sidebar-muted)", fontSize:13, cursor:"pointer", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
          {dark ? "Modo claro" : "Modo escuro"}
        </div>
        <div style={{ width:32, height:18, borderRadius:9, background:dark?"rgba(255,255,255,.35)":"rgba(255,255,255,.15)", position:"relative" }}>
          <div style={{ position:"absolute", top:3, left:dark?15:3, width:12, height:12, borderRadius:"50%", background:"white", transition:"left .15s" }} />
        </div>
      </button>
      <div style={{ borderTop:"1px solid rgba(255,255,255,.1)", paddingTop:10, margin:"0 2px" }}>
        <div style={{ padding:"4px 10px 8px" }}>
          <div style={{ fontSize:13, fontWeight:500, color:"var(--sidebar-fg)" }}>{session?.user?.name}</div>
          <div style={{ fontSize:11, color:"var(--sidebar-muted)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{session?.user?.email}</div>
        </div>
        <button onClick={() => signOut({ callbackUrl:"/login" })} style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"9px 12px", borderRadius:8, border:"none", background:"transparent", color:"var(--sidebar-muted)", fontSize:13, cursor:"pointer" }}>
          <LogOut size={15} />Sair
        </button>
      </div>
    </div>
  )

  const logoEl = logoUrl
    ? <img src={logoUrl} alt={shopName} style={{ width:32, height:32, borderRadius:8, objectFit:"cover", flexShrink:0 }} />
    : <div style={{ width:32, height:32, background:"rgba(255,255,255,.15)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}><Scissors size={17} color="var(--sidebar-fg)" /></div>

  const sidebarStyle: React.CSSProperties = {
    display:"flex", flexDirection:"column", height:"100%",
    background:"var(--sidebar-bg)", color:"var(--sidebar-fg)",
  }

  if (mobile) return (
    <>
      {/* Top bar mobile */}
      <div style={{ position:"fixed", top:0, left:0, right:0, height:56, zIndex:100, background:"var(--sidebar-bg)", borderBottom:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", padding:"0 16px", gap:12 }}>
        <button onClick={() => setOpen(true)} style={{ background:"transparent", border:"none", color:"var(--sidebar-fg)", cursor:"pointer", padding:4, display:"flex" }}>
          <Menu size={22} />
        </button>
        {logoEl}
        <span style={{ fontSize:15, fontWeight:600, color:"var(--sidebar-fg)", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{shopName}</span>
        <span style={{ fontSize:12, color:"var(--sidebar-muted)" }}>
          {NAV.find(n => path === n.href || path.startsWith(n.href + "/"))?.label}
        </span>
      </div>

      {open && <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:200 }} />}

      <div style={{ position:"fixed", top:0, left:0, bottom:0, width:260, zIndex:300, transform:open?"translateX(0)":"translateX(-100%)", transition:"transform .25s ease" }}>
        <div style={sidebarStyle}>
          <div style={{ padding:"18px 20px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid rgba(255,255,255,.1)" }}>
            {logoEl}
            <span style={{ fontSize:14, fontWeight:600, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--sidebar-fg)" }}>{shopName}</span>
            <button onClick={() => setOpen(false)} style={{ background:"transparent", border:"none", color:"var(--sidebar-muted)", cursor:"pointer", padding:4, display:"flex" }}><X size={20} /></button>
          </div>
          <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, padding:"12px 10px", overflowY:"auto" }}>
            {navItems}
          </nav>
          {bottomSection}
        </div>
      </div>

      <div style={{ height:56 }} />
    </>
  )

  return (
    <aside style={{ width:220, minHeight:"100vh", flexShrink:0 }}>
      <div style={sidebarStyle}>
        <div style={{ padding:"18px 20px 16px", display:"flex", alignItems:"center", gap:10, borderBottom:"1px solid rgba(255,255,255,.1)" }}>
          {logoEl}
          <span style={{ fontSize:14, fontWeight:600, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", color:"var(--sidebar-fg)" }}>{shopName}</span>
        </div>
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, padding:"12px 10px", overflowY:"auto" }}>
          {navItems}
        </nav>
        {bottomSection}
      </div>
    </aside>
  )
}
