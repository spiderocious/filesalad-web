import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { ENV } from '@shared/config/env';
import { EP } from '@shared/constants/endpoints';
import { ApiError } from '@shared/services/api-error';
import { createTestWrapper } from '@shared/test-utils/create-test-wrapper.tsx';
import { server } from '@shared/test-utils/server.ts';

import { useUploadFile } from '../use-upload-file.ts';

const base = `${ENV.API_BASE_URL}/api/v1`;

function makeFile(): File {
  return new File(['x'], 'pic.png', { type: 'image/png' });
}

describe('useUploadFile', () => {
  it('presigns then uploads, resolving the public URL', async () => {
    const { result } = renderHook(() => useUploadFile(), { wrapper: createTestWrapper() });

    result.current.mutate(makeFile());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.publicUrl).toBe('https://files.example.com/f_test.png');
    expect(result.current.data?.remaining).toBe(48);
  });

  it('surfaces quota_exceeded as an ApiError', async () => {
    server.use(
      http.post(`${base}${EP.WEB.PRESIGN}`, () =>
        HttpResponse.json(
          { error: { code: 'quota_exceeded', message: 'Monthly cap reached' } },
          { status: 403 },
        ),
      ),
    );

    const { result } = renderHook(() => useUploadFile(), { wrapper: createTestWrapper() });
    result.current.mutate(makeFile());

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(ApiError);
    expect((result.current.error as ApiError).code).toBe('quota_exceeded');
  });
});
