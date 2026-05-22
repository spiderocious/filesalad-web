import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';

import { createTestWrapper } from '@shared/test-utils/create-test-wrapper.tsx';

import { UploadScreen } from '../upload-screen.tsx';

function renderScreen() {
  return render(<UploadScreen />, { wrapper: createTestWrapper() });
}

// Desktop history is the right sidebar (toggled from the top bar). The top-bar
// toggle is `hidden md:inline-flex` and the sidebar is `hidden md:block`, so in
// jsdom (no viewport) both are display:none — query with { hidden: true } to
// assert presence/mount. Mobile history (the bottom bar) is covered separately.
describe('UploadScreen', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it('renders the brand wordmark and the drop target', () => {
    renderScreen();
    expect(screen.getByText('salad')).toBeInTheDocument();
    expect(screen.getByLabelText(/drop, paste, or click/i)).toBeInTheDocument();
  });

  it('renders the mobile history bar', () => {
    renderScreen();
    expect(screen.getByRole('button', { name: /history \(\d+\)/i })).toBeInTheDocument();
  });

  it('keeps the desktop history sidebar unmounted for a first-time visitor', async () => {
    renderScreen();
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /show history/i, hidden: true }),
      ).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: /close history/i, hidden: true }),
    ).not.toBeInTheDocument();
  });

  it('mounts the desktop sidebar when the top-bar toggle is clicked', async () => {
    const user = userEvent.setup();
    renderScreen();
    // Wait until seeding settles to the first-time-visitor closed state, so the
    // toggle deterministically reads "Show history" before we click it.
    const toggle = await screen.findByRole('button', { name: /show history/i, hidden: true });
    await user.click(toggle);
    expect(
      await screen.findByRole('button', { name: /close history/i, hidden: true }),
    ).toBeInTheDocument();
  });
});
