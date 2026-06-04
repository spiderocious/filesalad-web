import { useQuery, type QueryClient, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { DEFAULT_FLAGS, type FeatureFlags, type FlagSource } from './types.ts';

export const featureFlagsQueryKey = () => ['feature-flags'] as const;

interface FeatureFlagsContextValue {
  readonly flags: FeatureFlags;
  // True until the first fetch settles. Consumers ignore this and read flags —
  // defaults (all-false) apply during boot, so the gate behaviour is safe.
  readonly isLoading: boolean;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null);

interface ProviderProps {
  readonly source: FlagSource;
  readonly children: ReactNode;
}

// The flag provider — wraps the app once, reads from any FlagSource, and
// schedules refetches off the server's expires_at. Consumers go through the
// named hooks (use-share-codes-enabled, use-byok-enabled) and never see this.
//
// Caching strategy: we use staleTime: 0 + refetchInterval driven by the
// snapshot's expiresAt, so the network call only fires when the server's hint
// says to. Fail-open: a fetch error leaves React Query holding the previous
// successful data (and DEFAULT_FLAGS if there was none).
export function FeatureFlagsProvider({ source, children }: ProviderProps) {
  const query = useQuery({
    queryKey: featureFlagsQueryKey(),
    queryFn: () => source.fetch(),
    refetchInterval: (q) => {
      const snap = q.state.data;
      if (!snap) return false;
      const wait = snap.expiresAt - Date.now();
      // Clamp so a misconfigured TTL can't either DDoS the backend (too low) or
      // park us on stale flags forever (negative).
      return Math.max(30_000, wait);
    },
    // Fail open: keep showing the last-known good snapshot if a refetch fails.
    placeholderData: (previous) => previous,
    retry: 1,
  });

  const value = useMemo<FeatureFlagsContextValue>(
    () => ({
      flags: query.data?.flags ?? DEFAULT_FLAGS,
      isLoading: query.isLoading,
    }),
    [query.data, query.isLoading],
  );

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>;
}

// Internal — named hooks (use-share-codes-enabled etc.) wrap this so consumers
// never reach for the bag-of-flags directly.
export function useFeatureFlags(): FeatureFlagsContextValue {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return ctx;
}

// Imperative invalidation, for tests or "refetch now" affordances.
export function invalidateFeatureFlags(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: featureFlagsQueryKey() });
}

// React Query's `useQueryClient` re-export so call sites don't need a second
// import just to invalidate.
export { useQueryClient };
