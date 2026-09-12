import path from "path"
import fs from "fs"

// Tipos opcionales
export interface Producto {
  id: string
  nombre: string
  imagen: string
  precio: number
  categoria: string
}

export interface Categoria {
  id: number
  categoria: string
}

// Rutas absolutas
const productosPath = path.resolve(process.cwd(), "data", "productos.json")
const categoriasPath = path.resolve(process.cwd(), "data", "categorias.json")

// Lectura de archivos
export const arrayProductos: Producto[] = JSON.parse(fs.readFileSync(productosPath, "utf8"))
export const arrayCategorias: Categoria[] = JSON.parse(fs.readFileSync(categoriasPath, "utf8"))

// Debug
// console.log("Productos cargados:", arrayProductos.length)
// console.log("Categorías cargadas:", arrayCategorias.length)
