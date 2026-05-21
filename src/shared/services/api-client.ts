import { ENV } from '@shared/config/env';
import { getFingerprint } from '@shared/services/fingerprint';
import { ApiError } from '@shared/services/api-error';
import type { ApiFailure, ApiSuccess } from '@shared/types/api';

const API_PREFIX = '/api/v1';

type HttpMethod = 'GET' | 'POST';

interface RequestOptions {
  readonly body?: unknown;
  // Web one-pager routes require the browser fingerprint header.
  readonly fingerprint?: boolean;
}

async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.fingerprint) headers['X-Fingerprint'] = getFingerprint();

  const response = await fetch(`${ENV.API_BASE_URL}${API_PREFIX}${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const json = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!response.ok) {
    const failure = json as ApiFailure | null;
    if (failure?.error) throw new ApiError(response.status, failure.error);
    throw new ApiError(response.status, { code: 'internal', message: 'Request failed' });
  }

  return (json as ApiSuccess<T>).data;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, options),
  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),
};

// Uploads bytes directly to the presigned storage URL. This bypasses our
// backend entirely (it never sees the bytes) — so it's a bare PUT, not an
// envelope call. Throws on a non-2xx storage response.
export async function putToStorage(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!response.ok) {
    throw new ApiError(response.status, {
      code: 'storage_unavailable',
      message: 'Upload to storage failed',
    });
  }
}
