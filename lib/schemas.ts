import { z } from "zod"

export const clienteSchema = z.object({
  razonSocial: z.string().min(2, "Ingresá la razón social"),
  cuit: z.string().regex(/^\d{11}$/, "El CUIT debe tener 11 dígitos sin guiones"),
  email: z.string().email("Email inválido"),
  telefono: z.string().min(10, "Ingresá el teléfono con código de país (ej: 5491122334455)"),
  categoria: z.enum(["A", "B", "C"]).refine((v) => v !== undefined, "Seleccioná una categoría"),
  estado: z.enum(["activo", "inactivo", "moroso"]).refine((v) => v !== undefined, "Seleccioná un estado"),
  direccion: z.string().min(3, "Ingresá la dirección"),
  localidad: z.string().min(2, "Ingresá la localidad"),
  provincia: z.string().min(2, "Ingresá la provincia"),
})

export type ClienteFormData = z.infer<typeof clienteSchema>

export const comprobanteSchema = z.object({
  numero: z.string().min(3, "Ingresá el número de comprobante"),
  tipo: z.enum(["Factura A", "Factura B", "Factura C", "Nota de Débito", "Nota de Crédito", "Recibo"]),
  clienteId: z.string().min(1, "Seleccioná un cliente"),
  fechaEmision: z.string().min(1, "Ingresá la fecha de emisión"),
  fechaVencimiento: z.string().min(1, "Ingresá la fecha de vencimiento"),
  monto: z.coerce.number().positive("El monto debe ser mayor a 0"),
  moneda: z.enum(["ARS", "USD"]),
  estado: z.enum(["pendiente", "pagado", "vencido", "rechazado", "en_revision"]),
  descripcion: z.string().min(5, "Ingresá una descripción"),
  metodoPago: z.enum(["transferencia", "mercadopago", "efectivo", "cheque"]).optional(),
  notasInternas: z.string().optional(),
})

export type ComprobanteFormData = z.infer<typeof comprobanteSchema>

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Contraseña incorrecta"),
})

export type LoginFormData = z.infer<typeof loginSchema>
