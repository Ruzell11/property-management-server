# API Error Contract (for Frontend)

All error responses (4xx/5xx) return this JSON shape so the frontend can show **concrete errors** by switching on `error.code`.

## Response shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body.",
    "details": []
  }
}
```

| Field       | Type     | Always present | Description |
|------------|----------|-----------------|-------------|
| `error.code`   | string   | Yes             | One of the codes below. Use this to decide UI (toast, inline field errors, etc.). |
| `error.message` | string | Yes             | Server message; can be shown as-is or replaced with your own copy. |
| `error.details` | array  | No              | For `VALIDATION_ERROR`: `[{ "path": "email", "message": "Invalid email" }]`. Omitted for other codes. |

## Error codes (single source of truth)

| Code               | HTTP | When | Frontend suggestion |
|--------------------|------|------|----------------------|
| `VALIDATION_ERROR` | 400  | Invalid body (missing/invalid fields) | Show `details` on the form (e.g. under each field by `path`). |
| `NOT_FOUND`        | 404  | Resource not found (e.g. agent id)   | “Not found” message or redirect to list. |
| `CONFLICT`         | 409  | Duplicate email (create/update)      | “This email is already in use” near the email field. |
| `INTERNAL_ERROR`   | 500  | Unexpected server error              | Generic “Something went wrong” and optional retry. |

## TypeScript (for frontend)

You can mirror the backend contract so types and codes stay in sync:

```ts
// Error codes – must match backend API_ERROR_CODES
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;

export interface ValidationErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorResponseBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: ValidationErrorDetail[];
  };
}
```

After any `fetch`/axios, check `res.ok`; if false, parse JSON and cast to `ApiErrorResponseBody`, then switch on `body.error.code` to show the right message or field errors.
