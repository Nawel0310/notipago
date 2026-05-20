"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { X } from "lucide-react"
import { clienteSchema, type ClienteFormData } from "@/lib/schemas"
import type { Cliente } from "@/lib/types"

interface ClienteModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: ClienteFormData) => void
  initialData?: Cliente | null
}

const provincias = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
]

export default function ClienteModal({ open, onClose, onSubmit, initialData }: ClienteModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  })

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          razonSocial: initialData.razonSocial,
          cuit: initialData.cuit.replace(/\D/g, ""),
          email: initialData.email,
          telefono: initialData.telefono,
          categoria: initialData.categoria,
          estado: initialData.estado,
          direccion: initialData.direccion,
          localidad: initialData.localidad,
          provincia: initialData.provincia,
        })
      } else {
        reset({ estado: "activo", categoria: "B" } as unknown as ClienteFormData)
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cliente-modal-title"
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <h2 id="cliente-modal-title" className="font-semibold text-slate-900 dark:text-white">
            {initialData ? "Editar cliente" : "Agregar cliente"}
          </h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Razón social *</label>
              <input {...register("razonSocial")} placeholder="Empresa S.R.L." className={inputClass} />
              {errors.razonSocial && <p className={errorClass}>{errors.razonSocial.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">CUIT * (11 dígitos sin guiones)</label>
              <input {...register("cuit")} placeholder="30712345678" maxLength={11} className={inputClass} />
              {errors.cuit && <p className={errorClass}>{errors.cuit.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoría *</label>
              <select {...register("categoria")} className={inputClass}>
                <option value="">Seleccioná...</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
              {errors.categoria && <p className={errorClass}>{errors.categoria.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email *</label>
              <input {...register("email")} type="email" placeholder="contacto@empresa.com" className={inputClass} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Teléfono WhatsApp * (ej: 5491122334455)</label>
              <input {...register("telefono")} placeholder="5491122334455" className={inputClass} />
              {errors.telefono && <p className={errorClass}>{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Estado *</label>
              <select {...register("estado")} className={inputClass}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="moroso">Moroso</option>
              </select>
              {errors.estado && <p className={errorClass}>{errors.estado.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Provincia *</label>
              <select {...register("provincia")} className={inputClass}>
                <option value="">Seleccioná...</option>
                {provincias.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              {errors.provincia && <p className={errorClass}>{errors.provincia.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Localidad *</label>
              <input {...register("localidad")} placeholder="Rosario" className={inputClass} />
              {errors.localidad && <p className={errorClass}>{errors.localidad.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Dirección *</label>
              <input {...register("direccion")} placeholder="Av. Corrientes 1234" className={inputClass} />
              {errors.direccion && <p className={errorClass}>{errors.direccion.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium transition-colors cursor-pointer">
              {initialData ? "Guardar cambios" : "Agregar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
