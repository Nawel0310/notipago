export type ClienteCategoria = "A" | "B" | "C"
export type ClienteEstado = "activo" | "inactivo" | "moroso"

export interface Cliente {
  id: string
  razonSocial: string
  cuit: string
  email: string
  telefono: string
  categoria: ClienteCategoria
  estado: ClienteEstado
  direccion: string
  localidad: string
  provincia: string
  saldoPendiente: number
  cantComprobantes: number
  ultimaActividad: string
  creadoEn: string
}

export type ComprobanteEstado = "pendiente" | "pagado" | "vencido" | "rechazado" | "en_revision"
export type ComprobanteTipo =
  | "Factura A"
  | "Factura B"
  | "Factura C"
  | "Nota de Débito"
  | "Nota de Crédito"
  | "Recibo"
export type ComprobanteMoneda = "ARS" | "USD"
export type ComprobanteMetodoPago = "transferencia" | "mercadopago" | "efectivo" | "cheque"

export interface Comprobante {
  id: string
  numero: string
  tipo: ComprobanteTipo
  clienteId: string
  clienteNombre: string
  fechaEmision: string
  fechaVencimiento: string
  monto: number
  moneda: ComprobanteMoneda
  estado: ComprobanteEstado
  descripcion: string
  archivoUrl?: string
  metodoPago?: ComprobanteMetodoPago
  comprobantePagoUrl?: string
  notasInternas?: string
  envioNotificacion: boolean
  fechaUltimaNotificacion?: string
  creadoEn: string
}

export type NotificacionCanal = "email" | "whatsapp" | "ambos"

export interface NotificacionLog {
  id: string
  timestamp: string
  canal: NotificacionCanal
  cantDestinatarios: number
  estado: "enviado" | "fallido"
  mensaje?: string
}
