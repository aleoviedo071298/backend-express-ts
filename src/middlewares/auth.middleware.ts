import { Request, Response, NextFunction } from "express"
import { CustomerManager } from "../classes/clase.customerManager.js"

export class AuthMiddleware {
    //middleware reutilizable: exige "Authorization: Bearer <token>" y lo valida contra SECRET_ENCRYPTION
    static verifyToken = () => async (req: Request, res: Response, next: NextFunction) => {
        try {
            //si no hay token, error
            const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "").trim()
            if (!token) {
                return res.status(401)
                    .json({ success: false,
                        message: "Token requerido" })
            }
            //si hay token, se valida con validateToken (usa process.env.SECRET_ENCRYPTION)
            const resultado = await CustomerManager.validateToken(token)
            //si el resultado no esta OK, error
            if (!resultado.success) {
                return res.status(401)
                    .json(resultado)
            }
            //si esta OK, dejo pasar
            return next()
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }
}
