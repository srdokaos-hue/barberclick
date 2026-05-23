"use client"
import { useState } from "react"
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle, TrendingUp, DollarSign, Users, Package, Clock, ChevronDown, CheckCircle } from "lucide-react"
import { useShopInfo } from "@/lib/useShopInfo"
// dentro do componente:
const { name: shopName } = useShopInfo()

// ─── DADOS MOCK (determinísticos) ─────────────────────────────
const rng = (seed, lo, hi) => lo + ((seed * 16807 + 1) % 2147483647) % (hi - lo)
const DAILY = Array.from({ length: 30 }, (_, i) => {
  const weekend = (19 + i) % 7 === 0
  const r = rng(i * 3 + 1, weekend ? 380 : 240, weekend ? 620 : 460)
  const c = rng(i * 3 + 2, Math.round(r * 0.16), Math.round(r * 0.26))
  return { dia: String(i + 1).padStart(2, "0"), receita: r, custo: c, lucro: r - c }
})

const GROSS  = DAILY.reduce((s, d) => s + d.receita, 0)
const COST   = DAILY.reduce((s, d) => s + d.custo,   0)
const PROFIT = GROSS - COST

const BARBERS = [
  { name: "Henrique", init: "H", color: "#3b82f6", pct: 70, appts: 28, rev: 4760, com: 3332 },
  { name: "Igor",     init: "I", color: "#8b5cf6", pct: 50, appts: 19, rev: 3230, com: 1615 },
]

const APPTS = [
  { client: "Carlos Silva",   svc: "Corte + Barba",   barber: "Henrique", time: "09:00", val: 60, st: "done"      },
  { client: "Rafael Souza",   svc: "Corte Navalhado",  barber: "Igor",     time: "09:30", val: 50, st: "done"      },
  { client: "Pedro Alves",    svc: "Barba",            barber: "Henrique", time: "10:00", val: 30, st: "confirmed" },
  { client: "Lucas Martins",  svc: "Corte + Barba",    barber: "Igor",     time: "10:30", val: 60, st: "pending"   },
  { client: "Bruno Costa",    svc: "Hidratação",       barber: "Henrique", time: "11:00", val: 45, st: "confirmed" },
  { client: "André Lima",     svc: "Corte Masculino",  barber: "Igor",     time: "14:00", val: 40, st: "pending"   },
]

const PRODS = [
  { name: "Pomada Matte Loja",       qty: 2,  min: 3, sale: 45, cost: 18 },
  { name: "Óleo de Barba Premium",   qty: 1,  min: 3, sale: 65, cost: 28 },
  { name: "Shampoo Antiqueda",       qty: 3,  min: 5, sale: 55, cost: 22 },
  { name: "Condicionador Hidr.",     qty: 8,  min: 3, sale: 48, cost: 19 },
  { name: "Cera Modeladora",         qty: 12, min: 4, sale: 38, cost: 14 },
]

// ─── UTILS ────────────────────────────────────────────────────
const BRL = v => "R$\u00a0" + (+v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const STATUS = {
  done:      { label: "Concluído",  bg: "#d1fae5", fg: "#065f46" },
  confirmed: { label: "Confirmado", bg: "#dbeafe", fg: "#1e3a8a" },
  pending:   { label: "Pendente",   bg: "#fef9c3", fg: "#713f12" },
}

// ─── COMPONENTES BASE ─────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 12, ...style }}>
    {children}
  </div>
)

