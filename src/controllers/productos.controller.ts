import { Request, Response } from "express"
import type { ProductoInput } from "../schemas/producto.schema.js"
import { ProductoManager } from "../classes/clase.productoManager.js"

export class ProductosController {
//endpoint para obtener todos los productos
    static getAllProductos = () => async (req: Request, res: Response) => {
        try {
            return res.status(200)
                .json(ProductoManager.obtenerTodos())
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Ocurrio un error al obtener los productos" })
        }
    }

//endpoint para obtener un producto por su id
    static getProductoById = () => async (req: Request, res: Response) => {
        try {
            const productoEncontrado = ProductoManager.obtenerPorId(String(req.params.id))
            if (productoEncontrado) {
                return res.status(200)
                    .json(productoEncontrado)
            } else {
                return res.status(404)
                    .json({ success: false,
                        message: "Producto no encontrado" })
            }
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

//endpoint para cargar un nuevo producto
    static createProducto = () => async (req: Request, res: Response) => {
        try {
            //el body ya viene validado y normalizado por ValidateMiddleware
            const nuevoProducto = ProductoManager.crear(req.body as ProductoInput)
            return res.status(201)
                .json({ success: true,
                    message: "Producto creado correctamente",
                    producto: nuevoProducto })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

//endpoint para actualizar un producto por su id
    static updateProducto = () => async (req: Request, res: Response) => {
        try {
            //el body ya viene validado y normalizado por ValidateMiddleware
            const producto = ProductoManager.actualizar(String(req.params.id), req.body as ProductoInput)
            if (!producto) {
                return res.status(404)
                    .json({ success: false,
                        message: "Producto no encontrado" })
            }
            return res.status(200)
                .json({ success: true,
                    message: "Producto actualizado correctamente",
                    producto: producto })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

//endpoint para eliminar un producto por su id
    static deleteProducto = () => async (req: Request, res: Response) => {
        try {
            if (!ProductoManager.eliminar(String(req.params.id))) {
                return res.status(404)
                    .json({ success: false,
                        message: "Producto no encontrado" })
            }
            return res.status(204).send()
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }
}
