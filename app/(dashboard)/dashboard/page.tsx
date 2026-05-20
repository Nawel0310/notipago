import SummaryCards from "@/components/dashboard/SummaryCards"
import RecentTables from "@/components/dashboard/RecentTables"

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Resumen general de tu cuenta</p>
      </div>
      <SummaryCards />
      <RecentTables />
    </div>
  )
}
