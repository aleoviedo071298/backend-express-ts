import { Request, Response } from "express"
import type { CategoriaInput } from "../schemas/categoria.schema.js"
import { CategoriaManager } from "../classes/clase.categoriaManager.js"

export class CategoriasController {
    //endpoint para obtener todas las categorias
    static getAllCategories = () => async (req: Request, res: Response) => {
        try {
            return res.status(200)
                .json(CategoriaManager.obtenerTodas())
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Ocurrio un error al obtener las categorias" })
        }
    }

    //endpoint para obtener una categoria por su id
    static getCategoryById = () => async (req: Request, res: Response) => {
        try {
            const categoriaEncontrada = CategoriaManager.obtenerPorId(Number(req.params.id))
            if (categoriaEncontrada) {
                return res.status(200)
                    .json(categoriaEncontrada)
            } else {
                return res.status(404)
                    .json({ success: false,
                        message: "Categoria no encontrada" })
            }
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para cargar una nueva categoria
    static createCategory = () => async (req: Request, res: Response) => {
        try {
            //el body ya viene validado y normalizado por ValidateMiddleware
            const { categoria } = req.body as CategoriaInput
            const nuevaCategoria = CategoriaManager.crear(categoria)
            return res.status(201)
                .json({ success: true,
                    message: "Categoria creada correctamente",
                    categoria: nuevaCategoria })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para actualizar una categoria por su id
    static updateCategory = () => async (req: Request, res: Response) => {
        try {
            //el body ya viene validado y normalizado por ValidateMiddleware
            const { categoria } = req.body as CategoriaInput
            const categoriaEncontrada = CategoriaManager.actualizar(Number(req.params.id), categoria)
            if (!categoriaEncontrada) {
                return res.status(404)
                    .json({ success: false,
                        message: "Categoria no encontrada" })
            }
            return res.status(200)
                .json({ success: true,
                    message: "Categoria actualizada correctamente",
                    categoria: categoriaEncontrada })
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }

    //endpoint para eliminar una categoria por su id
    static deleteCategory = () => async (req: Request, res: Response) => {
        try {
            if (!CategoriaManager.eliminar(Number(req.params.id))) {
                return res.status(404)
                    .json({ success: false,
                        message: "Categoria no encontrada" })
            }
            return res.status(204).send()
        } catch (error) {
            return res.status(500)
                .json({ success: false,
                    message: "Error interno del servidor" })
        }
    }
}
