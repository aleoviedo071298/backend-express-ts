import { z } from "zod"

//texto obligatorio: recorta espacios y rechaza cadenas vacias
export const textoRequerido = (campo: string, ejemplo: string) =>
  z
    .string({ error: `${campo} es obligatorio y debe ser texto` })
    .trim()
    .min(1, `${campo} no puede estar vacio`)
    .meta({ example: ejemplo })

//email obligatorio: normaliza (trim + minusculas) y recien ahi valida el formato,
//en el mismo orden que CustomerManager.normalizarEmail
export const emailRequerido = z
  .string({ error: "email es obligatorio y debe ser texto" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "email debe tener un formato valido" }))
  .meta({ example: "alejandro@example.com" })

//id numerico que viaja como string en el path (/categorias/:id)
export const idNumericoParamsSchema = z.object({
  id: z.coerce
    .number({ error: "el id debe ser un numero" })
    .int("el id debe ser un numero entero")
    .positive("el id debe ser mayor a cero")
})
