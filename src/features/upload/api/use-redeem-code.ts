import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client';
import { EP } from '@shared/constants/endpoints';

import type { RedeemResponse } from '../types/upload.ts';

export interface RedeemedFile {
  readonly filename: string;
  readonly url: string;
  readonly expiresAt: string;
}

// Redeems a share code (GET /share/:code). Public, rate-limited per IP. A 404
// means the code is unknown or expired (indistinguishable, by design); 429 means
// too many attempts — both surfaced as ApiError for the caller to map inline.
export function useRedeemCode() {
  return useMutation<RedeemedFile, Error, string>({
    mutationFn: async (code) => {
      const res = await apiClient.get<RedeemResponse>(EP.SHARE.REDEEM(code.trim().toUpperCase()));
      return { filename: res.filename, url: res.download_url, expiresAt: res.expires_at };
    },
  });
}
