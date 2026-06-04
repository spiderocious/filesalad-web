import { apiClient } from '@shared/services/api-client';
import { EP } from '@shared/constants/endpoints';

import { DEFAULT_FLAGS, type FlagSnapshot, type FlagSource } from './types.ts';

// Server contract from docs/feature-flags-api.md.
interface FlagsResponse {
  readonly should_show_codes: boolean;
  readonly should_support_byok: boolean;
  // RFC3339 UTC.
  readonly expires_at: string;
}

// 10s skew margin per the doc: refetch a touch early so a near-expired snapshot
// doesn't briefly serve stale "on" past the server's window.
const SKEW_MS = 10_000;

// Real flag source — hits GET /features. Public endpoint (no auth header).
export function apiFlagSource(): FlagSource {
  return {
    async fetch(): Promise<FlagSnapshot> {
      const res = await apiClient.get<FlagsResponse>(EP.FEATURES);
      const expiresAt = Date.parse(res.expires_at);
      // If the server hand-rolled an invalid date, fall back to a short cache
      // rather than caching "until forever". 1 min is conservative.
      const safeExpiresAt = Number.isFinite(expiresAt) ? expiresAt : Date.now() + 60_000;
      return {
        flags: {
          shouldShowCodes: Boolean(res.should_show_codes),
          shouldSupportByok: Boolean(res.should_support_byok),
        },
        expiresAt: safeExpiresAt - SKEW_MS,
      };
    },
  };
}

// Test/offline source — yields a fixed snapshot that never expires until now()
// passes the supplied ttlMs. Default ttl = far future so the values stick.
export function staticFlagSource(
  flags: Partial<typeof DEFAULT_FLAGS> = {},
  ttlMs = 1000 * 60 * 60 * 24 * 365,
): FlagSource {
  return {
    fetch: async () => ({
      flags: { ...DEFAULT_FLAGS, ...flags },
      expiresAt: Date.now() + ttlMs,
    }),
  };
}
