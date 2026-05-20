import { cn } from "@/lib/utils"
import type { ClienteEstado, ComprobanteEstado } from "@/lib/types"

const clienteEstadoConfig: Record<ClienteEstado, { label: string; className: string }> = {
  activo:   { label: "Activo",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  inactivo: { label: "Inactivo", className: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400" },
  moroso:   { label: "Moroso",   className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
}

const comprobanteEstadoConfig: Record<ComprobanteEstado, { label: string; className: string }> = {
  pendiente:   { label: "Pendiente",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  pagado:      { label: "Pagado",       className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  vencido:     { label: "Vencido",      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  rechazado:   { label: "Rechazado",    className: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400" },
  en_revision: { label: "En revisión",  className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400" },
}

export function ClienteEstadoBadge({ estado }: { estado: ClienteEstado }) {
  const config = clienteEstadoConfig[estado]
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}

export function ComprobanteEstadoBadge({ estado }: { estado: ComprobanteEstado }) {
  const config = comprobanteEstadoConfig[estado]
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}
