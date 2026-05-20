"use client"

import { useState } from "react"
import NotificacionesMasivas from "@/components/notificaciones/NotificacionesMasivas"
import MensajePersonalizado from "@/components/notificaciones/MensajePersonalizado"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "masivas", label: "Notificaciones masivas" },
  { id: "personalizado", label: "Mensaje personalizado" },
]

export default function NotificacionesPage() {
  const [tab, setTab] = useState("masivas")

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notificaciones</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Enviá avisos de cobro a tus clientes</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-xl w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
              tab === t.id
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "masivas" && <NotificacionesMasivas />}
      {tab === "personalizado" && <MensajePersonalizado />}
    </div>
  )
}
