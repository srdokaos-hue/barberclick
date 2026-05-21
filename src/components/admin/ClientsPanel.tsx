"use client"
import { useState } from "react"
import { Search, Send, Clock, AlertCircle, ChevronRight, Check, User, Phone, TrendingUp } from "lucide-react"

// ─── DADOS MOCK ────────────────────────────────────────────────
const CLIENTS = [
  { id: 1,  name: "Carlos Silva",     phone: "(11) 98765-4321", lastVisit: 3,  interval: 25, visits: 12, spent: 720,  barber: "Henrique" },
  { id: 2,  name: "Rafael Souza",     phone: "(11) 97654-3210", lastVisit: 15, interval: 25, visits: 8,  spent: 480,  barber: "Igor"     },
  { id: 3,  name: "Pedro Alves",      phone: "(11) 96543-2109", lastVisit: 28, interval: 25, visits: 5,  spent: 300,  barber: "Henrique" },
  { id: 4,  name: "Lucas Martins",    phone: "(11) 95432-1098", lastVisit: 33, interval: 25, visits: 18, spent: 1080, barber: "Igor"     },
  { id: 5,  name: "Bruno Costa",      phone: "(11) 94321-0987", lastVisit: 7,  interval: 30, visits: 4,  spent: 240,  barber: "Henrique" },
  { id: 6,  name: "André Lima",       phone: "(11) 93210-9876", lastVisit: 1,  interval: 25, visits: 2,  spent: 120,  barber: "Igor"     },
  { id: 7,  name: "Felipe Rocha",     phone: "(11) 92109-8765", lastVisit: 22, interval: 20, visits: 9,  spent: 540,  barber: "Henrique" },
  { id: 8,  name: "Marcos Santos",    phone: "(11) 91098-7654", lastVisit: 11, interval: 25, visits: 6,  spent: 360,  barber: "Igor"     },
  { id: 9,  name: "Rodrigo Ferreira", phone: "(11) 90987-6543", lastVisit: 40, interval: 25, visits: 3,  spent: 180,  barber: "Henrique" },
  { id: 10, name: "Gabriel Nunes",    phone: "(11) 89876-5432", lastVisit: 5,  interval: 25, visits: 1,  spent: 60,   barber: "Igor"     },
]

// ─── UTILS ─────────────────────────────────────────────────────
const getStatus = c => {
  if (c.lastVisit > c.interval) return "risk"
  if (c.visits <= 2)            return "new"
  return "ok"
}

const STATUS = {
  risk: { label: "Em risco",  bg: "#fef2f2", fg: "#dc2626", dot: "#ef4444"  },
  new:  { label: "Novo",      bg: "#f0fdf4", fg: "#15803d", dot: "#22c55e"  },
  ok:   { label: "Regular",   bg: "transparent", fg: "var(--color-text-tertiary)", dot: "#10b981" },
}

const BRL = v => "R$ " + (+v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })

const initials = name => name.split(" ").map(w => w[0]).slice(0, 2).join("")

