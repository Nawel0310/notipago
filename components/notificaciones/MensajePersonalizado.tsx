"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Send, MessageCircle, Mail, Search, type LucideIcon } from "lucide-react"
import { useApp } from "@/context/AppContext"
import type { NotificacionCanal } from "@/lib/types"

const canalOpts: { value: NotificacionCanal; label: string; icon: LucideIcon; activeClass: string }[] = [
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, activeClass: "bg-green-600 border-green-600 text-white" },
  { value: "email", label: "Email", icon: Mail, activeClass: "bg-blue-600 border-blue-600 text-white" },
  { value: "ambos", label: "Email + WhatsApp", icon: Send, activeClass: "bg-violet-600 border-violet-600 text-white" },
]

export default function MensajePersonalizado() {
  const { state, dispatch } = useApp()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [canal, setCanal] = useState<NotificacionCanal>("whatsapp")
  const [search, setSearch] = useState("")
  const [subject, setSubject] = useState("Notificación de pago pendiente")
  const [mensaje, setMensaje] = useState("")

  const eligibleClientes = state.clientes.filter((c) => c.estado !== "inactivo")
  const filteredClientes = search
    ? eligibleClientes.filter((c) => c.razonSocial.toLowerCase().includes(search.toLowerCase()))
    : eligibleClientes
  const allSelected = filteredClientes.length > 0 && filteredClientes.every((c) => selectedIds.has(c.id))
  const charCount = mensaje.length

  function toggleId(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(filteredClientes.map((c) => c.id)))
  }

  function handleSend() {
    if (selectedIds.size === 0) { toast.error("Seleccioná al menos un destinatario"); return }
    if (!mensaje.trim()) { toast.error("Escribí un mensaje"); return }
    if (selectedIds.size === 1 && canal === "whatsapp") {
      const cliente = state.clientes.find((c) => selectedIds.has(c.id))!
      window.open(`https://wa.me/${cliente.telefono}?text=${encodeURIComponent(mensaje)}`, "_blank", "noopener,noreferrer")
      toast.success(`Abriendo WhatsApp para ${cliente.razonSocial}`)
    } else {
      const canalLabel = canal === "ambos" ? "Email + WhatsApp" : canal === "email" ? "Email" : "WhatsApp"
      toast.success(`Mensaje enviado a ${selectedIds.size} destinatario${selectedIds.size !== 1 ? "s" : ""} por ${canalLabel}`)
    }
    dispatch({ type: "ADD_NOTIF_LOG", payload: { timestamp: new Date().toISOString(), canal, cantDestinatarios: selectedIds.size, estado: "enviado" } })
    setMensaje("")
    setSelectedIds(new Set())
  }

  const btnLabel = selectedIds.size === 1 && canal === "whatsapp"
    ? "Abrir WhatsApp"
    : selectedIds.size > 0
    ? `Enviar a ${selectedIds.size} cliente${selectedIds.size !== 1 ? "s" : ""}`
    : "Enviar mensaje"

  return (
    <div className="max-w-2xl space-y-5">
      {/* Recipients */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Destinatarios</h3>
          {selectedIds.size > 0 && (
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
              {selectedIds.size} seleccionado{selectedIds.size !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Select all */}
        <label className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer"
            aria-label="Seleccionar todos"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Seleccionar todos</span>
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">{filteredClientes.length} clientes</span>
        </label>

        {/* List */}
        {filteredClientes.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">Sin resultados.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-60 overflow-y-auto">
            {filteredClientes.map((c) => (
              <label key={c.id} className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleId(c.id)}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.razonSocial}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.email} · +{c.telefono}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Canal */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Canal</h3>
        <div className="flex flex-wrap gap-3">
          {canalOpts.map(({ value, label, icon: Icon, activeClass }) => (
            <button
              key={value}
              onClick={() => setCanal(value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                canal === value
                  ? activeClass
                  : "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Mensaje</h3>
        <div className="space-y-3">
          {(canal === "email" || canal === "ambos") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Asunto</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mensaje</label>
              <span className={`text-xs ${charCount > 1000 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>{charCount} caracteres</span>
            </div>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              rows={6}
              placeholder={canal === "whatsapp" ? "Escribí tu mensaje para WhatsApp..." : canal === "email" ? "Cuerpo del email..." : "Escribí tu mensaje..."}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={selectedIds.size === 0 || !mensaje.trim()}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors cursor-pointer"
      >
        <Send className="w-4 h-4" />
        {btnLabel}
      </button>

      {selectedIds.size === 1 && canal === "whatsapp" && (() => {
        const cliente = state.clientes.find((c) => selectedIds.has(c.id))
        return cliente ? (
          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
            Se abrirá WhatsApp Web con el número +{cliente.telefono} y el mensaje pre-cargado.
          </p>
        ) : null
      })()}
    </div>
  )
}
