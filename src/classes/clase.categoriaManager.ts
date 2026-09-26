import { arrayCategorias, categoriasPath, guardarJSON } from "../data.js"
import type { Categoria } from "../data.js"

export class CategoriaManager {
    //devuelve todas las categorias
    static obtenerTodas = (): Categoria[] => arrayCategorias

    //busca una categoria por su id
    static obtenerPorId = (id: number): Categoria | undefined => {
        return arrayCategorias.find(cat => Number(cat.id) === id)
    }

    //crea una categoria con id autoincremental y la persiste
    static crear = (categoria: string): Categoria => {
        const maxId = Math.max(0, ...arrayCategorias.map(cat => Number(cat.id)))
        const nuevaCategoria: Categoria = { id: maxId + 1, categoria }
        arrayCategorias.push(nuevaCategoria)
        guardarJSON(categoriasPath, arrayCategorias)
        return nuevaCategoria
    }

    //actualiza una categoria existente; devuelve undefined si no existe
    static actualizar = (id: number, categoria: string): Categoria | undefined => {
        const categoriaEncontrada = CategoriaManager.obtenerPorId(id)
        if (!categoriaEncontrada) return undefined
        categoriaEncontrada.categoria = categoria
        guardarJSON(categoriasPath, arrayCategorias)
        return categoriaEncontrada
    }

    //elimina una categoria; devuelve false si no existe
    static eliminar = (id: number): boolean => {
        const indice = arrayCategorias.findIndex(cat => Number(cat.id) === id)
        if (indice === -1) return false
        arrayCategorias.splice(indice, 1)
        guardarJSON(categoriasPath, arrayCategorias)
        return true
    }
}
