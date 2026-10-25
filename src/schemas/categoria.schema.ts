import { z } from "zod"
import { textoRequerido } from "./common.schema.js"

//datos que acepta la API al crear o actualizar una categoria
export const categoriaInputSchema = z.object({
  categoria: textoRequerido("categoria", "perifericos")
})

//categoria completa tal como la devuelve la API: el id lo asigna CategoriaManager
export const categoriaSchema = z.object({
  id: z
    .number()
    .int()
    .positive()
    .meta({
      example: 1,
      description: "Identificador autoincremental asignado por el servidor",
      readOnly: true
    }),
  ...categoriaInputSchema.shape
})

export type CategoriaInput = z.infer<typeof categoriaInputSchema>
