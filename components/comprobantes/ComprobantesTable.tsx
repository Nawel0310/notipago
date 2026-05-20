"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Search, Plus, Upload, Download, ChevronUp, ChevronDown,
  Eye, Pencil, Trash2, CheckCircle, XCircle, Bell, FileText,
  AlertCircle, Clock, CheckCircle2,
} from "lucide-react"
import { useApp } from "@/context/AppContext"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ComprobanteEstadoBadge } from "@/components/shared/StatusBadge"
import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import Pagination from "@/components/shared/Pagination"
import ConfirmModal from "@/components/shared/ConfirmModal"
import ComprobanteModal from "./ComprobanteModal"
import ComprobanteDetailModal from "./ComprobanteDetailModal"
import type { Comprobante, ComprobanteEstado } from "@/lib/types"
import type { ComprobanteFormData } from "@/lib/schemas"

const PAGE_SIZE = 10

type SortKey = "numero" | "monto" | "fechaVencimiento" | "creadoEn"

export default function ComprobantesTable() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState<ComprobanteEstado | "">("")
  const [filterTipo, setFilterTipo] = useState("")
  const [filterCliente, setFilterCliente] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("creadoEn")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editComp, setEditComp] = useState<Comprobante | null>(null)
  const [detailComp, setDetailComp] = useState<Comprobante | null>(null)

  const filtered = useMemo(() => {
    let list = state.comprobantes
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.numero.toLowerCase().includes(q) || c.clienteNombre.toLowerCase().includes(q) || c.descripcion.toLowerCase().includes(q))
    }
    if (filterEstado) list = list.filter((c) => c.estado === filterEstado)
    if (filterTipo) list = list.filter((c) => c.tipo === filterTipo)
    if (filterCliente) list = list.filter((c) => c.clienteId === filterCliente)
    if (dateFrom) list = list.filter((c) => c.fechaVencimiento >= dateFrom)
    if (dateTo) list = list.filter((c) => c.fechaVencimiento <= dateTo)
    list = [...list].sort((a, b) => {
      const av = a[sortKey] as string | number
      const bv = b[sortKey] as string | number
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [state.comprobantes, search, filterEstado, filterTipo, filterCliente, dateFrom, dateTo, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const summaryByEstado = useMemo(() => {
    const result: Partial<Record<ComprobanteEstado, number>> = {}
    for (const c of state.comprobantes) {
      result[c.estado] = (result[c.estado] ?? 0) + c.monto
    }
    return result
  }, [state.comprobantes])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortKey(key); setSortDir("asc") }
    setPage(1)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3.5 h-3.5 opacity-30" />
    return sortDir === "asc" ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (paginated.every((c) => selected.has(c.id))) {
      setSelected((prev) => { const next = new Set(prev); paginated.forEach((c) => next.delete(c.id)); return next })
    } else {
      setSelected((prev) => { const next = new Set(prev); paginated.forEach((c) => next.add(c.id)); return next })
    }
  }

  function handleAdd(data: ComprobanteFormData) {
    dispatch({
      type: "ADD_COMPROBANTE",
      payload: {
        ...data,
        metodoPago: data.metodoPago,
        notasInternas: data.notasInternas,
        numero: data.numero,
        tipo: data.tipo,
        clienteId: data.clienteId,
        fechaEmision: data.fechaEmision,
        fechaVencimiento: data.fechaVencimiento,
        monto: data.monto,
        moneda: data.moneda,
        estado: data.estado,
        descripcion: data.descripcion,
      },
    })
    toast.success("Comprobante agregado")
    setAddOpen(false)
  }

  function handleEdit(data: ComprobanteFormData) {
    if (!editComp) return
    const cliente = state.clientes.find((c) => c.id === data.clienteId)
    dispatch({
      type: "UPDATE_COMPROBANTE",
      payload: { ...editComp, ...data, clienteNombre: cliente?.razonSocial ?? editComp.clienteNombre },
    })
    toast.success("Comprobante actualizado")
    setEditComp(null)
  }

  function handleDelete(id: string) {
    dispatch({ type: "DELETE_COMPROBANTE", id })
    toast.success("Comprobante eliminado")
    setDeleteId(null)
  }

  function handleBulkDelete() {
    dispatch({ type: "BULK_DELETE_COMPROBANTES", ids: Array.from(selected) })
    toast.success(`${selected.size} comprobantes eliminados`)
    setSelected(new Set())
    setBulkDeleteOpen(false)
  }

  function handleBulkPaid() {
    dispatch({ type: "MARK_PAID", ids: Array.from(selected) })
    toast.success(`${selected.size} comprobantes marcados como pagados`)
    setSelected(new Set())
  }

  function handleBulkNotify() {
    dispatch({ type: "BULK_NOTIFY", ids: Array.from(selected), canal: "whatsapp" })
    toast.success(`Notificaciones enviadas a ${selected.size} comprobantes`)
    setSelected(new Set())
  }

  function handleMarkPaid(id: string) {
    dispatch({ type: "MARK_PAID", ids: [id] })
    toast.success("Comprobante marcado como pagado")
  }

  function handleMarkRejected(id: string) {
    dispatch({ type: "MARK_REJECTED", ids: [id] })
    toast.success("Comprobante rechazado")
  }

  function exportCSV() {
    const headers = ["numero", "tipo", "clienteNombre", "fechaEmision", "fechaVencimiento", "monto", "moneda", "estado", "descripcion"]
    const csv = [headers.join(","), ...filtered.map((c) => headers.map((h) => `"${(c as unknown as Record<string, unknown>)[h] ?? ""}"`).join(","))].join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = "comprobantes.csv"
    a.click()
    toast.success("CSV exportado")
  }

  const estadoColors: Partial<Record<ComprobanteEstado, string>> = {
    pendiente: "text-amber-600 dark:text-amber-400",
    pagado: "text-emerald-600 dark:text-emerald-400",
    vencido: "text-red-600 dark:text-red-400",
    rechazado: "text-slate-500 dark:text-slate-400",
    en_revision: "text-sky-600 dark:text-sky-400",
  }

  const estadoLabels: Partial<Record<ComprobanteEstado, string>> = {
    pendiente: "Pendiente", pagado: "Pagado", vencido: "Vencido", rechazado: "Rechazado", en_revision: "En revisión",
  }

  const allPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id))

  const estadoCards = [
    { estado: "vencido" as ComprobanteEstado, label: "Vencidos", icon: AlertCircle, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20" },
    { estado: "pendiente" as ComprobanteEstado, label: "Pendientes", icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { estado: "en_revision" as ComprobanteEstado, label: "En revisión", icon: Eye, color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-50 dark:bg-sky-900/20" },
    { estado: "pagado" as ComprobanteEstado, label: "Pagados", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { estado: "rechazado" as ComprobanteEstado, label: "Rechazados", icon: XCircle, color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-700" },
  ]

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-4">
        {estadoCards.map(({ estado, label, icon: Icon, color, bg }) => {
          const count = state.comprobantes.filter((c) => c.estado === estado).length
          const monto = summaryByEstado[estado] ?? 0
          const isActive = filterEstado === estado
          return (
            <button
              key={estado}
              onClick={() => { setFilterEstado(isActive ? "" : estado); setPage(1) }}
              className={`bg-white dark:bg-slate-800 rounded-xl border p-4 shadow-sm text-left transition-all cursor-pointer w-full ${
                isActive
                  ? "border-blue-400 ring-2 ring-blue-200 dark:ring-blue-900"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <div className={`p-1.5 rounded-lg ${bg}`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{count}</p>
              <p className={`text-sm font-semibold mt-0.5 ${color}`}>{formatCurrency(monto)}</p>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por número, cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value as ComprobanteEstado | ""); setPage(1) }} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagado">Pagado</option>
          <option value="vencido">Vencido</option>
          <option value="rechazado">Rechazado</option>
          <option value="en_revision">En revisión</option>
        </select>

        <select value={filterTipo} onChange={(e) => { setFilterTipo(e.target.value); setPage(1) }} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
          <option value="">Todos los tipos</option>
          {["Factura A", "Factura B", "Factura C", "Nota de Débito", "Nota de Crédito", "Recibo"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={filterCliente} onChange={(e) => { setFilterCliente(e.target.value); setPage(1) }} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer max-w-[200px]">
          <option value="">Todos los clientes</option>
          {state.clientes.map((c) => <option key={c.id} value={c.id}>{c.razonSocial}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1) }} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" title="Vencimiento desde" />
          <span className="text-slate-400 text-sm">–</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1) }} className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" title="Vencimiento hasta" />
        </div>

        <div className="flex gap-2 ml-auto">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Agregar Comprobante
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative">
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState icon={FileText} title="No hay comprobantes" description="Agregá un comprobante o ajustá los filtros." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allPageSelected} onChange={toggleSelectAll} className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer" aria-label="Seleccionar todos" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort("numero")} className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                      Número <SortIcon k="numero" />
                    </button>
                  </th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Tipo</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Cliente</th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort("fechaVencimiento")} className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                      Vencimiento <SortIcon k="fechaVencimiento" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => toggleSort("monto")} className="flex items-center gap-1 ml-auto font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                      Monto <SortIcon k="monto" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Estado</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-600 dark:text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paginated.map((c) => (
                  <tr key={c.id} onClick={() => toggleSelect(c.id)} className={`cursor-pointer transition-colors ${selected.has(c.id) ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-700/30"}`}>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer" aria-label={`Seleccionar ${c.numero}`} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-slate-900 dark:text-white">{c.numero}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 md:hidden truncate max-w-[140px]">{c.clienteNombre}</p>
                    </td>
                    <td className="hidden sm:table-cell px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{c.tipo}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[160px] truncate">{c.clienteNombre}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{formatDate(c.fechaVencimiento)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(c.monto)}</td>
                    <td className="px-4 py-3"><ComprobanteEstadoBadge estado={c.estado} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button disabled={selected.size > 0} onClick={(e) => { e.stopPropagation(); setDetailComp(c) }} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none" aria-label="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button disabled={selected.size > 0} onClick={(e) => { e.stopPropagation(); setEditComp(c) }} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none" aria-label="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        {(c.estado === "pendiente" || c.estado === "vencido" || c.estado === "en_revision") && (
                          <button disabled={selected.size > 0} onClick={(e) => { e.stopPropagation(); handleMarkPaid(c.id) }} className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none" aria-label="Marcar como pagado">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {(c.estado === "pendiente" || c.estado === "vencido" || c.estado === "en_revision") && (
                          <button disabled={selected.size > 0} onClick={(e) => { e.stopPropagation(); handleMarkRejected(c.id) }} className="p-1.5 text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none" aria-label="Rechazar">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button disabled={selected.size > 0} onClick={(e) => { e.stopPropagation(); setDeleteId(c.id) }} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:pointer-events-none" aria-label="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
        )}
      </div>
      {selected.size > 0 ? (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 px-6 py-3 whitespace-nowrap">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 pr-3 border-r border-slate-200 dark:border-slate-600">
            {selected.size} seleccionados
          </span>
          <button
            onClick={handleBulkNotify}
            title={`Notificar ${selected.size} seleccionados`}
            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button
            onClick={handleBulkPaid}
            title={`Marcar ${selected.size} como pagados`}
            className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-600" />
          <button
            onClick={() => setBulkDeleteOpen(true)}
            title={`Eliminar ${selected.size} seleccionados`}
            className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ) : null}
      </div>

      <ComprobanteDetailModal comprobante={detailComp} onClose={() => setDetailComp(null)} />

      <ConfirmModal open={!!deleteId} title="¿Eliminar comprobante?" description="Esta acción no se puede deshacer." confirmLabel="Eliminar" onConfirm={() => deleteId && handleDelete(deleteId)} onCancel={() => setDeleteId(null)} />
      <ConfirmModal open={bulkDeleteOpen} title={`¿Eliminar ${selected.size} comprobantes?`} description="Esta acción no se puede deshacer." confirmLabel="Eliminar todos" onConfirm={handleBulkDelete} onCancel={() => setBulkDeleteOpen(false)} />

      <ComprobanteModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
      <ComprobanteModal open={!!editComp} onClose={() => setEditComp(null)} onSubmit={handleEdit} initialData={editComp} />
    </div>
  )
}
