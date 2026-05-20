import { Settings, Construction } from "lucide-react"

export default function ConfiguracionPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ajustes de tu cuenta y sistema</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
          <Construction className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">En construcción</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Esta sección estará disponible próximamente. Podrás configurar tus datos de empresa, plantillas de mensajes, integraciones con MercadoPago y más.
        </p>
      </div>
    </div>
  )
}
