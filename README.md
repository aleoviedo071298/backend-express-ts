# backend-express-ts

> REST API built with Node.js, TypeScript and Express — products, categories and customers CRUD over JSON data files, with token-based authentication.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

## About

Academic backend project from the **Integraciones Web** course at UNER. Implements a typed REST API with Express 5 and TypeScript, reading and persisting data in local JSON files. Covers typed data modeling, layered architecture (routes → controllers → managers), async error handling, password hashing, signed-token authentication and full CRUD with proper HTTP status codes.

## Tech Stack

| Layer | Detail |
|---|---|
| **Runtime** | Node.js LTS |
| **Language** | TypeScript (strict mode) |
| **Framework** | Express 5 |
| **Data** | JSON files (`data/productos.json`, `data/categorias.json`, `data/customers.json`) |
| **Passwords** | `bcryptjs` (hash + compare) |
| **Tokens** | HMAC-SHA512 signed tokens (`crypto`) |
| **Validation** | `zod` schemas on every request body, reused to generate the OpenAPI input schemas |
| **API docs** | OpenAPI 3.0.3 spec served with Swagger UI (`swagger-ui-express`) |

## Setup

```bash
git clone https://github.com/aleoviedo071298/backend-express-ts.git
cd backend-express-ts
npm install
```

Create a `.env` file in the project root:

```env
SECRET_ENCRYPTION=your-long-random-secret
PORT=3000
```

`SECRET_ENCRYPTION` is required: it signs and validates tokens. Without it every protected request returns `401`. `PORT` is optional (defaults to `3000`).

Then build and run:

```bash
npm run build
npm start
```

## Scripts

| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server (loads `.env`) |
| `npm run dev` | Same as `start` (loads `.env`) |

## Validation

Every request body is parsed with a Zod schema before the controller runs. The schemas live in `src/schemas/` and `ValidateMiddleware.validate()` wires them into the routes:

```ts
app.post("/productos", validate({ body: productoInputSchema }), ProductosController.createProducto())
```

The same schemas feed the OpenAPI spec, so the input contract is defined once:

```ts
ProductoInput: desdeZod(productoInputSchema)   // src/docs/openapi.ts
```

What validation does:

| Rule | Effect |
|---|---|
| Required fields and types | A missing or wrong-typed field returns `400` instead of reaching the manager |
| `.trim()` on every string | `"  Teclado  "` is stored as `"Teclado"` |
| Email normalized then validated | `"  ALE@Mail.COM "` becomes `"ale@mail.com"`; a malformed address returns `400` |
| `password` minimum 6 characters | Only on register and update, not on login |
| Unknown keys | Stripped from the body before it reaches the controller |
| `/categorias/:id` | Coerced to a positive integer; a non-numeric id returns `400` instead of `404` |

The validated body replaces `req.body`, so controllers receive data that is already trimmed and normalized and no longer check for missing fields themselves.

A failed validation returns `400` with one entry per invalid field:

```json
{
  "success": false,
  "message": "Datos invalidos",
  "errors": [
    { "campo": "nombre", "mensaje": "nombre no puede estar vacio" },
    { "campo": "email", "mensaje": "email debe tener un formato valido" },
    { "campo": "password", "mensaje": "password debe tener al menos 6 caracteres" }
  ]
}
```

Path param failures use the same shape with `"message": "Parametros invalidos"`.

## API Documentation

With the server running:

