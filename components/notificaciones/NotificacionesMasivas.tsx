"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import { Send, Bell, Clock, Users } from "lucide-react"
import { useApp } from "@/context/AppContext"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ComprobanteEstadoBadge } from "@/components/shared/StatusBadge"
import type { NotificacionCanal } from "@/lib/types"

const DEFAULT_TEMPLATE = `Hola {nombre_cliente} 👋

Te recordamos que tenés el comprobante {numero_comprobante} pendiente de pago.

💰 Monto: {monto}
📅 Vencimiento: {fecha_vencimiento}
🔗 Pagar ahora: {link_pago}

Ante cualquier consulta, no dudes en contactarnos.

¡Gracias!`

const canalLabels: Record<NotificacionCanal, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
  ambos: "Email + WhatsApp",
}

export default function NotificacionesMasivas() {
  const { state, dispatch } = useApp()
  const [filterEstado, setFilterEstado] = useState<"pendiente" | "vencido" | "">("")
  const [filterCliente, setFilterCliente] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [canal, setCanal] = useState<NotificacionCanal>("whatsapp")
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [previewOpen, setPreviewOpen] = useState(false)

  const comprobantes = useMemo(() => {
    let list = state.comprobantes.filter((c) => c.estado === "pendiente" || c.estado === "vencido")
    if (filterEstado) list = list.filter((c) => c.estado === filterEstado)
    if (filterCliente) list = list.filter((c) => c.clienteId === filterCliente)
    if (dateFrom) list = list.filter((c) => c.fechaVencimiento >= dateFrom)
    if (dateTo) list = list.filter((c) => c.fechaVencimiento <= dateTo)
    return list
  }, [state.comprobantes, filterEstado, filterCliente, dateFrom, dateTo])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next
    })
  }

  function toggleAll() {
    if (comprobantes.every((c) => selected.has(c.id))) {
      setSelected(new Set())
    } else {
      setSelected(new Set(comprobantes.map((c) => c.id)))
    }
  }

  function handleSend() {
    if (selected.size === 0) { toast.error("Seleccioná al menos un comprobante"); return }
    dispatch({ type: "BULK_NOTIFY", ids: Array.from(selected), canal })
    toast.success(`${selected.size} notificaciones enviadas por ${canalLabels[canal]}`)
    setSelected(new Set())
  }

  function previewMessage(comp: typeof comprobantes[0]) {
    const cliente = state.clientes.find((c) => c.id === comp.clienteId)
    return template
      .replace("{nombre_cliente}", cliente?.razonSocial ?? comp.clienteNombre)
      .replace("{numero_comprobante}", comp.numero)
      .replace("{monto}", formatCurrency(comp.monto))
      .replace("{fecha_vencimiento}", formatDate(comp.fechaVencimiento))
      .replace("{link_pago}", `https://notipago.demo/pagar/demo-token`)
  }

  const allSelected = comprobantes.length > 0 && comprobantes.every((c) => selected.has(c.id))
  const sampleComp = comprobantes[0]

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Filtrar comprobantes</h3>
        <div className="grid grid-cols-2 gap-3 md:flex md:flex-wrap md:gap-3">
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value as "pendiente" | "vencido" | "")} className="col-span-2 w-full md:w-auto px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option value="">Pendientes y vencidos</option>
            <option value="pendiente">Solo pendientes</option>
            <option value="vencido">Solo vencidos</option>
          </select>
          <select value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)} className="col-span-2 w-full md:w-auto md:max-w-[220px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <option value="">Todos los clientes</option>
            {state.clientes.map((c) => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="col-span-2 w-full md:w-auto px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" title="Vencimiento desde" />
          <span className="hidden md:block md:self-center md:text-slate-400">–</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="col-span-2 w-full md:w-auto px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" title="Vencimiento hasta" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comprobantes list */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer" aria-label="Seleccionar todos" />
              <span className="text-sm text-slate-500 dark:text-slate-400">{comprobantes.length} comprobante{comprobantes.length !== 1 ? "s" : ""} encontrado{comprobantes.length !== 1 ? "s" : ""}</span>
            </div>
            {selected.size > 0 && <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{selected.size} seleccionado{selected.size !== 1 ? "s" : ""}</span>}
          </div>

          {comprobantes.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400 dark:text-slate-500">
              No hay comprobantes pendientes o vencidos con esos filtros.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
              {comprobantes.map((c) => (
                <label key={c.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.clienteNombre}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{c.numero} · Vence: {formatDate(c.fechaVencimiento)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(c.monto)}</p>
                    <ComprobanteEstadoBadge estado={c.estado} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Send panel */}
        <div className="space-y-4">
          {/* Channel selector */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">Canal de envío</label>
            <div className="space-y-2">
              {(["whatsapp", "email", "ambos"] as NotificacionCanal[]).map((c) => (
                <label key={c} className="flex items-center gap-2.5 cursor-pointer">
                  <input type="radio" name="canal" value={c} checked={canal === c} onChange={() => setCanal(c)} className="text-blue-600 cursor-pointer" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{canalLabels[c]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Template */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">Plantilla de mensaje</label>
              {sampleComp && (
                <button onClick={() => setPreviewOpen(!previewOpen)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium cursor-pointer transition-colors">
                  {previewOpen ? "Ocultar vista previa" : "Vista previa"}
                </button>
              )}
            </div>
            <textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Variables: {"{nombre_cliente}"} {"{numero_comprobante}"} {"{monto}"} {"{fecha_vencimiento}"} {"{link_pago}"}
            </p>
          </div>

          {previewOpen && sampleComp && (
            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-4">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Vista previa (primer resultado):</p>
              <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap font-sans">{previewMessage(sampleComp)}</pre>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={selected.size === 0}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Enviar {selected.size > 0 ? `(${selected.size})` : "notificaciones"}
          </button>
        </div>
      </div>

      {/* History log */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historial de notificaciones</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {state.notifLog.slice(0, 10).map((log) => (
            <div key={log.id} className="flex items-center gap-4 px-5 py-3">
              <div className={`w-2 h-2 rounded-full shrink-0 ${log.estado === "enviado" ? "bg-emerald-500" : "bg-red-500"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">{canalLabels[log.canal]}</span>
                  {" — "}
                  <span>{log.cantDestinatarios} destinatario{log.cantDestinatarios !== 1 ? "s" : ""}</span>
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {new Date(log.timestamp).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${log.estado === "enviado" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                {log.estado === "enviado" ? "Enviado" : "Fallido"}
              </span>
            </div>
          ))}
          {state.notifLog.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">Sin historial de notificaciones aún.</p>
          )}
        </div>
      </div>
    </div>
  )
}
