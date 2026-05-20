"use client"

import { Users, FileText, AlertCircle, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useApp } from "@/context/AppContext"

export default function SummaryCards() {
  const { state } = useApp()
  const { clientes, comprobantes } = state

  const clientesActivos = clientes.filter((c) => c.estado === "activo").length
  const pendientes = comprobantes.filter((c) => c.estado === "pendiente").length
  const vencidos = comprobantes.filter((c) => c.estado === "vencido").length
  const montoPendiente = comprobantes
    .filter((c) => c.estado === "pendiente" || c.estado === "vencido")
    .reduce((sum, c) => sum + c.monto, 0)

  const cards = [
    {
      label: "Clientes activos",
      value: clientesActivos,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Comprobantes pendientes",
      value: pendientes,
      icon: FileText,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Comprobantes vencidos",
      value: vencidos,
      icon: AlertCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      label: "Monto total pendiente",
      value: formatCurrency(montoPendiente),
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
