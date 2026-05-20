"use client"

import { useState, useMemo } from "react"
import { toast } from "sonner"
import {
  Search, Plus, Upload, Download, ChevronUp, ChevronDown,
  Eye, Pencil, Trash2, MoreHorizontal, Users,
} from "lucide-react"
import { useApp } from "@/context/AppContext"
import { formatCurrency, formatDate, formatCUIT, generateId } from "@/lib/utils"
import { ClienteEstadoBadge } from "@/components/shared/StatusBadge"
import { TableSkeleton } from "@/components/shared/LoadingSkeleton"
import EmptyState from "@/components/shared/EmptyState"
import Pagination from "@/components/shared/Pagination"
import ConfirmModal from "@/components/shared/ConfirmModal"
import ClienteModal from "./ClienteModal"
import ImportCSVModal from "./ImportCSVModal"
import type { Cliente, ClienteEstado } from "@/lib/types"
import type { ClienteFormData } from "@/lib/schemas"

const PAGE_SIZE = 10

type SortKey = "razonSocial" | "saldoPendiente" | "creadoEn"

export default function ClientesTable() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState("")
  const [filterEstado, setFilterEstado] = useState<ClienteEstado | "">("")
  const [filterCategoria, setFilterCategoria] = useState<"A" | "B" | "C" | "">("")
  const [sortKey, setSortKey] = useState<SortKey>("creadoEn")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [editCliente, setEditCliente] = useState<Cliente | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [detailCliente, setDetailCliente] = useState<Cliente | null>(null)

  const filtered = useMemo(() => {
    let list = state.clientes
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((c) => c.razonSocial.toLowerCase().includes(q) || c.cuit.includes(q))
    }
    if (filterEstado) list = list.filter((c) => c.estado === filterEstado)
    if (filterCategoria) list = list.filter((c) => c.categoria === filterCategoria)
    list = [...list].sort((a, b) => {
      let av: string | number = a[sortKey]
      let bv: string | number = b[sortKey]
      if (typeof av === "string") av = av.toLowerCase()
      if (typeof bv === "string") bv = bv.toLowerCase()
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return list
  }, [state.clientes, search, filterEstado, filterCategoria, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

  function handleDelete(id: string) {
    dispatch({ type: "DELETE_CLIENTE", id })
    toast.success("Cliente eliminado")
    setDeleteId(null)
  }

  function handleBulkDelete() {
    dispatch({ type: "BULK_DELETE_CLIENTES", ids: Array.from(selected) })
    toast.success(`${selected.size} clientes eliminados`)
    setSelected(new Set())
    setBulkDeleteOpen(false)
  }

  function handleBulkStatus(estado: ClienteEstado) {
    dispatch({ type: "BULK_STATUS_CLIENTES", ids: Array.from(selected), estado })
    toast.success(`Estado actualizado en ${selected.size} clientes`)
    setSelected(new Set())
  }

  function handleAdd(data: ClienteFormData) {
    dispatch({ type: "ADD_CLIENTE", payload: { ...data, cuit: data.cuit.replace(/\D/g, "") } })
    toast.success("Cliente agregado correctamente")
    setAddOpen(false)
  }

  function handleEdit(data: ClienteFormData) {
    if (!editCliente) return
    dispatch({ type: "UPDATE_CLIENTE", payload: { ...editCliente, ...data, cuit: data.cuit.replace(/\D/g, "") } })
    toast.success("Cliente actualizado")
    setEditCliente(null)
  }

  function handleImport(rows: Omit<Cliente, "id" | "saldoPendiente" | "cantComprobantes" | "ultimaActividad" | "creadoEn">[]) {
    rows.forEach((payload) => dispatch({ type: "ADD_CLIENTE", payload }))
    toast.success(`${rows.length} clientes importados`)
  }

  function exportCSV() {
    const headers = ["razonSocial", "cuit", "email", "telefono", "categoria", "estado", "direccion", "localidad", "provincia", "saldoPendiente"]
    const csv = [headers.join(","), ...filtered.map((c) => headers.map((h) => `"${(c as unknown as Record<string, unknown>)[h] ?? ""}"`).join(","))].join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
    a.download = "clientes.csv"
    a.click()
    toast.success("CSV exportado")
  }

  const allPageSelected = paginated.length > 0 && paginated.every((c) => selected.has(c.id))

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="search"
            placeholder="Buscar por nombre o CUIT..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => { setFilterEstado(e.target.value as ClienteEstado | ""); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="moroso">Moroso</option>
        </select>
        <select
          value={filterCategoria}
          onChange={(e) => { setFilterCategoria(e.target.value as "A" | "B" | "C" | ""); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          <option value="A">Categoría A</option>
          <option value="B">Categoría B</option>
          <option value="C">Categoría C</option>
        </select>

        <div className="flex gap-2 ml-auto">
          {selected.size > 0 && (
            <>
              <select
                onChange={(e) => { if (e.target.value) handleBulkStatus(e.target.value as ClienteEstado) }}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                defaultValue=""
              >
                <option value="" disabled>Cambiar estado ({selected.size})</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="moroso">Moroso</option>
              </select>
              <button onClick={() => setBulkDeleteOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                <Trash2 className="w-4 h-4" />
                Eliminar ({selected.size})
              </button>
            </>
          )}
          <button onClick={() => setImportOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Importar CSV
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" />
            Agregar cliente
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState icon={Users} title="No hay clientes" description="Agregá tu primer cliente o ajustá los filtros de búsqueda." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allPageSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer"
                      aria-label="Seleccionar todos"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => toggleSort("razonSocial")} className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                      Razón social <SortIcon k="razonSocial" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">CUIT</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Estado</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400">Cat.</th>
                  <th className="px-4 py-3 text-right">
                    <button onClick={() => toggleSort("saldoPendiente")} className="flex items-center gap-1 ml-auto font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                      Saldo pendiente <SortIcon k="saldoPendiente" />
                    </button>
                  </th>
                  <th className="hidden lg:table-cell px-4 py-3 text-right">
                    <button onClick={() => toggleSort("creadoEn")} className="flex items-center gap-1 ml-auto font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                      Creado <SortIcon k="creadoEn" />
                    </button>
                  </th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paginated.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300 dark:border-slate-600 text-blue-600 cursor-pointer" aria-label={`Seleccionar ${c.razonSocial}`} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{c.razonSocial}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{c.cantComprobantes} comprobantes</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">{formatCUIT(c.cuit)}</td>
                    <td className="hidden md:table-cell px-4 py-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">{c.email}</td>
                    <td className="px-4 py-3"><ClienteEstadoBadge estado={c.estado} /></td>
                    <td className="hidden sm:table-cell px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{c.categoria}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(c.saldoPendiente)}</td>
                    <td className="hidden lg:table-cell px-4 py-3 text-right text-slate-400 dark:text-slate-500 text-xs">{formatDate(c.creadoEn)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailCliente(c)} className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Ver detalle">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditCliente(c)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Eliminar">
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

      {/* Detail Sheet */}
      {detailCliente && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDetailCliente(null)} aria-hidden="true" />
          <div className="relative bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="font-semibold text-slate-900 dark:text-white">Detalle del cliente</h2>
              <button onClick={() => setDetailCliente(null)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Cerrar"><Eye className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                ["Razón social", detailCliente.razonSocial],
                ["CUIT", formatCUIT(detailCliente.cuit)],
                ["Email", detailCliente.email],
                ["Teléfono", detailCliente.telefono],
                ["Categoría", detailCliente.categoria],
                ["Dirección", `${detailCliente.direccion}, ${detailCliente.localidad}, ${detailCliente.provincia}`],
                ["Saldo pendiente", formatCurrency(detailCliente.saldoPendiente)],
                ["Comprobantes", detailCliente.cantComprobantes.toString()],
                ["Última actividad", formatDate(detailCliente.ultimaActividad)],
                ["Creado el", formatDate(detailCliente.creadoEn)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400 w-40 shrink-0">{label}</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <span className="text-sm text-slate-500 dark:text-slate-400 w-40 shrink-0">Estado</span>
                <ClienteEstadoBadge estado={detailCliente.estado} />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        title="¿Eliminar cliente?"
        description="Esta acción eliminará el cliente y todos sus comprobantes asociados. No se puede deshacer."
        confirmLabel="Eliminar"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmModal
        open={bulkDeleteOpen}
        title={`¿Eliminar ${selected.size} clientes?`}
        description="Se eliminarán los clientes seleccionados y todos sus comprobantes. No se puede deshacer."
        confirmLabel="Eliminar todos"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />

      <ClienteModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAdd}
      />

      <ClienteModal
        open={!!editCliente}
        onClose={() => setEditCliente(null)}
        onSubmit={handleEdit}
        initialData={editCliente}
      />

      <ImportCSVModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
      />
    </div>
  )
}
