import { Request, Response, NextFunction } from "express"
import type { ZodError, ZodType } from "zod"

//schemas opcionales por cada parte de la request que se quiera validar
export interface EsquemasValidacion {
  body?: ZodType
  params?: ZodType
}

export class ValidateMiddleware {
  //convierte los issues de zod en pares { campo, mensaje } faciles de consumir desde el front
  private static formatear = (error: ZodError) =>
    error.issues.map(issue => ({
      campo: issue.path.join(".") || "body",
      mensaje: issue.message
    }))

  private static rechazar = (res: Response, message: string, error: ZodError) =>
    res.status(400).json({
      success: false,
      message,
      errors: ValidateMiddleware.formatear(error)
    })

  //middleware reutilizable: valida params y body antes de llegar al controller
  static validate =
    (esquemas: EsquemasValidacion) => (req: Request, res: Response, next: NextFunction) => {
      if (esquemas.params) {
        const resultado = esquemas.params.safeParse(req.params)
        if (!resultado.success) {
          return ValidateMiddleware.rechazar(res, "Parametros invalidos", resultado.error)
        }
      }
      if (esquemas.body) {
        const resultado = esquemas.body.safeParse(req.body)
        if (!resultado.success) {
          return ValidateMiddleware.rechazar(res, "Datos invalidos", resultado.error)
        }
        //los datos validados reemplazan al body crudo: ya vienen recortados,
        //el email en minusculas y sin las claves que no estan en el schema
        req.body = resultado.data
      }
      return next()
    }
}
