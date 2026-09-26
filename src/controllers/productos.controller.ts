import { Request, Response } from "express"
import type { Producto } from "../data.js"
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
            const { nombre, imagen, precio, categoria } = req.body as Partial<Producto>
            if(!nombre || !imagen || precio === undefined || !categoria) {
                return res.status(400)
                    .json({ success: false,
                        message: "Faltan datos obligatorios para crear el producto" })
            }
            const nuevoProducto = ProductoManager.crear({ nombre, imagen, precio, categoria })
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
            const { nombre, imagen, precio, categoria } = req.body as Partial<Producto>
            if (!nombre || !imagen || precio === undefined || !categoria) {
                return res.status(400)
                    .json({ success: false,
                        message: "Faltan datos obligatorios para actualizar el producto" })
            }
            const producto = ProductoManager.actualizar(String(req.params.id), { nombre, imagen, precio, categoria })
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
