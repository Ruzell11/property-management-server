import type { ZodError } from "zod";

// ---------------------------------------------------------------------------
// Error codes – single source of truth for backend and frontend
// Frontend can rely on these exact strings to show concrete error UIs
// ---------------------------------------------------------------------------

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR";

/** All error codes as constants so frontend can use without magic strings */
export const API_ERROR_CODES: Record<ApiErrorCode, ApiErrorCode> = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

/** Shape of validation details when code is VALIDATION_ERROR */
export type ValidationErrorDetail = { path: string; message: string };

/** JSON body the API returns on any error (4xx/5xx) */
export interface ApiErrorResponseBody {
  error: {
    code: ApiErrorCode;
    message: string;
    /** Present for VALIDATION_ERROR: array of { path, message } */
    details?: ValidationErrorDetail[] | unknown;
  };
}

// ---------------------------------------------------------------------------
// ApiError class and helpers
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(opts: { code: ApiErrorCode; status: number; message: string; details?: unknown }) {
    super(opts.message);
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
  }
}

export function zodDetails(err: ZodError): ValidationErrorDetail[] {
  return err.issues.map((i) => ({
    path: i.path.join("."),
    message: i.message,
  }));
}

