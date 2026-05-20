"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import { mockClientes, mockComprobantes, mockNotificacionesLog } from "@/lib/mock-data"
import type { Cliente, Comprobante, NotificacionLog, ClienteEstado, ComprobanteEstado, NotificacionCanal } from "@/lib/types"
import { generateId, isoNow } from "@/lib/utils"

interface AppState {
  clientes: Cliente[]
  comprobantes: Comprobante[]
  notifLog: NotificacionLog[]
}

type Action =
  | { type: "ADD_CLIENTE"; payload: Omit<Cliente, "id" | "saldoPendiente" | "cantComprobantes" | "ultimaActividad" | "creadoEn"> }
  | { type: "UPDATE_CLIENTE"; payload: Cliente }
  | { type: "DELETE_CLIENTE"; id: string }
  | { type: "BULK_DELETE_CLIENTES"; ids: string[] }
  | { type: "BULK_STATUS_CLIENTES"; ids: string[]; estado: ClienteEstado }
  | { type: "ADD_COMPROBANTE"; payload: Omit<Comprobante, "id" | "clienteNombre" | "envioNotificacion" | "creadoEn"> & { clienteId: string } }
  | { type: "UPDATE_COMPROBANTE"; payload: Comprobante }
  | { type: "DELETE_COMPROBANTE"; id: string }
  | { type: "BULK_DELETE_COMPROBANTES"; ids: string[] }
  | { type: "MARK_PAID"; ids: string[] }
  | { type: "MARK_REJECTED"; ids: string[] }
  | { type: "MARK_EN_REVISION"; id: string }
  | { type: "ADD_NOTIF_LOG"; payload: Omit<NotificacionLog, "id"> }
  | { type: "BULK_NOTIFY"; ids: string[]; canal: NotificacionCanal }

function recalcClienteSaldo(clientes: Cliente[], comprobantes: Comprobante[]): Cliente[] {
  return clientes.map((c) => {
    const pending = comprobantes
      .filter((cp) => cp.clienteId === c.id && (cp.estado === "pendiente" || cp.estado === "vencido"))
      .reduce((sum, cp) => sum + cp.monto, 0)
    const total = comprobantes.filter((cp) => cp.clienteId === c.id).length
    return { ...c, saldoPendiente: pending, cantComprobantes: total }
  })
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_CLIENTE": {
      const newCliente: Cliente = {
        ...action.payload,
        id: generateId(),
        saldoPendiente: 0,
        cantComprobantes: 0,
        ultimaActividad: isoNow().split("T")[0],
        creadoEn: isoNow().split("T")[0],
      }
      return { ...state, clientes: [newCliente, ...state.clientes] }
    }
    case "UPDATE_CLIENTE": {
      const clientes = state.clientes.map((c) => c.id === action.payload.id ? action.payload : c)
      return { ...state, clientes }
    }
    case "DELETE_CLIENTE": {
      return {
        ...state,
        clientes: state.clientes.filter((c) => c.id !== action.id),
        comprobantes: state.comprobantes.filter((cp) => cp.clienteId !== action.id),
      }
    }
    case "BULK_DELETE_CLIENTES": {
      const ids = new Set(action.ids)
      return {
        ...state,
        clientes: state.clientes.filter((c) => !ids.has(c.id)),
        comprobantes: state.comprobantes.filter((cp) => !ids.has(cp.clienteId)),
      }
    }
    case "BULK_STATUS_CLIENTES": {
      const ids = new Set(action.ids)
      return {
        ...state,
        clientes: state.clientes.map((c) => ids.has(c.id) ? { ...c, estado: action.estado } : c),
      }
    }
    case "ADD_COMPROBANTE": {
      const cliente = state.clientes.find((c) => c.id === action.payload.clienteId)
      const newComp: Comprobante = {
        ...action.payload,
        id: generateId(),
        clienteNombre: cliente?.razonSocial ?? "",
        envioNotificacion: false,
        creadoEn: isoNow().split("T")[0],
      }
      const comprobantes = [newComp, ...state.comprobantes]
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "UPDATE_COMPROBANTE": {
      const comprobantes = state.comprobantes.map((cp) => cp.id === action.payload.id ? action.payload : cp)
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "DELETE_COMPROBANTE": {
      const comprobantes = state.comprobantes.filter((cp) => cp.id !== action.id)
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "BULK_DELETE_COMPROBANTES": {
      const ids = new Set(action.ids)
      const comprobantes = state.comprobantes.filter((cp) => !ids.has(cp.id))
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "MARK_PAID": {
      const ids = new Set(action.ids)
      const comprobantes = state.comprobantes.map((cp) =>
        ids.has(cp.id) ? { ...cp, estado: "pagado" as ComprobanteEstado, metodoPago: cp.metodoPago ?? "transferencia" } : cp
      )
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "MARK_REJECTED": {
      const ids = new Set(action.ids)
      const comprobantes = state.comprobantes.map((cp) =>
        ids.has(cp.id) ? { ...cp, estado: "rechazado" as ComprobanteEstado } : cp
      )
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "MARK_EN_REVISION": {
      const comprobantes = state.comprobantes.map((cp) =>
        cp.id === action.id ? { ...cp, estado: "en_revision" as ComprobanteEstado } : cp
      )
      return { ...state, comprobantes, clientes: recalcClienteSaldo(state.clientes, comprobantes) }
    }
    case "BULK_NOTIFY": {
      const ids = new Set(action.ids)
      const now = isoNow()
      const comprobantes = state.comprobantes.map((cp) =>
        ids.has(cp.id)
          ? { ...cp, envioNotificacion: true, fechaUltimaNotificacion: now }
          : cp
      )
      const log: NotificacionLog = {
        id: generateId(),
        timestamp: now,
        canal: action.canal,
        cantDestinatarios: action.ids.length,
        estado: "enviado",
      }
      return { ...state, comprobantes, notifLog: [log, ...state.notifLog] }
    }
    case "ADD_NOTIF_LOG": {
      const log: NotificacionLog = { ...action.payload, id: generateId() }
      return { ...state, notifLog: [log, ...state.notifLog] }
    }
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    clientes: mockClientes,
    comprobantes: mockComprobantes,
    notifLog: mockNotificacionesLog,
  })

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used inside AppProvider")
  return ctx
}
