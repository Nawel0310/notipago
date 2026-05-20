"use client"

import { useState, useRef } from "react"
import Papa from "papaparse"
import { Upload, X, AlertCircle, CheckCircle } from "lucide-react"
import type { Cliente } from "@/lib/types"
import { generateId, isoNow } from "@/lib/utils"

interface ImportCSVModalProps {
  open: boolean
  onClose: () => void
  onImport: (clientes: Omit<Cliente, "id" | "saldoPendiente" | "cantComprobantes" | "ultimaActividad" | "creadoEn">[]) => void
}

const REQUIRED_COLS = ["razonSocial", "cuit", "email", "telefono", "categoria", "estado", "direccion", "localidad", "provincia"]

export default function ImportCSVModal({ open, onClose, onImport }: ImportCSVModalProps) {
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [errors, setErrors] = useState<{ row: number; msg: string }[]>([])
  const [fileName, setFileName] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    setFileName(file.name)
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as Record<string, string>[]
        const errs: { row: number; msg: string }[] = []
        data.forEach((row, i) => {
          REQUIRED_COLS.forEach((col) => {
            if (!row[col]) errs.push({ row: i + 2, msg: `Columna "${col}" faltante o vacía` })
          })
          if (row.cuit && row.cuit.replace(/\D/g, "").length !== 11) {
            errs.push({ row: i + 2, msg: `CUIT inválido (debe tener 11 dígitos)` })
          }
          if (row.categoria && !["A", "B", "C"].includes(row.categoria)) {
            errs.push({ row: i + 2, msg: `Categoría inválida: "${row.categoria}" (debe ser A, B o C)` })
          }
          if (row.estado && !["activo", "inactivo", "moroso"].includes(row.estado)) {
            errs.push({ row: i + 2, msg: `Estado inválido: "${row.estado}"` })
          }
        })
        setRows(data)
        setErrors(errs)
      },
    })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleImport() {
    const validRows = rows.filter((_, i) => !errors.some((e) => e.row === i + 2))
    onImport(
      validRows.map((row) => ({
        razonSocial: row.razonSocial,
        cuit: row.cuit.replace(/\D/g, ""),
        email: row.email,
        telefono: row.telefono,
        categoria: (row.categoria as Cliente["categoria"]) || "B",
        estado: (row.estado as Cliente["estado"]) || "activo",
        direccion: row.direccion,
        localidad: row.localidad,
        provincia: row.provincia,
      }))
    )
    setRows([])
    setErrors([])
    setFileName("")
    onClose()
  }

  function handleClose() {
    setRows([])
    setErrors([])
    setFileName("")
    onClose()
  }

  if (!open) return null

  const validCount = rows.length - new Set(errors.map((e) => e.row)).size

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">Importar clientes desde CSV</h2>
          <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Columns hint */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Columnas requeridas (encabezados en la primera fila):</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">{REQUIRED_COLS.join(", ")}</p>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
          >
            <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {fileName ? (
                <span className="font-medium text-slate-900 dark:text-white">{fileName}</span>
              ) : (
                <>Arrastrá un archivo CSV o <span className="text-blue-600 dark:text-blue-400 font-medium">hacé clic para seleccionar</span></>
              )}
            </p>
            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
          </div>

          {/* Preview */}
          {rows.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-slate-700 dark:text-slate-300">{validCount} fila{validCount !== 1 ? "s" : ""} válida{validCount !== 1 ? "s" : ""}</span>
                {errors.length > 0 && (
                  <>
                    <span className="text-slate-400">·</span>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-700 dark:text-amber-400">{errors.length} error{errors.length !== 1 ? "es" : ""}</span>
                  </>
                )}
              </div>

              {errors.length > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg max-h-32 overflow-y-auto">
                  {errors.map((e, i) => (
                    <p key={i} className="text-xs text-amber-700 dark:text-amber-400">Fila {e.row}: {e.msg}</p>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 max-h-48">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      {REQUIRED_COLS.map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-400">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {rows.slice(0, 10).map((row, i) => {
                      const hasError = errors.some((e) => e.row === i + 2)
                      return (
                        <tr key={i} className={hasError ? "bg-red-50 dark:bg-red-900/10" : ""}>
                          {REQUIRED_COLS.map((col) => (
                            <td key={col} className="px-3 py-2 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{row[col] || "—"}</td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button onClick={handleClose} className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              onClick={handleImport}
              disabled={validCount === 0}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Importar {validCount > 0 ? `${validCount} clientes` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
