"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { formatCurrency, formatDate, formatCUIT } from "@/lib/utils"
import { ClienteEstadoBadge, ComprobanteEstadoBadge } from "@/components/shared/StatusBadge"

export default function RecentTables() {
  const { state } = useApp()

  const recentClientes = [...state.clientes]
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
    .slice(0, 5)

  const recentComprobantes = [...state.comprobantes]
    .sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      {/* Últimos clientes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Últimos clientes</h2>
          <Link href="/clientes" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentClientes.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.razonSocial}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{formatCUIT(c.cuit)}</p>
              </div>
              <div className="text-right shrink-0">
                <ClienteEstadoBadge estado={c.estado} />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(c.creadoEn)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Últimos comprobantes */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Últimos comprobantes</h2>
          <Link href="/comprobantes" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
            Ver todos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {recentComprobantes.map((cp) => (
            <div key={cp.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{cp.numero}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{cp.clienteNombre}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(cp.monto)}</p>
                <ComprobanteEstadoBadge estado={cp.estado} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
