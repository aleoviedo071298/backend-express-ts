import { Request, Response } from "express"
import type { Customer } from "../data.js"
import { CustomerManager } from "../classes/clase.customerManager.js"

export class CustomersController {
    //endpoint para obtener todos los customers
    static getAllCustomers = () => async (req: Request, res: Response) => {
        try {
            return res.status(200)
                .json(CustomerManager.obtenerTodos())
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Ocurrio un error al obtener los customers" })
        }
    }

    //endpoint para obtener un customer por su id
    static getCustomerById = () => async (req: Request, res: Response) => {
        try {
            const customerEncontrado = CustomerManager.obtenerPorId(req.params.id as string)
            if (customerEncontrado) {
                return res.status(200)
                    .json(customerEncontrado)
            } else {
                return res.status(404)
                    .json({ success: false,
                        message: "Customer no encontrado" })
            }
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para registrar un nuevo customer
    static createCustomer = () => async (req: Request, res: Response) => {
        try {
            const { nombre, email, password } = req.body as Partial<Customer>
            if (!nombre || !email || !password) {
                return res.status(400)
                    .json({ success: false,
                        message: "Faltan datos obligatorios para crear el customer" })
            }
            const resultado = await CustomerManager.crear({ nombre, email, password })
            if (!resultado.ok) {
                return res.status(409)
                    .json({ success: false,
                        message: "Ya existe un customer con ese email" })
            }
            return res.status(201)
                .json({ success: true,
                    message: "Customer creado correctamente",
                    customer: resultado.customer })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para actualizar un customer por su id
    static updateCustomer = () => async (req: Request, res: Response) => {
        try {
            const { nombre, email, password } = req.body as Partial<Customer>
            if (!nombre || !email || !password) {
                return res.status(400)
                    .json({ success: false,
                        message: "Faltan datos obligatorios para actualizar el customer" })
            }
            const resultado = await CustomerManager.actualizar(req.params.id as string,{ nombre, email, password })
            if (!resultado.ok) {
                return resultado.motivo === "no_encontrado"
                    ? res.status(404)
                        .json({ success: false,
                            message: "Customer no encontrado" })
                    : res.status(409)
                        .json({ success: false,
                            message: "Ya existe un customer con ese email" })
            }
            return res.status(200)
                .json({ success: true,
                    message: "Customer actualizado correctamente",
                    customer: resultado.customer })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para eliminar un customer por su id
    static deleteCustomer = () => async (req: Request, res: Response) => {
        try {
            if (!CustomerManager.eliminar(req.params.id as string)) {
                return res.status(404)
                    .json({ success: false,
                        message: "Customer no encontrado" })
            }
            return res.status(204).send()
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint de login: valida email y password
    static login = () => async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body as Partial<Customer>
            if (!email || !password) {
                return res.status(400)
                    .json({ success: false,
                        message: "Email y password son obligatorios" })
            }
            const resultado = await CustomerManager.login(email, password)
            if (!resultado) {
                return res.status(401)
                    .json({ success: false,
                        message: "Credenciales invalidas" })
            }
            return res.status(200)
                .json({ success: true,
                    message: "Login correcto",
                    customer: resultado.customer,
                    token: resultado.token })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para validar un token enviado como "Authorization: Bearer <token>"
    static validateToken = () => async (req: Request, res: Response) => {
        try {
            const token = (req.headers.authorization ?? "").replace(/^Bearer\s+/i, "")
            const resultado = await CustomerManager.validateToken(token)
            return res.status(resultado.success ? 200 : 401)
                .json(resultado)
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }
}
