import express, { Request, Response, NextFunction } from "express"
export class GeneralController {
    //endpoint raiz de testeo
    static root = () => async (req: Request, res: Response) => {
    res.json({ status: "success", mensaje: "API funcionando correctamente" })
    }
    //endpoint para identificar cuando un endpoint no existe
    static notFound = () => async (req: Request, res: Response) => {
        res.status(404).json({ status: "error", mensaje: "Ruta no encontrada" })
    }
    //middleware para manejar errores (debe tener 4 parametros para que express lo reconozca)
    static errorHandler = () => (err: any, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof SyntaxError && "body" in err) {
            return res.status(400).json({ status: "error", mensaje: "JSON invalido en el cuerpo de la solicitud" })
        }
        console.error(err)
        return res.status(err.status || 500).json({ status: "error", mensaje: "Error interno del servidor" })
    }
}
