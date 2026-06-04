import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useSidebarState } from '../use-sidebar-state.ts';

// History is opt-in and the sidebar is now a pure user-driven toggle — no
// history-driven seed. Closed until the user opens it.
describe('useSidebarState', () => {
  it('is closed by default', () => {
    const { result } = renderHook(() => useSidebarState());
    expect(result.current.isOpen).toBe(false);
  });

  it('opens and closes on demand', async () => {
    const { result } = renderHook(() => useSidebarState());

    result.current.open();
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    result.current.close();
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });

  it('toggles between open and closed', async () => {
    const { result } = renderHook(() => useSidebarState());

    result.current.toggle();
    await waitFor(() => expect(result.current.isOpen).toBe(true));

    result.current.toggle();
    await waitFor(() => expect(result.current.isOpen).toBe(false));
  });
});
