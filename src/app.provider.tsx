import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useMemo, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { apiFlagSource } from '@shared/feature-flags/api-flag-source';
import { FeatureFlagsProvider } from '@shared/feature-flags/feature-flags-provider';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  // Constructed once per mount — swap apiFlagSource() for a different
  // implementation (remote-config, etc.) without any consumer change.
  const flagSource = useMemo(() => apiFlagSource(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <FeatureFlagsProvider source={flagSource}>
        <BrowserRouter>{children}</BrowserRouter>
      </FeatureFlagsProvider>
    </QueryClientProvider>
  );
}
