import path from "path";
import fs from "fs";
// Rutas absolutas
const productosPath = path.resolve(process.cwd(), "data", "productos.json");
const categoriasPath = path.resolve(process.cwd(), "data", "categorias.json");
// Lectura de archivos
export const arrayProductos = JSON.parse(fs.readFileSync(productosPath, "utf8"));
export const arrayCategorias = JSON.parse(fs.readFileSync(categoriasPath, "utf8"));
// Debug
// console.log("Productos cargados:", arrayProductos.length)
// console.log("Categorías cargadas:", arrayCategorias.length)
//# sourceMappingURL=data.js.map