const Metric = ({ Icon, label, val, sub, accent }) => (
  <div style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
      {Icon && <Icon size={13} style={{ color: "var(--color-text-tertiary)" }} />}
      <span style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</span>
    </div>
    <div style={{ fontSize: 20, fontWeight: 500, color: accent || "var(--color-text-primary)", lineHeight: 1.2 }}>{val}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{sub}</div>}
  </div>
)

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ fontWeight: 500, marginBottom: 4, color: "var(--color-text-primary)" }}>Dia {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 14 }}>
          <span>{p.name}</span><span style={{ fontWeight: 500 }}>{BRL(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── ABAS ─────────────────────────────────────────────────────
const TABS = [
  { id: "visao",    label: "Visão geral"    },
  { id: "profiss",  label: "Profissionais"  },
  { id: "estoque",  label: "Estoque"        },
  { id: "agenda",   label: "Agenda"         },
]

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────
export default function Dashboard() {
  const [tab, setTab] = useState("visao")
  const appts  = BARBERS.reduce((s, b) => s + b.appts, 0)
  const lowStk = PRODS.filter(p => p.qty <= p.min)

  return (
    <div style={{ fontFamily: "var(--font-sans,system-ui)", color: "var(--color-text-primary)", maxWidth: 640, margin: "0 auto", paddingBottom: 24 }}>

      {/* Cabeçalho */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".06em" }}>{shopName}</div>
          <div style={{ fontSize: 19, fontWeight: 500 }}>Dashboard</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "6px 10px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            Mai 2026 <ChevronDown size={12} />
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--color-background-info)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500, color: "var(--color-text-info)", cursor: "pointer" }}>
            ES
          </div>
        </div>
      </div>

      {/* Navegação de abas */}
      <div style={{ display: "flex", borderBottom: "0.5px solid var(--color-border-tertiary)", margin: "12px 0 0", padding: "0 16px", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 12px", border: "none", background: "transparent",
            color: tab === t.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
            fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
            borderBottom: tab === t.id ? "2px solid var(--color-text-primary)" : "2px solid transparent",
            fontWeight: tab === t.id ? 500 : 400,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* ══ VISÃO GERAL ══════════════════════════════════════ */}
        {tab === "visao" && <>

          {lowStk.length > 0 && (
            <div onClick={() => setTab("estoque")} style={{ background: "var(--color-background-warning)", border: "0.5px solid var(--color-border-warning)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <AlertTriangle size={18} style={{ color: "var(--color-text-warning)", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-warning)" }}>{lowStk.length} produto(s) com estoque crítico</div>
                <div style={{ fontSize: 11, color: "var(--color-text-warning)", opacity: .85 }}>{lowStk.map(p => p.name).join(" · ")} — toque para ver</div>
              </div>
            </div>
          )}

          {/* Métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Metric Icon={DollarSign} label="Faturamento bruto" val={BRL(GROSS)}  sub="este mês" />
            <Metric Icon={Package}    label="Custos totais"     val={BRL(COST)}   sub="produtos + comissões" />
            <Metric Icon={TrendingUp} label="Lucro líquido"     val={BRL(PROFIT)} sub={`Margem ${((PROFIT / GROSS) * 100).toFixed(1)}%`} accent="var(--color-text-success)" />
            <Metric Icon={Users}      label="Atendimentos"      val={appts}       sub={`Ticket médio ${BRL(Math.round(GROSS / appts))}`} />
          </div>

          {/* Gráfico de área */}
          <Card style={{ padding: "14px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Receita vs lucro — Maio 2026</div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={DAILY} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={.28} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gL" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={38} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="receita" name="Receita" stroke="#3b82f6" fill="url(#gR)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="lucro"   name="Lucro"   stroke="#10b981" fill="url(#gL)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, paddingLeft: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#3b82f6" }}>
                <span style={{ width: 14, height: 2, background: "#3b82f6", display: "inline-block", borderRadius: 2 }} /> Receita
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#10b981" }}>
                <span style={{ width: 14, height: 2, background: "#10b981", display: "inline-block", borderRadius: 2 }} /> Lucro
              </span>
            </div>
          </Card>

          {/* Profissionais resumo */}
          <Card style={{ padding: "14px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Profissionais — resumo do mês</div>
            {BARBERS.map(b => (
              <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: b.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 500, color: b.color, flexShrink: 0 }}>{b.init}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{b.appts} atendimentos · {b.pct}% comissão</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{BRL(b.rev)}</div>
                  <div style={{ fontSize: 11, color: "#ef4444" }}>−{BRL(b.com)}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, fontSize: 12, color: "var(--color-text-secondary)" }}>
              <span>Total comissões a pagar</span>
              <span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{BRL(BARBERS.reduce((s, b) => s + b.com, 0))}</span>
            </div>
          </Card>

          {/* Atendimentos de hoje */}
          <Card style={{ padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Atendimentos de hoje</div>
              <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Seg, 19 mai</div>
            </div>
            {APPTS.map((a, i) => {
              const st = STATUS[a.st]
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < APPTS.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)", fontFamily: "monospace", minWidth: 38 }}>{a.time}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.client}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{a.svc} · {a.barber}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{BRL(a.val)}</div>
                    <div style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: st.bg, color: st.fg, fontWeight: 500, display: "inline-block", marginTop: 2 }}>{st.label}</div>
                  </div>
                </div>
              )
            })}
          </Card>
        </>}

        {/* ══ PROFISSIONAIS ════════════════════════════════════ */}
        {tab === "profiss" && <>
          <Card style={{ padding: "14px" }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Faturamento por profissional — Mai</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={BARBERS} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(1)}k`} width={54} />
                <Tooltip formatter={(v, n) => [BRL(v), n]} />
                <Bar dataKey="rev" name="Faturado"  fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="com" name="Comissão"  fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          {BARBERS.map(b => (
            <Card key={b.name} style={{ padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: b.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 500, color: b.color }}>{b.init}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Comissão {b.pct}% sobre o faturado</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { l: "Atendimentos",  v: b.appts },
                  { l: "Faturado",      v: BRL(b.rev) },
                  { l: "A receber",     v: BRL(b.com), accent: "var(--color-text-success)" },
                ].map(m => (
                  <div key={m.l} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: "10px" }}>
                    <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em" }}>{m.l}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2, color: m.accent || "var(--color-text-primary)" }}>{m.v}</div>
                  </div>
                ))}
              </div>
              {/* Barra de progresso da comissão */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-tertiary)", marginBottom: 4 }}>
                  <span>Barbearia</span><span>Barbeiro</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "var(--color-background-secondary)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${100 - b.pct}%`, background: b.color, borderRadius: 3 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 4 }}>
                  <span style={{ color: b.color, fontWeight: 500 }}>{BRL(b.rev - b.com)} ({100 - b.pct}%)</span>
                  <span style={{ color: "#8b5cf6", fontWeight: 500 }}>{BRL(b.com)} ({b.pct}%)</span>
                </div>
              </div>
            </Card>
          ))}
        </>}

        {/* ══ ESTOQUE ══════════════════════════════════════════ */}
        {tab === "estoque" && <>
          {PRODS.filter(p => p.qty <= p.min).map((p, i) => (
            <div key={i} style={{ background: "var(--color-background-danger)", border: "0.5px solid var(--color-border-danger)", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-danger)", display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertTriangle size={14} /> {p.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-danger)", opacity: .85, marginTop: 2 }}>
                  Restam {p.qty} un. — mínimo configurado: {p.min}
                </div>
              </div>
              <button style={{ fontSize: 11, padding: "4px 10px", border: "0.5px solid var(--color-border-danger)", borderRadius: 6, background: "transparent", color: "var(--color-text-danger)", cursor: "pointer" }}>Repor</button>
            </div>
          ))}

          <Card style={{ padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Todos os produtos</div>
              <button style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>+ Novo</button>
            </div>
            {PRODS.map((p, i) => {
              const low = p.qty <= p.min
              const margin = Math.round((p.sale - p.cost) / p.sale * 100)
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < PRODS.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: low ? "#ef4444" : "#10b981", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
                      Venda {BRL(p.sale)} · Custo {BRL(p.cost)} · Margem {margin}%
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: low ? "#ef4444" : "var(--color-text-primary)" }}>{p.qty} un.</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>mín {p.min}</div>
                  </div>
                </div>
              )
            })}
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Metric label="Produtos"   val={PRODS.length} />
            <Metric label="Em alerta"  val={PRODS.filter(p => p.qty <= p.min).length} accent="#ef4444" />
            <Metric label="Val. estoque" val={"R$ " + PRODS.reduce((s, p) => s + p.sale * p.qty, 0).toLocaleString("pt-BR")} />
          </div>
        </>}

        {/* ══ AGENDA ═══════════════════════════════════════════ */}
        {tab === "agenda" && (
          <Card style={{ padding: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>Seg, 19 mai 2026</div>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ fontSize: 12, padding: "4px 10px" }}>‹ Ant</button>
                <button style={{ fontSize: 12, padding: "4px 10px" }}>Próx ›</button>
              </div>
            </div>
            {["08:00","09:00","09:30","10:00","10:30","11:00","12:00","13:00","14:00","14:30","15:00","16:00","17:00"].map(t => {
              const a = APPTS.find(x => x.time === t)
              return (
                <div key={t} style={{ display: "flex", gap: 10, minHeight: 46, borderBottom: "0.5px solid var(--color-border-tertiary)", alignItems: "stretch" }}>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", fontFamily: "monospace", minWidth: 40, paddingTop: 12 }}>{t}</div>
                  {a ? (
                    <div style={{ flex: 1, margin: "4px 0", background: "var(--color-background-info)", borderRadius: 6, padding: "6px 10px", borderLeft: "3px solid var(--color-border-info)", cursor: "pointer" }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-info)" }}>{a.client}</div>
                      <div style={{ fontSize: 11, color: "var(--color-text-info)", opacity: .8 }}>{a.svc} · {a.barber} · {BRL(a.val)}</div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, fontSize: 11, color: "var(--color-text-tertiary)", display: "flex", alignItems: "center", paddingLeft: 4, cursor: "pointer", opacity: .5 }}>
                      — disponível
                    </div>
                  )}
                </div>
              )
            })}
          </Card>
        )}

      </div>
    </div>
  )
}
