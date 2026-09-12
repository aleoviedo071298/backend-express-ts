# backend-express-ts

> REST API built with Node.js, TypeScript and Express — products and categories CRUD over JSON data files.

![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

## About

Academic backend project from the **Integraciones Web** course at UNER. Implements a typed REST API with Express 5 and TypeScript, reading product and category data from local JSON files. Covers typed data modeling, async error handling, and full CRUD with proper HTTP status codes.

## Tech Stack

| Layer | Detail |
|---|---|
| **Runtime** | Node.js LTS |
| **Language** | TypeScript (strict mode) |
| **Framework** | Express 5 |
| **Data** | JSON files (`data/productos.json`, `data/categorias.json`) |

## Setup

```bash
git clone https://github.com/aleoviedo071298/backend-express-ts.git
cd backend-express-ts
npm install
npm run build
npm start
```

## Scripts

| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |

## Endpoints

| Method | Route | Description | Status |
|---|---|---|---|
| GET | `/` | Health check | 200 |
| GET | `/productos` | Get all products | 200 |
| GET | `/productos/:id` | Get product by ID | 200 / 404 |
| POST | `/productos` | Create a new product | 201 / 400 |
| PUT | `/productos/:id` | Update a product | 200 / 400 / 404 |
| DELETE | `/productos/:id` | Delete a product | 204 / 404 |

## Project Structure

```
backend-express-ts/
├── src/
│   ├── data.ts       TypeScript interfaces + JSON file loading
│   └── server.ts     Express server and route definitions
├── data/
│   ├── productos.json
│   └── categorias.json
├── tsconfig.json
└── package.json
```

---

**Alejandro Oviedo** · [LinkedIn](https://www.linkedin.com/in/aleoviedo071298/) · [GitHub](https://github.com/aleoviedo071298)
