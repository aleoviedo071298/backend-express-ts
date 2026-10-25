import { z } from "zod"
import type { JsonObject } from "swagger-ui-express"
import { productoInputSchema, productoSchema } from "../schemas/producto.schema.js"
import { categoriaInputSchema, categoriaSchema } from "../schemas/categoria.schema.js"
import { customerInputSchema, customerSchema, loginInputSchema } from "../schemas/customer.schema.js"

const PORT = process.env.PORT || 3000

//traduce un schema de zod a json schema compatible con openapi 3.0.
//se descarta additionalProperties: el middleware descarta las claves extra en vez de rechazarlas
const desdeZod = (esquema: z.ZodType) => {
  const { additionalProperties, ...jsonSchema } = z.toJSONSchema(esquema, { target: "openapi-3.0" })
  return jsonSchema
}

//referencia corta a un schema de components.schemas
const schema = (nombre: string) => ({ $ref: `#/components/schemas/${nombre}` })

//referencia corta a una respuesta reutilizable de components.responses
const respuesta = (nombre: string) => ({ $ref: `#/components/responses/${nombre}` })

//parametro de path reutilizable: el id viaja como string en productos/customers y como entero en categorias
const idParam = (tipo: "string" | "integer", descripcion: string) => ({
  name: "id",
  in: "path",
  required: true,
  description: descripcion,
  schema: { type: tipo }
})

//body JSON obligatorio apuntando a un schema
const bodyJSON = (nombre: string) => ({
  required: true,
  content: { "application/json": { schema: schema(nombre) } }
})

//respuesta con un schema de application/json
const okJSON = (descripcion: string, nombre: string) => ({
  description: descripcion,
  content: { "application/json": { schema: schema(nombre) } }
})

//respuesta con un array de un schema de application/json
const arrayJSON = (descripcion: string, nombre: string) => ({
  description: descripcion,
  content: { "application/json": { schema: { type: "array", items: schema(nombre) } } }
})

