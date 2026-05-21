import { useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient, putToStorage } from '@shared/services/api-client';
import { EP } from '@shared/constants/endpoints';

import { webUsageQueryKey } from './use-web-usage.ts';
import type { UploadResult, WebPresignResponse } from '../types/upload.ts';

// The full anonymous upload flow as one mutation:
//   1. POST /web/uploads/presign  → presigned PUT URL + public URL + remaining
//   2. PUT the bytes directly to storage (backend never sees them)
//   3. resolve with the public URL for the UI to copy / store in history
// Errors (quota_exceeded, file_too_large, validation_error) surface as ApiError
// for the caller to map to inline messages.
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation<UploadResult, Error, File>({
    mutationFn: async (file) => {
      const presign = await apiClient.post<WebPresignResponse>(
        EP.WEB.PRESIGN,
        {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
          size: file.size,
        },
        { fingerprint: true },
      );

      await putToStorage(presign.upload_url, file);

      return {
        uploadId: presign.upload_id,
        publicUrl: presign.public_url,
        filename: file.name,
        size: file.size,
        remaining: presign.remaining,
      };
    },
    onSuccess: () => {
      // Re-sync the server-authoritative usage count.
      void queryClient.invalidateQueries({ queryKey: webUsageQueryKey() });
    },
  });
}
