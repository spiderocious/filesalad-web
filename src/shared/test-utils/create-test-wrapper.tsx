import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { staticFlagSource } from '@shared/feature-flags/api-flag-source';
import {
  featureFlagsQueryKey,
  FeatureFlagsProvider,
} from '@shared/feature-flags/feature-flags-provider';
import { DEFAULT_FLAGS, type FeatureFlags } from '@shared/feature-flags/types';

interface WrapperOptions {
  // Override specific flags for a test — defaults are all-false (matching the
  // production fail-safe). Pass e.g. { shouldShowCodes: true } to flip one.
  readonly flags?: Partial<FeatureFlags>;
}

// Fresh QueryClient per render, retries off, so tests are isolated and fail
// fast instead of retrying a mocked error. Includes FeatureFlagsProvider with
// the snapshot SYNCHRONOUSLY seeded into the cache so flag-gated UI renders
// correctly on the very first render (instead of one async tick later).
export function createTestWrapper(options: WrapperOptions = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const flags: FeatureFlags = { ...DEFAULT_FLAGS, ...options.flags };
  queryClient.setQueryData(featureFlagsQueryKey(), {
    flags,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 365,
  });
  const source = staticFlagSource(flags);
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <FeatureFlagsProvider source={source}>{children}</FeatureFlagsProvider>
      </QueryClientProvider>
    );
  };
}
