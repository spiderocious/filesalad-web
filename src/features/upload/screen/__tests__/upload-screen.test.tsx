import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';

import { createTestWrapper } from '@shared/test-utils/create-test-wrapper.tsx';

import { UploadScreen } from '../upload-screen.tsx';

function renderScreen() {
  return render(<UploadScreen />, { wrapper: createTestWrapper() });
}

// The sidebar wrapper is `hidden md:block` — jsdom has no viewport so it stays
// display:none; query with { hidden: true } to assert it mounted vs. not.
describe('UploadScreen', () => {
  beforeEach(() => {
    indexedDB = new IDBFactory();
  });

  it('renders the brand wordmark and the drop target', () => {
    renderScreen();
    expect(screen.getByText('salad')).toBeInTheDocument();
    expect(screen.getByLabelText(/drop, paste, or click/i)).toBeInTheDocument();
  });

  it('keeps the history sidebar unmounted for a first-time visitor', async () => {
    renderScreen();
    // The top-bar toggle is always present; the sidebar (its Close button) is not.
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /show history/i })).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: /close history/i, hidden: true }),
    ).not.toBeInTheDocument();
  });

  it('mounts the history panel when the toggle is clicked', async () => {
    const user = userEvent.setup();
    renderScreen();
    await user.click(screen.getByRole('button', { name: /show history/i }));
    expect(
      await screen.findByRole('button', { name: /close history/i, hidden: true }),
    ).toBeInTheDocument();
  });
});
