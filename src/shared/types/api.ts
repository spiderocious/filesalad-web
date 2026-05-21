// The backend's single response envelope (see docs/api-docs.md). Success
// carries `data` (+ optional `meta`); failure carries `error`.
export interface ApiMeta {
  readonly next_cursor: string | null;
  readonly has_more: boolean;
}

export interface ApiSuccess<T> {
  readonly data: T;
  readonly meta?: ApiMeta;
}

// Stable error codes — clients switch on `code`, never on `message`.
export type ApiErrorCode =
  | 'validation_error'
  | 'unauthorized'
  | 'invalid_credentials'
  | 'token_expired'
  | 'token_invalid'
  | 'forbidden'
  | 'quota_exceeded'
  | 'not_found'
  | 'conflict'
  | 'email_exists'
  | 'file_too_large'
  | 'rate_limited'
  | 'storage_unavailable'
  | 'internal';

export interface ApiErrorBody {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly field_errors?: Readonly<Record<string, readonly string[]>>;
}

export interface ApiFailure {
  readonly error: ApiErrorBody;
}
