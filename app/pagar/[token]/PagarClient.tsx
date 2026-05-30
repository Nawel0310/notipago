"use client"

import { useReducer } from "react"
import { mockClientes, mockComprobantes } from "@/lib/mock-data"
import type { Comprobante, ComprobanteEstado } from "@/lib/types"
import PaymentPortal from "@/components/pagar/PaymentPortal"

const TOKEN_MAP: Record<string, string> = {
  "demo-token": "c001",
  "token-tech": "c003",
  "token-constructora": "c005",
  "token-agropecuaria": "c011",
}

function reducer(state: Comprobante[], action: { type: "MARK_EN_REVISION"; id: string }): Comprobante[] {
  if (action.type === "MARK_EN_REVISION") {
    return state.map((c) =>
      c.id === action.id ? { ...c, estado: "en_revision" as ComprobanteEstado } : c
    )
  }
  return state
}

export default function PagarClient({ token }: { token: string }) {
  const clienteId = TOKEN_MAP[token]
  const cliente = mockClientes.find((c) => c.id === clienteId)

  const [comprobantes, dispatch] = useReducer(
    reducer,
    mockComprobantes.filter((c) => c.clienteId === clienteId)
  )

  if (!cliente) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Enlace inválido</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Este enlace de pago no existe o expiró. Contactá a quien te envió este enlace.
          </p>
        </div>
      </div>
    )
  }

  return (
    <PaymentPortal
      cliente={cliente}
      comprobantes={comprobantes}
      onMarkEnRevision={(id) => dispatch({ type: "MARK_EN_REVISION", id })}
    />
  )
}
