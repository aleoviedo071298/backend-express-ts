import { z } from "zod"
import { emailRequerido, textoRequerido } from "./common.schema.js"

//datos que acepta la API al registrar o actualizar un customer
export const customerInputSchema = z.object({
  nombre: textoRequerido("nombre", "Alejandro Oviedo"),
  email: emailRequerido,
  password: z
    .string({ error: "password es obligatorio y debe ser texto" })
    .min(6, "password debe tener al menos 6 caracteres")
    .meta({
      example: "unaPasswordSegura",
      description: "Se guarda hasheada con bcryptjs; nunca se devuelve"
    })
})

//login: no exige longitud minima, solo que las credenciales no vengan vacias
export const loginInputSchema = z.object({
  email: emailRequerido,
  password: z
    .string({ error: "password es obligatorio y debe ser texto" })
    .min(1, "password no puede estar vacio")
    .meta({ example: "unaPasswordSegura" })
})

//vista publica de un customer: sin password ni token
export const customerSchema = z.object({
  id: z.uuid().meta({
    example: "1295d78a-69bf-4339-add0-cec2d2c1559c",
    description: "UUID asignado por el servidor",
    readOnly: true
  }),
  ...customerInputSchema.omit({ password: true }).shape
}).meta({ description: "Vista publica de un customer: la password y el token nunca se devuelven" })

export type CustomerInput = z.infer<typeof customerInputSchema>
export type LoginInput = z.infer<typeof loginInputSchema>
