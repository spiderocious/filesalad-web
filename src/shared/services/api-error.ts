import type { ApiErrorBody, ApiErrorCode } from '@shared/types/api';

// Thrown by the API client on any non-2xx response. Carries the stable `code`
// (switch on this, never on `message`) and any field-level validation errors.
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    if (body.field_errors) this.fieldErrors = body.field_errors;
  }

  is(code: ApiErrorCode): boolean {
    return this.code === code;
  }
}
