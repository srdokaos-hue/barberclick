export const PLAN_ORDER: Record<string,number> = { STARTER:0, PRO:1, ELITE:2 }

export function hasFeature(plan: string, required: string): boolean {
  return (PLAN_ORDER[plan]??0) >= (PLAN_ORDER[required]??0)
}

export const FEATURES: Record<string,{plan:"STARTER"|"PRO"|"ELITE";label:string;description:string}> = {
  relatorios:     { plan:"PRO",   label:"Relatórios avançados",            description:"DRE completo, gráficos de performance e relatório por barbeiro." },
  lembretes:      { plan:"PRO",   label:"Lembretes automáticos WhatsApp",  description:"Mensagens automáticas para clientes que não retornam no intervalo configurado." },
  order_bump:     { plan:"PRO",   label:"Order Bump no checkout",          description:"Ofereça produtos com desconto durante o agendamento e aumente o ticket médio." },
  portal_cliente: { plan:"PRO",   label:"Portal do cliente",               description:"Área exclusiva para o cliente ver histórico e reagendar sem ligar." },
  exportar:       { plan:"ELITE", label:"Exportar dados",                  description:"Exporte relatórios em Excel/PDF para análise ou contabilidade." },
  multi_unidade:  { plan:"ELITE", label:"Múltiplas unidades",              description:"Gerencie várias barbearias com um único login e painel centralizado." },
}
