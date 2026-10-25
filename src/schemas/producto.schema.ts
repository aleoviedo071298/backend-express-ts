import { z } from "zod"
import { textoRequerido } from "./common.schema.js"

//datos que acepta la API al crear o actualizar un producto
export const productoInputSchema = z.object({
  nombre: textoRequerido("nombre", "Teclado mecanico"),
  imagen: textoRequerido("imagen", "⌨️"),
  precio: z
    .number({ error: "precio es obligatorio y debe ser un numero" })
    .nonnegative("precio no puede ser negativo")
    .meta({ example: 45900 }),
  categoria: textoRequerido("categoria", "perifericos")
})

//producto completo tal como lo devuelve la API: el id lo asigna ProductoManager
export const productoSchema = z.object({
  id: z.string().meta({
    example: "1",
    description: "Identificador autoincremental asignado por el servidor",
    readOnly: true
  }),
  ...productoInputSchema.shape
})

export type ProductoInput = z.infer<typeof productoInputSchema>
