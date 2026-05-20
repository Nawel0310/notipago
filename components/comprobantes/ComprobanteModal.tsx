"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { comprobanteSchema, type ComprobanteFormData } from "@/lib/schemas"
import { useApp } from "@/context/AppContext"
import type { Comprobante } from "@/lib/types"

const TIPOS = ["Factura A", "Factura B", "Factura C", "Nota de Débito", "Nota de Crédito", "Recibo"] as const
const ESTADOS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "pagado", label: "Pagado" },
  { value: "vencido", label: "Vencido" },
  { value: "rechazado", label: "Rechazado" },
  { value: "en_revision", label: "En revisión" },
]
const METODOS = [
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "mercadopago", label: "MercadoPago" },
  { value: "efectivo", label: "Efectivo" },
  { value: "cheque", label: "Cheque" },
]

interface ComprobanteModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ComprobanteFormData) => void
  initialData?: Comprobante | null
}

export default function ComprobanteModal({ open, onClose, onSubmit, initialData }: ComprobanteModalProps) {
  const { state } = useApp()
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<ComprobanteFormData>({
    resolver: zodResolver(comprobanteSchema),
  })

  const estadoValue = watch("estado")

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          numero: initialData.numero,
          tipo: initialData.tipo,
          clienteId: initialData.clienteId,
          fechaEmision: initialData.fechaEmision,
          fechaVencimiento: initialData.fechaVencimiento,
          monto: initialData.monto,
          moneda: initialData.moneda,
          estado: initialData.estado,
          descripcion: initialData.descripcion,
          metodoPago: initialData.metodoPago,
          notasInternas: initialData.notasInternas,
        })
      } else {
        const today = new Date().toISOString().split("T")[0]
        reset({ estado: "pendiente", moneda: "ARS", fechaEmision: today })
      }
    }
  }, [open, initialData, reset])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    if (open) window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, onClose])

  if (!open) return null

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
  const errorClass = "mt-1 text-xs text-red-500"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-labelledby="comp-modal-title" className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 id="comp-modal-title" className="font-semibold text-slate-900 dark:text-white">
            {initialData ? "Editar comprobante" : "Agregar comprobante"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Número *</label>
              <input {...register("numero")} placeholder="FC-0001-00000001" className={inputClass} />
              {errors.numero && <p className={errorClass}>{errors.numero.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo *</label>
              <select {...register("tipo")} className={inputClass}>
                <option value="">Seleccioná...</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tipo && <p className={errorClass}>{errors.tipo.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cliente *</label>
              <select {...register("clienteId")} className={inputClass}>
                <option value="">Seleccioná un cliente...</option>
                {state.clientes.map((c) => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
              </select>
              {errors.clienteId && <p className={errorClass}>{errors.clienteId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha de emisión *</label>
              <input {...register("fechaEmision")} type="date" className={inputClass} />
              {errors.fechaEmision && <p className={errorClass}>{errors.fechaEmision.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fecha de vencimiento *</label>
              <input {...register("fechaVencimiento")} type="date" className={inputClass} />
              {errors.fechaVencimiento && <p className={errorClass}>{errors.fechaVencimiento.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monto *</label>
              <input {...register("monto")} type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
              {errors.monto && <p className={errorClass}>{errors.monto.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Moneda</label>
              <select {...register("moneda")} className={inputClass}>
                <option value="ARS">ARS — Pesos argentinos</option>
                <option value="USD">USD — Dólares</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Estado *</label>
              <select {...register("estado")} className={inputClass}>
                {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
              {errors.estado && <p className={errorClass}>{errors.estado.message}</p>}
            </div>

            {(estadoValue === "pagado") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Método de pago</label>
                <select {...register("metodoPago")} className={inputClass}>
                  <option value="">Sin especificar</option>
                  {METODOS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descripción *</label>
              <textarea {...register("descripcion")} rows={2} placeholder="Descripción del comprobante..." className={inputClass} />
              {errors.descripcion && <p className={errorClass}>{errors.descripcion.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notas internas</label>
              <textarea {...register("notasInternas")} rows={2} placeholder="Notas solo visibles para el equipo..." className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer">
              {initialData ? "Guardar cambios" : "Agregar comprobante"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
