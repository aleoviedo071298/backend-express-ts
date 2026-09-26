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

export interface Customer {
  id: string
  nombre: string
  email: string
  password: string
  token: string
}

// Rutas absolutas
export const productosPath = path.resolve(process.cwd(), "data", "productos.json")
export const categoriasPath = path.resolve(process.cwd(), "data", "categorias.json")
export const customersPath = path.resolve(process.cwd(), "data", "customers.json")

// Lectura de archivos
export const arrayProductos: Producto[] = JSON.parse(fs.readFileSync(productosPath, "utf8"))
export const arrayCategorias: Categoria[] = JSON.parse(fs.readFileSync(categoriasPath, "utf8"))
export const arrayCustomers: Customer[] = JSON.parse(fs.readFileSync(customersPath, "utf8"))

// Escritura de archivos (persiste los cambios de los managers)
export const guardarJSON = (ruta: string, datos: unknown): void => {
  fs.writeFileSync(ruta, JSON.stringify(datos, null, 2), "utf8")
}