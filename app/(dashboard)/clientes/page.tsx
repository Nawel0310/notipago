import ClientesTable from "@/components/clientes/ClientesTable"

export default function ClientesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Clientes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Gestioná tu cartera de clientes</p>
      </div>
      <ClientesTable />
    </div>
  )
}
