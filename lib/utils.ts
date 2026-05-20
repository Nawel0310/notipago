import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return "$ " + amount.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("T")[0].split("-")
  return `${day}/${month}/${year}`
}

export function formatCUIT(cuit: string): string {
  const digits = cuit.replace(/\D/g, "")
  if (digits.length !== 11) return cuit
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export function isoNow(): string {
  return new Date().toISOString()
}
