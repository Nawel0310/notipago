import type { ClienteEstado, ComprobanteEstado } from "@/lib/types"

type BadgeStyle = { label: string; style: React.CSSProperties }

const clienteEstadoConfig: Record<ClienteEstado, BadgeStyle> = {
  activo:   {
    label: "Activo",
    style: { background: "var(--status-paid-bg)", color: "var(--status-paid-text)", borderColor: "var(--status-paid-border)" },
  },
  inactivo: {
    label: "Inactivo",
    style: { background: "var(--status-rejected-bg)", color: "var(--status-rejected-text)", borderColor: "var(--status-rejected-border)" },
  },
  moroso: {
    label: "Moroso",
    style: { background: "var(--status-overdue-bg)", color: "var(--status-overdue-text)", borderColor: "var(--status-overdue-border)" },
  },
}

const comprobanteEstadoConfig: Record<ComprobanteEstado, BadgeStyle> = {
  pendiente: {
    label: "Pendiente",
    style: { background: "var(--status-pending-bg)", color: "var(--status-pending-text)", borderColor: "var(--status-pending-border)" },
  },
  pagado: {
    label: "Pagado",
    style: { background: "var(--status-paid-bg)", color: "var(--status-paid-text)", borderColor: "var(--status-paid-border)" },
  },
  vencido: {
    label: "Vencido",
    style: { background: "var(--status-overdue-bg)", color: "var(--status-overdue-text)", borderColor: "var(--status-overdue-border)" },
  },
  rechazado: {
    label: "Rechazado",
    style: { background: "var(--status-rejected-bg)", color: "var(--status-rejected-text)", borderColor: "var(--status-rejected-border)" },
  },
  en_revision: {
    label: "En revisión",
    style: { background: "var(--status-review-bg)", color: "var(--status-review-text)", borderColor: "var(--status-review-border)" },
  },
}

const badgeBase = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"

export function ClienteEstadoBadge({ estado }: { estado: ClienteEstado }) {
  const { label, style } = clienteEstadoConfig[estado]
  return <span className={badgeBase} style={style}>{label}</span>
}

export function ComprobanteEstadoBadge({ estado }: { estado: ComprobanteEstado }) {
  const { label, style } = comprobanteEstadoConfig[estado]
  return <span className={badgeBase} style={style}>{label}</span>
}
