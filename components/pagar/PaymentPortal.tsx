"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { FileText, Upload, CreditCard, CheckCircle, X } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ComprobanteEstadoBadge } from "@/components/shared/StatusBadge"
import type { Comprobante, Cliente } from "@/lib/types"

interface PaymentPortalProps {
  cliente: Cliente
  comprobantes: Comprobante[]
  onMarkEnRevision: (id: string) => void
}

export default function PaymentPortal({ cliente, comprobantes, onMarkEnRevision }: PaymentPortalProps) {
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [uploadedIds, setUploadedIds] = useState<Set<string>>(new Set())
  const [mpModal, setMpModal] = useState<{ open: boolean; comp: Comprobante | null }>({ open: false, comp: null })
  const inputRef = useRef<HTMLInputElement>(null)

  const pendientes = comprobantes.filter((c) => c.estado === "pendiente" || c.estado === "vencido")

  function handleUpload(compId: string, file: File) {
    if (!file) return
    setUploadingId(compId)
    setTimeout(() => {
      onMarkEnRevision(compId)
      setUploadedIds((prev) => new Set([...prev, compId]))
      setUploadingId(null)
      toast.success("Comprobante de pago enviado. Verificaremos tu pago a la brevedad.")
    }, 1500)
  }

  function handleMpPay(comp: Comprobante) {
    setMpModal({ open: true, comp })
  }

  const fakeOrderId = "MP-" + Math.random().toString(36).slice(2, 10).toUpperCase()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-lg">NOTIPAGO</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Portal de Pagos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Hola, {cliente.razonSocial} 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {pendientes.length > 0
              ? `Tenés ${pendientes.length} comprobante${pendientes.length !== 1 ? "s" : ""} pendiente${pendientes.length !== 1 ? "s" : ""} de pago.`
              : "No tenés comprobantes pendientes. ¡Todo al día!"}
          </p>
        </div>

        {pendientes.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">¡Todo en orden!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">No tenés comprobantes pendientes de pago en este momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendientes.map((comp) => {
              const uploaded = uploadedIds.has(comp.id)
              const uploading = uploadingId === comp.id

              return (
                <div key={comp.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  {/* Comprobante info */}
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-mono text-slate-400 dark:text-slate-500">{comp.numero}</p>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <p className="text-xs text-slate-400 dark:text-slate-500">{comp.tipo}</p>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white">{comp.descripcion}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Vencimiento: {formatDate(comp.fechaVencimiento)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(comp.monto)}</p>
                        <ComprobanteEstadoBadge estado={uploaded ? "en_revision" : comp.estado} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {uploaded ? (
                    <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                        Comprobante de pago enviado. En revisión.
                      </p>
                    </div>
                  ) : (
                    <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Opción A</p>
                        <button
                          onClick={() => {
                            const inp = document.createElement("input")
                            inp.type = "file"
                            inp.accept = "image/*,.pdf"
                            inp.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0]
                              if (file) handleUpload(comp.id, file)
                            }
                            inp.click()
                          }}
                          disabled={uploading}
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 text-sm font-medium hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4" />
                          {uploading ? "Enviando..." : "Cargar comprobante de pago"}
                        </button>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">Aceptamos PDF, JPG o PNG</p>
                      </div>

                      {/* MercadoPago */}
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Opción B</p>
                        <button
                          onClick={() => handleMpPay(comp)}
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#009ee3] hover:bg-[#0082ba] text-white text-sm font-semibold transition-colors cursor-pointer"
                        >
                          <CreditCard className="w-4 h-4" />
                          Pagar con MercadoPago
                        </button>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-center">Tarjeta, débito o efectivo</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
          ¿Tenés alguna duda? Contactate con nosotros · Sistema demo NOTIPAGO
        </p>
      </main>

      {/* MercadoPago mock modal */}
      {mpModal.open && mpModal.comp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60" onClick={() => setMpModal({ open: false, comp: null })} aria-hidden="true" />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <button onClick={() => setMpModal({ open: false, comp: null })} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg cursor-pointer" aria-label="Cerrar">
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#009ee3] flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-white" />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Redirigiendo a MercadoPago...</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              En un sistema real serías redirigido a MercadoPago para completar el pago.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-xl mb-4 text-left">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Detalle del pago</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{mpModal.comp.descripcion}</p>
              <p className="text-xl font-bold text-[#009ee3] mt-1">{formatCurrency(mpModal.comp.monto)}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ID de orden demo: {fakeOrderId}</p>
            </div>

            <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-4">
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">🔔 Demo — No se realizará ningún cobro real</p>
            </div>

            <button
              onClick={() => {
                toast.success("Pago procesado con MercadoPago (demo)")
                setMpModal({ open: false, comp: null })
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#009ee3] hover:bg-[#0082ba] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Simular pago completado
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