| URL | Description |
|---|---|
| [`/api-docs`](http://localhost:3000/api-docs) | Interactive Swagger UI |
| [`/api-docs.json`](http://localhost:3000/api-docs.json) | Raw OpenAPI 3.0.3 spec (importable into Postman, Insomnia or client generators) |

The spec lives in `src/docs/openapi.ts`, so it compiles into `dist/` with the rest of the code and needs no runtime file scanning. Request schemas (`ProductoInput`, `CustomerInput`, …) are generated from the Zod schemas with `z.toJSONSchema()`, so Swagger always matches what the API actually accepts. Response schemas are written by hand.

To call protected endpoints from Swagger UI:

1. Expand `POST /login`, **Try it out**, send `{ email, password }` and copy the `token` from the response.
2. Click **Authorize** at the top of the page, paste the token (without the `Bearer ` prefix) and confirm.
3. Every 🔒 endpoint now sends `Authorization: Bearer <token>` automatically. `persistAuthorization` is enabled, so the token survives a page reload.

## Authentication

Protected routes require the header `Authorization: Bearer <token>`.

Flow:

1. **Register** — `POST /customers` with `{ nombre, email, password }`. The password is hashed with bcrypt, the id is a UUID and the stored `token` starts empty.
2. **Login** — `POST /login` with `{ email, password }`. If the password matches the stored hash, the server generates a token, saves it in the customer and returns `{ customer, token }`. A new token is generated on every login.
3. **Request** — send the token in the `Authorization` header. The `verifyToken` middleware validates it before the controller runs.

Token format: `payload.signature`

- `payload` = base64url of `{ customerId, customerName, customerEmail }`
- `signature` = HMAC-SHA512 of the payload using `SECRET_ENCRYPTION`

The middleware recalculates the signature and compares it with `timingSafeEqual`. It is stateless: it verifies the signature only, not the token stored in the customer.

Middleware responses:

| Case | Status | Message |
|---|---|---|
| No token | 401 | `Token requerido` |
| Bad format | 401 | `Formato de token inválido` |
| Bad signature | 401 | `Firma de token inválida` |
| `SECRET_ENCRYPTION` missing | 401 | `Secret no configurado` |
| Unexpected error | 500 | `Error interno del servidor` |

Customer responses never include `password` or `token` (except the token returned by `/login`).

## Endpoints

🔒 = requires `Authorization: Bearer <token>`

### General

| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/` | Health check | 200 |
| POST | `/login` | Log in, returns token | 200 / 400 / 401 |
| POST | `/validate-token` | Validate a Bearer token | 200 / 401 |

### Products 🔒

| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/productos` | Get all products | 200 |
| GET | `/productos/:id` | Get product by ID | 200 / 404 |
| POST | `/productos` | Create a new product | 201 / 400 |
| PUT | `/productos/:id` | Update a product | 200 / 400 / 404 |
| DELETE | `/productos/:id` | Delete a product | 204 / 404 |

### Categories 🔒

| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/categorias` | Get all categories | 200 |
| GET | `/categorias/:id` | Get category by ID | 200 / 400 / 404 |
| POST | `/categorias` | Create a new category | 201 / 400 |
| PUT | `/categorias/:id` | Update a category | 200 / 400 / 404 |
| DELETE | `/categorias/:id` | Delete a category | 204 / 400 / 404 |

### Customers

| Method | Route | Description | Status |
|---|---|---|---|
| POST | `/customers` | Register a customer (public) | 201 / 400 / 409 |
| GET | `/customers` 🔒 | Get all customers | 200 |
| GET | `/customers/:id` 🔒 | Get customer by ID | 200 / 404 |
| PUT | `/customers/:id` 🔒 | Update a customer | 200 / 400 / 404 / 409 |
| DELETE | `/customers/:id` 🔒 | Delete a customer | 204 / 404 |

Every `400` above comes from Zod and carries an `errors` array — see [Validation](#validation). Unknown routes return `404` and malformed JSON returns `400`, both handled in `GeneralController`.

## Project Structure

```
backend-express-ts/
├── src/
│   ├── server.ts          Express app, middleware and route definitions
│   ├── data.ts            TypeScript interfaces + JSON loading/saving
│   ├── controllers/       HTTP layer (request/response handling)
│   │   ├── general.controller.ts
│   │   ├── productos.controller.ts
│   │   ├── categorias.controller.ts
│   │   └── customers.controller.ts
│   ├── classes/           Business logic
│   │   ├── clase.productoManager.ts
│   │   ├── clase.categoriaManager.ts
│   │   ├── clase.customerManager.ts   register, login, token generation/validation
│   │   └── clase.AuthUtils.ts         UUID + bcrypt hash/compare
│   ├── middlewares/
│   │   ├── auth.middleware.ts         verifyToken
│   │   └── validate.middleware.ts     validate({ body, params }) con zod
│   ├── schemas/                       Zod schemas (fuente de verdad de los inputs)
│   │   ├── common.schema.ts           helpers compartidos (texto, email, id numerico)
│   │   ├── producto.schema.ts
│   │   ├── categoria.schema.ts
│   │   └── customer.schema.ts
│   └── docs/
│       └── openapi.ts                 OpenAPI 3.0.3 spec served at /api-docs
├── data/
│   ├── productos.json
│   ├── categorias.json
│   └── customers.json
├── postman/
│   └── backend-express-ts.postman_collection.json
├── tsconfig.json
└── package.json
```

## Changelog

- **Layered architecture**: logic split into `controllers/`, `classes/` (managers) and `middlewares/`; `server.ts` only wires routes.
- **Categories CRUD** added alongside products.
- **Customers module**: registration, listing, update and delete, persisted in `data/customers.json`. Passwords hashed with `bcryptjs`, ids generated as UUID, emails normalized (trim + lowercase) and unique.
- **Authentication**: `/login` issues an HMAC-SHA512 signed token; `/validate-token` checks it; `AuthMiddleware.verifyToken()` protects `/productos`, `/categorias` and customer read/update/delete routes.
- **Error handling**: global `notFound` and `errorHandler` middlewares (404 for unknown routes, 400 for malformed JSON, 500 otherwise).
- **Postman collection** added in `postman/`.
- **Swagger / OpenAPI**: typed OpenAPI 3.0.3 spec in `src/docs/openapi.ts` (18 operations, 15 schemas, `bearerAuth` security scheme), served as interactive docs at `/api-docs` and as raw JSON at `/api-docs.json`.
- **Zod validation**: schemas in `src/schemas/` + `ValidateMiddleware.validate()` on every route with a body. Controllers no longer check for missing fields; `400` responses now carry an `errors` array with one entry per invalid field. The same schemas generate the OpenAPI input schemas via `z.toJSONSchema()`.
- **Cleanup**: removed unused imports from `server.ts`.
- **Git hygiene**: `node_modules/` and `dist/` are now ignored and untracked (`dist/` is regenerated with `npm run build`), along with `.env` files.

## Known Limitations

- Tokens do not expire and are not revoked on new login or logout.
- The middleware does not attach the authenticated user to `req`, so any logged-in customer can update or delete any other customer.
- `PUT /customers/:id` requires the password and re-hashes it on every update.
- JSON files are fine for learning, not for production persistence.

---

**Alejandro Oviedo** · [LinkedIn](https://www.linkedin.com/in/aleoviedo071298/) · [GitHub](https://github.com/aleoviedo071298)
