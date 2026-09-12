import express, {Request, Response} from "express"
import { arrayProductos, arrayCategorias } from "./data.js"
import type { Producto, Categoria } from "./data.js"

const app = express()
const PORT = process.env.PORT || 3000

//middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json())

//endpoint raiz de testeo
app.get("/", (req, res) => {
  res.json({ status: "success", mensaje: "API funcionando correctamente" })
})

//endpoint para obtener todos los productos
app.get("/productos", (req: Request, res: Response) => {
    try {
        return res.status(200)
            .json(arrayProductos)
    } catch (error) {
        return res.status(500)
            .json({ success: false,
                message: "Ocurrio un error al obtener los productos" })
    }
})

//endpoint para obtener un producto por su id
app.get("/productos/:id", (req: Request, res: Response) => {
    const productoId = req.params.id
    try {
        const productoEncontrado: Producto | undefined = arrayProductos.find(prod => prod.id === productoId)
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
})

//endpoint para cargar un nuevo producto
app.post("/productos", (req: Request, res: Response) => {
    try {
        const { nombre, imagen, precio, categoria } = req.body as Partial<Producto>
        if(!nombre || !imagen || !precio || !categoria) {
            return res.status(400)
                .json({ success: false,
                    message: "Faltan datos obligatorios para crear el producto" })
        }
        const nuevoProducto: Producto = {
            id: String(arrayProductos.length + 1),
            nombre: nombre,
            imagen: imagen,
            precio: precio,
            categoria: categoria
        }
        arrayProductos.push(nuevoProducto)
        return res.status(201)
            .json({ success: true,
                message: "Producto creado correctamente",
                producto: nuevoProducto })
    } catch (error) {
        return res.status(500)
            .json({ success: false,
                message: "Error interno del servidor" })
    }
     
})

//endpoint para actualizar un producto por su id
app.put("/productos/:id", (req: Request, res: Response) => {
    try {
        const productoId = req.params.id
        const { nombre, imagen, precio, categoria } = req.body as Partial<Producto>
        if (!productoId || !nombre || !imagen || !precio || !categoria) {
            return res.status(400)
                .json({ success: false,
                    message: "Faltan datos obligatorios para actualizar el producto" })
        }
        const indice = arrayProductos.findIndex(prod => prod.id === productoId)
        const producto = arrayProductos[indice]
        if (!producto) {
            return res.status(404)
                .json({ success: false,
                    message: "Producto no encontrado" })
        }
        producto.nombre = nombre
        producto.imagen = imagen
        producto.precio = precio
        producto.categoria = categoria
        return res.status(200)
            .json({ success: true,
                message: "Producto actualizado correctamente",
                producto: producto })
    } catch (error) {
        return res.status(500)
            .json({ success: false,
                message: "Error interno del servidor" })
    }
})

//endpoint para eliminar un producto por su id
app.delete("/productos/:id", (req: Request, res: Response) => {
    try {
        const productoId = req.params.id
        const indice = arrayProductos.findIndex(prod => prod.id === productoId)
        if (indice === -1) {
            return res.status(404)
                .json({ success: false,
                    message: "Producto no encontrado" })
        }
        arrayProductos.splice(indice, 1)
        return res.status(204).send()
    } catch (error) {
        return res.status(500)
            .json({ success: false,
                message: "Error interno del servidor" })
    }
})

//endpoint para identificar cuando un endpoint no existe
app.use((req: Request, res: Response) => {
    res.status(404).json({ status: "error", mensaje: "Ruta no encontrada" })
})

//iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})