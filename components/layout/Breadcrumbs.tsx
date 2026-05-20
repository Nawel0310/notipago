"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const labels: Record<string, string> = {
  dashboard: "Dashboard",
  clientes: "Clientes",
  comprobantes: "Comprobantes",
  notificaciones: "Notificaciones",
  configuracion: "Configuración",
  pagar: "Portal de Pagos",
}

export default function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  const crumbs = segments.map((seg, i) => ({
    label: labels[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
      <Link href="/dashboard" className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
        <Home className="w-4 h-4" aria-label="Inicio" />
      </Link>
      {crumbs.map(({ label, href, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5" />
          {isLast ? (
            <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
          ) : (
            <Link href={href} className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
