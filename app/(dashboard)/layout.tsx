"use client"

import { useState } from "react"
import { AppProvider } from "@/context/AppContext"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"
import Breadcrumbs from "@/components/layout/Breadcrumbs"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AppProvider>
      <div className="flex h-dvh bg-slate-100 dark:bg-slate-900 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex flex-col flex-1 min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="px-4 md:px-6 py-4 md:py-6 max-w-7xl mx-auto">
              <div className="mb-4">
                <Breadcrumbs />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </AppProvider>
  )
}
