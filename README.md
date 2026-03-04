# Property Management API (Backend)

REST API for Property Agent CRUD operations. TypeScript, Express, in-memory storage.

---

## Project structure

```
backend/
├── src/
│   ├── store/                    # Domain models & validation
│   │   └── propertyAgent.ts       # PropertyAgent types, Zod schemas
│   ├── repositories/             # Data access (interface + implementations)
│   │   ├── propertyAgentRepository.ts      # Interface (contract)
│   │   └── inMemoryPropertyAgentRepository.ts  # In-memory implementation
│   ├── service/                   # Business logic
│   │   └── propertyAgentService.ts
│   ├── routes/                   # HTTP layer (controllers)
│   │   └── propertyAgents.ts
│   ├── lib/                      # Shared utilities
│   │   └── errors.ts             # ApiError, zodDetails
│   ├── openapi.ts                # OpenAPI 3 spec for Swagger
│   ├── app.ts                    # Express app wiring
│   ├── index.ts                  # Server entry (listen)
│   └── __tests__/
│       └── propertyAgents.test.ts # Route integration tests
├── jest.config.cjs
├── tsconfig.json
└── package.json
```

---

## Architecture

### Layered design

| Layer        | Folder         | Responsibility |
|-------------|----------------|----------------|
| **Store**   | `store/`       | Domain shapes and validation (Zod). Single source of truth for “what is a PropertyAgent”. |
| **Repositories** | `repositories/` | How data is stored and retrieved. Interface + implementations (in-memory now; DB later). |
| **Service** | `service/`     | Business rules: uniqueness (e.g. email), not-found handling, orchestration. No HTTP, no storage details. |
| **Routes**  | `routes/`      | HTTP: parse body/params, validate with store schemas, call service, set status/headers, catch Zod and ApiError. |
| **App**     | `app.ts`       | Wire middleware, CORS, JSON, Swagger UI, routes; create repository and service; central error handler. |

Data flow: **Request → Route → Service → Repository → Store (types)**. Responses flow back the same way. Dependencies point inward: routes depend on service, service on repository interface, repository on store types.

### Dependency injection

The service does **not** create its own repository. The app does:

```ts
const repository = new InMemoryPropertyAgentRepository();
const service = new PropertyAgentService(repository);
```

So you can:

- **Test** the service with a fake repository (e.g. in-memory with pre-filled data or a mock).
- **Swap storage** (Postgres, MongoDB, another API) by adding a new class that implements `PropertyAgentRepository` and passing it in. No change to service or routes.

The service depends on the **interface** in `repositories/propertyAgentRepository.ts`, not on a concrete “memory” or database.

### Validation and errors

- **Input:** Zod schemas in `store/propertyAgent.ts` (create, replace, patch). Routes parse and on failure throw `ApiError` with `VALIDATION_ERROR` and structured `details`.
- **Output:** Central error handler in `app.ts` maps `ApiError` to HTTP status and a consistent JSON body (`code`, `message`, optional `details`). Unknown errors become 500 `INTERNAL_ERROR`.

So validation and error shape are consistent and documented (including in OpenAPI).

### API documentation

- OpenAPI 3 spec in `openapi.ts` describes all routes, request/response bodies, and error responses.
- Swagger UI is served at **`/api-docs`** so consumers can explore and try the API.

---

## Why this is production-level

1. **Clear structure** – New developers see where models, persistence, business logic, and HTTP live. Naming matches purpose (e.g. `repositories` = data access).
2. **Testability** – Routes are tested with `supertest` against a fresh app per test; the service can be unit-tested with a mock repository. No hidden globals or singletons.
3. **Maintainability** – Change validation in one place (store), add a new repository without touching service or routes, add new endpoints by adding routes and service methods.
4. **Scalability** – Same service and routes can sit in front of a real DB or another service by swapping the repository implementation and configuration.
5. **Observability and contract** – OpenAPI documents the contract; health and error responses are consistent. You can add logging, metrics, or tracing at the app or route layer without touching business logic.
6. **Type safety** – TypeScript and Zod give end-to-end types from request body to repository and back, reducing runtime bugs and making refactors safer.

This layout follows common production patterns: layered architecture, repository abstraction, dependency injection, structured errors, and documented API—ready to add persistence, auth, or new domains without a rewrite.

---

## Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Start dev server (tsx watch) |
| `npm run build`| Compile TypeScript to `dist/` |
| `npm start`    | Run compiled app           |
| `npm test`     | Run Jest tests             |
| `npm run test:watch` | Jest in watch mode   |

---

## Error contract (for frontend)

All 4xx/5xx responses use a single JSON shape with `error.code` so the frontend can show concrete errors. See **[docs/api-errors.md](docs/api-errors.md)** for codes, response shape, and suggested frontend handling.

---

## API overview

| Method | Path                         | Description        |
|--------|------------------------------|--------------------|
| GET    | `/health`                    | Health check       |
| GET    | `/api-docs`                  | Swagger UI         |
| GET    | `/api/property-agents`       | List all agents    |
| POST   | `/api/property-agents`       | Create agent       |
| GET    | `/api/property-agents/:id`   | Get one agent      |
| PUT    | `/api/property-agents/:id`   | Replace agent      |
| PATCH  | `/api/property-agents/:id`   | Partial update     |
| DELETE | `/api/property-agents/:id`   | Delete agent       |

Property Agent fields: `id`, `firstName`, `lastName`, `email`, `mobileNumber`, `createdAt`, `updatedAt`. Create/Replace require all four core fields; PATCH accepts any subset.
