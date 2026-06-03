import { renderHook, waitFor } from '@testing-library/react';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';

import { HistoryProvider } from '../../providers/history-provider.tsx';
import { appendHistory } from '../history-db.ts';
import { writeHistoryEnabled } from '../history-preference.ts';
import { useSidebarState } from '../use-sidebar-state.ts';

function wrapper({ children }: { children: ReactNode }) {
  return <HistoryProvider>{children}</HistoryProvider>;
}

describe('useSidebarState default-open', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
    // History is off by default — clear any leftover preference from prior tests.
    writeHistoryEnabled(false);
  });

  it('is closed by default for a first-time visitor (no history)', async () => {
    const { result } = renderHook(() => useSidebarState(), { wrapper });
    // Wait past the initial IndexedDB read.
    await waitFor(() => expect(result.current.isOpen).toBe(false));
    expect(result.current.isOpen).toBe(false);
  });

  it('is open by default when history is on and has entries', async () => {
    // History is opt-in (off by default), so this scenario only applies after
    // the user has turned it on.
    writeHistoryEnabled(true);
    await appendHistory({
      id: 'up_1',
      filename: 'a.png',
      key: 'f_a.png',
      size: 10,
      timestamp: '2026-05-21T10:00:00.000Z',
      cachedUrl: 'https://x/a',
      cachedExpiresAt: '2026-05-22T14:00:00Z',
    });

    const { result } = renderHook(() => useSidebarState(), { wrapper });
    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });

  it('toggles on demand', async () => {
    const { result } = renderHook(() => useSidebarState(), { wrapper });
    await waitFor(() => expect(result.current.isOpen).toBe(false));
    result.current.toggle();
    await waitFor(() => expect(result.current.isOpen).toBe(true));
  });
});
