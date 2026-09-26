# backend-express-ts

> REST API built with Node.js, TypeScript and Express — products, categories and customers CRUD over JSON data files, with token-based authentication.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

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
| GET | `/categorias/:id` | Get category by ID | 200 / 404 |
| POST | `/categorias` | Create a new category | 201 / 400 |
| PUT | `/categorias/:id` | Update a category | 200 / 400 / 404 |
| DELETE | `/categorias/:id` | Delete a category | 204 / 404 |

### Customers

| Method | Route | Description | Status |
|---|---|---|---|
| POST | `/customers` | Register a customer (public) | 201 / 400 / 409 |
| GET | `/customers` 🔒 | Get all customers | 200 |
| GET | `/customers/:id` 🔒 | Get customer by ID | 200 / 404 |
| PUT | `/customers/:id` 🔒 | Update a customer | 200 / 400 / 404 / 409 |
| DELETE | `/customers/:id` 🔒 | Delete a customer | 204 / 404 |

Unknown routes return `404` and invalid JSON bodies return `400`, both handled in `GeneralController`.

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
│   └── middlewares/
│       └── auth.middleware.ts         verifyToken
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
- **Cleanup**: removed unused imports from `server.ts`.
- **Git hygiene**: `node_modules/` and `dist/` are now ignored and untracked (`dist/` is regenerated with `npm run build`), along with `.env` files.

## Known Limitations

- Tokens do not expire and are not revoked on new login or logout.
- The middleware does not attach the authenticated user to `req`, so any logged-in customer can update or delete any other customer.
- `PUT /customers/:id` requires the password and re-hashes it on every update.
- JSON files are fine for learning, not for production persistence.

---

**Alejandro Oviedo** · [LinkedIn](https://www.linkedin.com/in/aleoviedo071298/) · [GitHub](https://github.com/aleoviedo071298)
