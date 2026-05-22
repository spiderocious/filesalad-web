import { useCallback, useState } from 'react';

import { copyToClipboard } from 'file-salad-ui-lib';

import { ApiError } from '@shared/services/api-error';
import { isUrlExpired } from '@shared/utils/url-expiry.ts';

import { useRefreshDownloadUrl } from '../api/use-refresh-download-url.ts';
import { useHistory } from '../providers/history-provider.tsx';
import type { HistoryEntry } from '../types/history.ts';

// Copy state for a single history row's button.
export type CopyStatus = 'idle' | 'loading' | 'copied' | 'error';

interface CopyController {
  readonly status: CopyStatus;
  readonly errorMessage: string | null;
  readonly copy: (entry: HistoryEntry) => void;
}

const COPIED_RESET_MS = 1600;

// Expiry-aware copy (docs/url-expiry.md): if the cached URL is still valid, copy
// it; otherwise refetch a fresh download URL (loading state), cache it back, and
// copy that. A 404 means the file is gone → row error. One controller per row.
export function useCopyHistoryUrl(): CopyController {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const refresh = useRefreshDownloadUrl();
  const { updateEntry } = useHistory();

  const finishCopied = useCallback(async (url: string) => {
    const ok = await copyToClipboard(url);
    if (!ok) {
      setStatus('error');
      setErrorMessage('Could not copy to clipboard.');
      return;
    }
    setStatus('copied');
    window.setTimeout(() => setStatus('idle'), COPIED_RESET_MS);
  }, []);

  const copy = useCallback(
    (entry: HistoryEntry) => {
      setErrorMessage(null);

      if (!isUrlExpired(entry.cachedExpiresAt)) {
        setStatus('loading');
        void finishCopied(entry.cachedUrl);
        return;
      }

      setStatus('loading');
      refresh.mutate(entry.id, {
        onSuccess: (fresh) => {
          updateEntry(entry.id, { cachedUrl: fresh.url, cachedExpiresAt: fresh.expiresAt });
          void finishCopied(fresh.url);
        },
        onError: (error) => {
          setStatus('error');
          setErrorMessage(
            error instanceof ApiError && error.is('not_found')
              ? 'This file has expired.'
              : 'Could not refresh the link. Please try again.',
          );
        },
      });
    },
    [finishCopied, refresh, updateEntry],
  );

  return { status, errorMessage, copy };
}