export const openapiSpec: JsonObject = {
  openapi: "3.0.3",
  info: {
    title: "backend-express-ts API",
    version: "1.0.0",
    description:
      "REST API built with Node.js, TypeScript and Express. Products, categories and customers CRUD over local JSON data files, with HMAC-SHA512 signed token authentication.\n\n" +
      "Protected routes require the header `Authorization: Bearer <token>`. Get a token from `POST /login` and paste it into the **Authorize** button above.",
    license: { name: "ISC" },
    contact: { name: "Alejandro Oviedo" }
  },
  servers: [
    { url: `http://localhost:${PORT}`, description: "Local development server" }
  ],
  tags: [
    { name: "General", description: "Health check and root endpoint" },
    { name: "Auth", description: "Login and token validation" },
    { name: "Productos", description: "Products CRUD (protected)" },
    { name: "Categorias", description: "Categories CRUD (protected)" },
    { name: "Customers", description: "Customers CRUD (sign up is public)" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        description: "Signed token returned by POST /login, sent as the Authorization: Bearer header."
      }
    },
    schemas: {
      //generados desde zod: los schemas de src/schemas son la unica fuente de verdad de los datos de entrada
      Producto: desdeZod(productoSchema),
      ProductoInput: desdeZod(productoInputSchema),
      ProductoRespuesta: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Producto creado correctamente" },
          producto: schema("Producto")
        }
      },
      Categoria: desdeZod(categoriaSchema),
      CategoriaInput: desdeZod(categoriaInputSchema),
      CategoriaRespuesta: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Categoria creada correctamente" },
          categoria: schema("Categoria")
        }
      },
      Customer: desdeZod(customerSchema),
      CustomerInput: desdeZod(customerInputSchema),
      CustomerRespuesta: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Customer creado correctamente" },
          customer: schema("Customer")
        }
      },
      LoginInput: desdeZod(loginInputSchema),
      LoginRespuesta: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Login correcto" },
          customer: schema("Customer"),
          token: {
            type: "string",
            description: "Signed token: base64url payload, a dot, and the HMAC-SHA512 signature"
          }
        }
      },
      TokenRespuesta: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Token valido" }
        }
      },
      ApiError: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error interno del servidor" }
        }
      },
      ValidacionError: {
        type: "object",
        description: "Returned when Zod rejects the request body or path params.",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Datos invalidos" },
          errors: {
            type: "array",
            description: "One entry per invalid field",
            items: {
              type: "object",
              properties: {
                campo: { type: "string", example: "precio" },
                mensaje: { type: "string", example: "precio no puede ser negativo" }
              }
            }
          }
        }
      },
      GeneralRespuesta: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          mensaje: { type: "string", example: "API funcionando correctamente" }
        }
      }
    },
    responses: {
      BadRequest: okJSON("Zod validation failed; the errors array lists each invalid field", "ValidacionError"),
      Unauthorized: okJSON("Missing, malformed or invalid token", "ApiError"),
      NotFound: okJSON("Resource not found", "ApiError"),
      Conflict: okJSON("A customer with that email already exists", "ApiError"),
      ServerError: okJSON("Internal server error", "ApiError"),
      NoContent: { description: "Deleted successfully. Empty body." }
    }
  },
  //las operaciones protegidas declaran security: [{ bearerAuth: [] }]; el resto queda publico
  paths: {
    "/": {
      get: {
        tags: ["General"],
        summary: "Health check",
        description: "Public root endpoint used to verify that the API is up.",
        responses: {
          200: okJSON("API is running", "GeneralRespuesta")
        }
      }
    },
    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and get a token",
        description:
          "Validates email and password, generates a signed token, persists it on the customer and returns it.",
        requestBody: bodyJSON("LoginInput"),
        responses: {
          200: okJSON("Login successful", "LoginRespuesta"),
          400: respuesta("BadRequest"),
          401: okJSON("Invalid credentials", "ApiError"),
          500: respuesta("ServerError")
        }
      }
    },
    "/validate-token": {
      post: {
        tags: ["Auth"],
        summary: "Validate a token",
        description:
          "Reads the token from the Authorization header and checks its HMAC-SHA512 signature. Takes no request body.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: okJSON("Token is valid", "TokenRespuesta"),
          401: okJSON("Invalid token format or signature", "ApiError"),
          500: respuesta("ServerError")
        }
      }
    },
    "/productos": {
      get: {
        tags: ["Productos"],
        summary: "List all products",
        security: [{ bearerAuth: [] }],
        responses: {
          200: arrayJSON("Array of products", "Producto"),
          401: respuesta("Unauthorized"),
          500: respuesta("ServerError")
        }
      },
      post: {
        tags: ["Productos"],
        summary: "Create a product",
        security: [{ bearerAuth: [] }],
        requestBody: bodyJSON("ProductoInput"),
        responses: {
          201: okJSON("Product created", "ProductoRespuesta"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          500: respuesta("ServerError")
        }
      }
    },
    "/productos/{id}": {
      parameters: [idParam("string", "Product UUID")],
      get: {
        tags: ["Productos"],
        summary: "Get a product by id",
        security: [{ bearerAuth: [] }],
        responses: {
          200: okJSON("Product found", "Producto"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      },
      put: {
        tags: ["Productos"],
        summary: "Update a product by id",
        description: "Full replacement: every field is required.",
        security: [{ bearerAuth: [] }],
        requestBody: bodyJSON("ProductoInput"),
        responses: {
          200: okJSON("Product updated", "ProductoRespuesta"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      },
      delete: {
        tags: ["Productos"],
        summary: "Delete a product by id",
        security: [{ bearerAuth: [] }],
        responses: {
          204: respuesta("NoContent"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      }
    },
    "/categorias": {
      get: {
        tags: ["Categorias"],
        summary: "List all categories",
        security: [{ bearerAuth: [] }],
        responses: {
          200: arrayJSON("Array of categories", "Categoria"),
          401: respuesta("Unauthorized"),
          500: respuesta("ServerError")
        }
      },
      post: {
        tags: ["Categorias"],
        summary: "Create a category",
        security: [{ bearerAuth: [] }],
        requestBody: bodyJSON("CategoriaInput"),
        responses: {
          201: okJSON("Category created", "CategoriaRespuesta"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          500: respuesta("ServerError")
        }
      }
    },
    "/categorias/{id}": {
      parameters: [idParam("integer", "Category numeric id; a non-numeric value returns 400")],
      get: {
        tags: ["Categorias"],
        summary: "Get a category by id",
        security: [{ bearerAuth: [] }],
        responses: {
          200: okJSON("Category found", "Categoria"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      },
      put: {
        tags: ["Categorias"],
        summary: "Update a category by id",
        security: [{ bearerAuth: [] }],
        requestBody: bodyJSON("CategoriaInput"),
        responses: {
          200: okJSON("Category updated", "CategoriaRespuesta"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      },
      delete: {
        tags: ["Categorias"],
        summary: "Delete a category by id",
        security: [{ bearerAuth: [] }],
        responses: {
          204: respuesta("NoContent"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      }
    },
    "/customers": {
      get: {
        tags: ["Customers"],
        summary: "List all customers",
        security: [{ bearerAuth: [] }],
        responses: {
          200: arrayJSON("Array of customers, without password or token", "Customer"),
          401: respuesta("Unauthorized"),
          500: respuesta("ServerError")
        }
      },
      post: {
        tags: ["Customers"],
        summary: "Sign up a new customer",
        description:
          "Public endpoint. Hashes the password with bcryptjs and stores the customer with an empty token until the first login.",
        requestBody: bodyJSON("CustomerInput"),
        responses: {
          201: okJSON("Customer created", "CustomerRespuesta"),
          400: respuesta("BadRequest"),
          409: respuesta("Conflict"),
          500: respuesta("ServerError")
        }
      }
    },
    "/customers/{id}": {
      parameters: [idParam("string", "Customer UUID")],
      get: {
        tags: ["Customers"],
        summary: "Get a customer by id",
        security: [{ bearerAuth: [] }],
        responses: {
          200: okJSON("Customer found", "Customer"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      },
      put: {
        tags: ["Customers"],
        summary: "Update a customer by id",
        description: "Full replacement: nombre, email and password are all required. The password is rehashed.",
        security: [{ bearerAuth: [] }],
        requestBody: bodyJSON("CustomerInput"),
        responses: {
          200: okJSON("Customer updated", "CustomerRespuesta"),
          400: respuesta("BadRequest"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          409: respuesta("Conflict"),
          500: respuesta("ServerError")
        }
      },
      delete: {
        tags: ["Customers"],
        summary: "Delete a customer by id",
        security: [{ bearerAuth: [] }],
        responses: {
          204: respuesta("NoContent"),
          401: respuesta("Unauthorized"),
          404: respuesta("NotFound"),
          500: respuesta("ServerError")
        }
      }
    }
  }
}
