import express from "express"
import { GeneralController } from "./controllers/general.controller.js"
import { ProductosController } from "./controllers/productos.controller.js"
import { CategoriasController } from "./controllers/categorias.controller.js"
import { CustomersController } from "./controllers/customers.controller.js"
import { AuthMiddleware } from "./middlewares/auth.middleware.js"

const app = express()
const PORT = process.env.PORT || 3000

//middleware de autenticacion: valida el token Bearer antes de llegar al controller
const auth = AuthMiddleware.verifyToken()

//middleware para parsear el cuerpo de las solicitudes como JSON
app.use(express.json())

//rutas para productos (protegidas)
app.use("/productos", auth)
app.get("/productos", ProductosController.getAllProductos())
app.get("/productos/:id", ProductosController.getProductoById())
app.post("/productos", ProductosController.createProducto())
app.delete("/productos/:id", ProductosController.deleteProducto())
app.put("/productos/:id", ProductosController.updateProducto())

//rutas para categorias (protegidas)
app.use("/categorias", auth)
app.get("/categorias", CategoriasController.getAllCategories())
app.get("/categorias/:id", CategoriasController.getCategoryById())
app.post("/categorias", CategoriasController.createCategory())
app.delete("/categorias/:id", CategoriasController.deleteCategory())
app.put("/categorias/:id", CategoriasController.updateCategory())

//rutas para customers (protegidas; el alta POST /customers es publica)
app.get("/customers", auth, CustomersController.getAllCustomers())
app.get("/customers/:id", auth, CustomersController.getCustomerById())
app.delete("/customers/:id", auth, CustomersController.deleteCustomer())
app.put("/customers/:id", auth, CustomersController.updateCustomer())

//ruta de login
app.post("/login", CustomersController.login())

//ruta para validar el token del login
app.post("/validate-token", CustomersController.validateToken())

//ruta para crear un nuevo customer
app.post("/customers", CustomersController.createCustomer())

//ruta raiz de testeo
app.get("/", GeneralController.root())

//ruta para identificar cuando un endpoint no existe
app.use(GeneralController.notFound())

//middleware para manejar errores (debe ir al final)
app.use(GeneralController.errorHandler())

//iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})