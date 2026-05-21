import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@shared/services/api-client';
import { EP } from '@shared/constants/endpoints';

import type { WebUsage } from '../types/upload.ts';

export const webUsageQueryKey = () => ['web-usage'] as const;

// The server-authoritative remaining count (X-Fingerprint scoped). The
// IndexedDB cache is for instant UI only and is never the source of truth.
export function useWebUsage() {
  return useQuery({
    queryKey: webUsageQueryKey(),
    queryFn: () => apiClient.get<WebUsage>(EP.WEB.USAGE, { fingerprint: true }),
    staleTime: 30_000,
  });
}
