import { arrayProductos, productosPath, guardarJSON } from "../data.js"
import type { Producto } from "../data.js"

export type DatosProducto = Omit<Producto, "id">

export class ProductoManager {
    //devuelve todos los productos
    static obtenerTodos = (): Producto[] => arrayProductos

    //busca un producto por su id
    static obtenerPorId = (id: string): Producto | undefined => {
        return arrayProductos.find(prod => prod.id === id)
    }

    //crea un producto con id autoincremental y lo persiste
    static crear = (datos: DatosProducto): Producto => {
        const maxId = Math.max(0, ...arrayProductos.map(prod => Number(prod.id)))
        const nuevoProducto: Producto = { id: String(maxId + 1), ...datos }
        arrayProductos.push(nuevoProducto)
        guardarJSON(productosPath, arrayProductos)
        return nuevoProducto
    }

    //actualiza un producto existente; devuelve undefined si no existe
    static actualizar = (id: string, datos: DatosProducto): Producto | undefined => {
        const producto = ProductoManager.obtenerPorId(id)
        if (!producto) return undefined
        Object.assign(producto, datos)
        guardarJSON(productosPath, arrayProductos)
        return producto
    }

    //elimina un producto; devuelve false si no existe
    static eliminar = (id: string): boolean => {
        const indice = arrayProductos.findIndex(prod => prod.id === id)
        if (indice === -1) return false
        arrayProductos.splice(indice, 1)
        guardarJSON(productosPath, arrayProductos)
        return true
    }
}
