import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

import { ENV } from '@shared/config/env';
import { EP } from '@shared/constants/endpoints';
import { createTestWrapper } from '@shared/test-utils/create-test-wrapper.tsx';
import { server } from '@shared/test-utils/server.ts';

import { HistoryProvider, useHistory } from '../../providers/history-provider.tsx';
import { useCopyHistoryUrl } from '../use-copy-history-url.ts';
import type { HistoryEntry } from '../../types/history.ts';

const base = `${ENV.API_BASE_URL}/api/v1`;

function freshEntry(): HistoryEntry {
  return {
    id: 'up_test',
    filename: 'a.png',
    key: 'f_test.png',
    size: 10,
    timestamp: '2026-05-22T10:00:00Z',
    cachedUrl: 'https://files.example.com/cached.png',
    cachedExpiresAt: '2099-01-01T00:00:00Z', // far future → not expired
  };
}

function expiredEntry(): HistoryEntry {
  return { ...freshEntry(), cachedUrl: 'https://files.example.com/old.png', cachedExpiresAt: '2000-01-01T00:00:00Z' };
}

let lastCopied: string | null = null;

beforeEach(() => {
  lastCopied = null;
  // jsdom has no clipboard; stub it so copyToClipboard resolves true.
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn(async (text: string) => { lastCopied = text; }) },
  });
});

function wrapper({ children }: { children: ReactNode }) {
  const Q = createTestWrapper();
  return (
    <Q>
      <HistoryProvider>{children}</HistoryProvider>
    </Q>
  );
}

describe('useCopyHistoryUrl', () => {
  it('copies the cached URL directly when not expired (no refetch)', async () => {
    const { result } = renderHook(() => useCopyHistoryUrl(), { wrapper });
    act(() => result.current.copy(freshEntry()));
    await waitFor(() => expect(result.current.status).toBe('copied'));
    expect(lastCopied).toBe('https://files.example.com/cached.png');
  });

  it('refetches a fresh URL when expired, copies it, and caches it back', async () => {
    const { result } = renderHook(
      () => ({ copy: useCopyHistoryUrl(), history: useHistory() }),
      { wrapper },
    );
    act(() => result.current.history.addEntry(expiredEntry()));

    act(() => result.current.copy.copy(expiredEntry()));
    await waitFor(() => expect(result.current.copy.status).toBe('copied'));
    expect(lastCopied).toBe('https://files.example.com/fresh.png?sig=new');
    // The entry's cache was updated with the fresh URL.
    await waitFor(() =>
      expect(result.current.history.entries[0]?.cachedUrl).toBe(
        'https://files.example.com/fresh.png?sig=new',
      ),
    );
  });

  it('shows an expired error when the refetch 404s', async () => {
    server.use(
      http.get(`${base}${EP.WEB.DOWNLOAD('up_test')}`, () =>
        HttpResponse.json({ error: { code: 'not_found', message: 'gone' } }, { status: 404 }),
      ),
    );
    const { result } = renderHook(() => useCopyHistoryUrl(), { wrapper });
    act(() => result.current.copy(expiredEntry()));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toMatch(/expired/i);
  });
});
