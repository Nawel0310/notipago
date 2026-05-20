import ComprobantesTable from "@/components/comprobantes/ComprobantesTable"

export default function ComprobantesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Comprobantes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestioná tus facturas, recibos y notas</p>
      </div>
      <ComprobantesTable />
    </div>
  )
}
