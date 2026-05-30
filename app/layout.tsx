import type { Metadata } from "next"
import { Inter, Sora } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "NOTIPAGO — Comprobantes & Cobros",
  description: "Sistema de gestión de comprobantes y cobros para PyMEs argentinas",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${sora.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