const BARBER_COLORS = { Henrique: "#3b82f6", Igor: "#8b5cf6" }

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function ClientsPage() {
  const [filter,   setFilter]   = useState("todos")
  const [search,   setSearch]   = useState("")
  const [selected, setSelected] = useState(null)
  const [sent,     setSent]     = useState(new Set())

  const FILTERS = [
    { id: "todos",  label: "Todos",    count: CLIENTS.length },
    { id: "risk",   label: "Em risco", count: CLIENTS.filter(c => getStatus(c) === "risk").length },
    { id: "new",    label: "Novos",    count: CLIENTS.filter(c => getStatus(c) === "new").length  },
  ]

  const visible = CLIENTS.filter(c => {
    if (filter === "risk" && getStatus(c) !== "risk") return false
    if (filter === "new"  && getStatus(c) !== "new")  return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const riskCount  = CLIENTS.filter(c => getStatus(c) === "risk").length
  const newCount   = CLIENTS.filter(c => getStatus(c) === "new").length
  const totalSpent = CLIENTS.reduce((s, c) => s + c.spent, 0)

  const sendReminder = (clientId) => {
    setSent(prev => new Set([...prev, clientId]))
  }

  return (
    <div style={{ fontFamily: "var(--font-sans,system-ui)", color: "var(--color-text-primary)", maxWidth: 640, margin: "0 auto", paddingBottom: 32 }}>

      {/* Cabeçalho */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em" }}>BarberClick Admin</div>
        <div style={{ fontSize: 18, fontWeight: 500 }}>Clientes</div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "12px 16px" }}>
        {[
          { label: "Total",      val: CLIENTS.length,             color: undefined   },
          { label: "Em risco",   val: riskCount,                  color: "#dc2626"   },
          { label: "Novos",      val: newCount,                   color: "#15803d"   },
          { label: "Faturado",   val: "R$ " + (totalSpent / 1000).toFixed(1) + "k", color: undefined },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: s.color || "var(--color-text-primary)" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 1, textTransform: "uppercase", letterSpacing: ".04em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alerta em risco */}
      {riskCount > 0 && filter !== "risk" && (
        <div onClick={() => setFilter("risk")} style={{ margin: "0 16px 12px", background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#dc2626" }}>{riskCount} cliente(s) em risco de não voltar</div>
            <div style={{ fontSize: 11, color: "#dc2626", opacity: .85 }}>Não retornam além do intervalo configurado — toque para ver</div>
          </div>
        </div>
      )}

      {/* Busca + filtros */}
      <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-tertiary)", pointerEvents: "none" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome…" style={{ width: "100%", boxSizing: "border-box", paddingLeft: 32 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: "6px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              border: filter === f.id ? "none" : "0.5px solid var(--color-border-tertiary)",
              background: filter === f.id ? "var(--color-text-primary)" : "transparent",
              color: filter === f.id ? "var(--color-background-primary)" : "var(--color-text-secondary)",
              fontWeight: filter === f.id ? 500 : 400,
            }}>
              {f.label} <span style={{ opacity: .7 }}>({f.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de clientes */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, overflow: "hidden" }}>
          {visible.length === 0 && (
            <div style={{ padding: "28px", textAlign: "center", color: "var(--color-text-tertiary)", fontSize: 13 }}>
              Nenhum cliente encontrado
            </div>
          )}
          {visible.map((c, i) => {
            const st  = getStatus(c)
            const cfg = STATUS[st]
            const isOpen = selected?.id === c.id
            const wasSent = sent.has(c.id)
            return (
              <div key={c.id}>
                {/* Row */}
                <div onClick={() => setSelected(isOpen ? null : c)} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                  borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer",
                  background: isOpen ? "var(--color-background-secondary)" : "transparent",
                }}>
                  {/* Avatar */}
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                    {initials(c.name)}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={11} />
                      {c.lastVisit === 0 ? "Hoje" : `Há ${c.lastVisit} dia${c.lastVisit !== 1 ? "s" : ""}`}
                      {st === "risk" && <AlertCircle size={11} color="#dc2626" />}
                      {wasSent && <span style={{ color: "#10b981", fontSize: 10, fontWeight: 500 }}>✓ Lembrete enviado</span>}
                    </div>
                  </div>
                  {/* Badge + seta */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {st !== "ok" && (
                      <div style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: cfg.bg, color: cfg.fg, fontWeight: 500, whiteSpace: "nowrap" }}>
                        {cfg.label}
                      </div>
                    )}
                    <ChevronRight size={14} style={{ color: "var(--color-text-tertiary)", transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .15s" }} />
                  </div>
                </div>

                {/* Detalhes expandidos */}
                {isOpen && (
                  <div style={{ padding: "14px 14px 16px", borderBottom: "0.5px solid var(--color-border-tertiary)", background: "var(--color-background-secondary)" }}>

                    {/* Métricas do cliente */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                      {[
                        { Icon: User,       label: "Visitas",     val: c.visits                                      },
                        { Icon: TrendingUp, label: "Total gasto", val: BRL(c.spent)                                   },
                        { Icon: Phone,      label: "WhatsApp",    val: c.phone, small: true                           },
                      ].map(m => (
                        <div key={m.label} style={{ background: "var(--color-background-primary)", borderRadius: 8, padding: "10px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                            <m.Icon size={11} style={{ color: "var(--color-text-tertiary)" }} />
                            <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em" }}>{m.label}</span>
                          </div>
                          <div style={{ fontSize: m.small ? 11 : 14, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Info extra */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 12, fontSize: 12, color: "var(--color-text-secondary)" }}>
                      <span>Barbeiro preferido:</span>
                      <span style={{ fontWeight: 500, color: BARBER_COLORS[c.barber] || "var(--color-text-primary)" }}>{c.barber}</span>
                      <span style={{ marginLeft: "auto" }}>Intervalo: {c.interval} dias</span>
                    </div>

                    {/* Alerta de risco */}
                    {getStatus(c) === "risk" && (
                      <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderRadius: 8, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: "#dc2626", lineHeight: 1.5 }}>
                        <strong>Risco de churn:</strong> {c.lastVisit - c.interval} dia(s) além do intervalo. Envie um lembrete para recuperar este cliente.
                      </div>
                    )}

                    {/* Botão de lembrete */}
                    <button onClick={() => sendReminder(c.id)} disabled={sent.has(c.id)} style={{
                      width: "100%", padding: "11px", borderRadius: 9, border: "none",
                      cursor: sent.has(c.id) ? "not-allowed" : "pointer",
                      background: sent.has(c.id) ? "#d1fae5" : "var(--color-text-primary)",
                      color: sent.has(c.id) ? "#065f46" : "var(--color-background-primary)",
                      fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}>
                      {sent.has(c.id)
                        ? <><Check size={14} /> Lembrete enviado via WhatsApp</>
                        : <><Send size={14} /> Enviar lembrete agora</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
