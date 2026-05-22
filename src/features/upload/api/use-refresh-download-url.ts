import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client';
import { EP } from '@shared/constants/endpoints';

import type { WebDownloadResponse } from '../types/upload.ts';

export interface FreshUrl {
  readonly url: string;
  readonly expiresAt: string;
}

// Fetches a fresh presigned download URL for an upload (GET
// /web/uploads/:id/download). Used when the cached URL is expired. A 404 means
// the object is gone (older than the link-expiry window) — surfaced as ApiError
// 'not_found' for the caller to show "this file has expired".
export function useRefreshDownloadUrl() {
  return useMutation<FreshUrl, Error, string>({
    mutationFn: async (uploadId) => {
      const res = await apiClient.get<WebDownloadResponse>(EP.WEB.DOWNLOAD(uploadId), {
        fingerprint: true,
      });
      return { url: res.download_url, expiresAt: res.expires_at };
    },
  });
}
