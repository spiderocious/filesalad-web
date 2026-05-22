import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client';
import { EP } from '@shared/constants/endpoints';

import type { ShareCodeResponse } from '../types/upload.ts';

export interface ShareCode {
  readonly code: string;
  readonly expiresInSeconds: number;
}

// Mints a short share code for an upload (POST /share). Public — no auth. The
// code resolves to a fresh download URL for ~24h (re-redeemable while it lives).
export function useShareCode() {
  return useMutation<ShareCode, Error, string>({
    mutationFn: async (uploadId) => {
      const res = await apiClient.post<ShareCodeResponse>(EP.SHARE.CREATE, {
        upload_id: uploadId,
      });
      return { code: res.code, expiresInSeconds: res.expires_in };
    },
  });
}
