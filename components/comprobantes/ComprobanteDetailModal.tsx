"use client"

import { X, FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ComprobanteEstadoBadge } from "@/components/shared/StatusBadge"
import type { Comprobante } from "@/lib/types"

const metodoPagoLabel: Record<string, string> = {
  transferencia: "Transferencia bancaria",
  mercadopago: "MercadoPago",
  efectivo: "Efectivo",
  cheque: "Cheque",
}

export default function ComprobanteDetailModal({
  comprobante,
  onClose,
}: {
  comprobante: Comprobante | null
  onClose: () => void
}) {
  if (!comprobante) return null

  const rows: [string, React.ReactNode][] = [
    ["Número", comprobante.numero],
    ["Tipo", comprobante.tipo],
    ["Cliente", comprobante.clienteNombre],
    ["Fecha de emisión", formatDate(comprobante.fechaEmision)],
    ["Fecha de vencimiento", formatDate(comprobante.fechaVencimiento)],
    ["Monto", `${formatCurrency(comprobante.monto)} ${comprobante.moneda}`],
    ["Estado", <ComprobanteEstadoBadge key="s" estado={comprobante.estado} />],
    ["Descripción", comprobante.descripcion],
  ]
  if (comprobante.metodoPago) rows.push(["Método de pago", metodoPagoLabel[comprobante.metodoPago] ?? comprobante.metodoPago])
  if (comprobante.notasInternas) rows.push(["Notas internas", comprobante.notasInternas])
  if (comprobante.envioNotificacion && comprobante.fechaUltimaNotificacion) {
    rows.push(["Última notificación", formatDate(comprobante.fechaUltimaNotificacion)])
  }
  rows.push(["Creado el", formatDate(comprobante.creadoEn)])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-slate-900 dark:text-white">Detalle del comprobante</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label as string} className="flex gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400 w-44 shrink-0">{label}</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
            </div>
          ))}
          {comprobante.comprobantePagoUrl && (
            <div className="flex gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400 w-44 shrink-0">Comprobante de pago</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Archivo adjunto (demo)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
