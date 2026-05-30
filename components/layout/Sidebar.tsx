"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Settings,
  X,
  LogOut,
} from "lucide-react"
import { toast } from "sonner"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/comprobantes", label: "Comprobantes", icon: FileText },
  { href: "/notificaciones", label: "Notificaciones", icon: Bell },
  { href: "/configuracion", label: "Configuración", icon: Settings },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    toast.success("Sesión cerrada")
    router.push("/login")
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-200 md:relative md:translate-x-0 md:flex",
          /* Light: white with right border — Dark: very deep navy */
          "bg-white dark:bg-slate-950",
          "border-r border-slate-200 dark:border-slate-800",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Navegación principal"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Image
              src="/images/NOTIPAGO-LOGO.webp"
              alt="NotiPago logo"
              width={36}
              height={36}
              className="shrink-0 drop-shadow-sm"
            />
            <span className="font-bold text-slate-900 dark:text-white text-[1rem] tracking-tight">
              NotiPago
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors cursor-pointer border-l-2",
                  active
                    ? [
                        /* Active light */
                        "bg-blue-50 text-blue-700 border-blue-600",
                        /* Active dark */
                        "dark:bg-blue-600 dark:text-white dark:border-blue-400",
                      ]
                    : [
                        /* Inactive light */
                        "text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-100",
                        /* Inactive dark */
                        "dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800",
                      ]
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-l-2 border-transparent"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
