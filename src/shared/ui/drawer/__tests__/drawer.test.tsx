import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Drawer } from '../drawer.tsx';

describe('Drawer', () => {
  it('renders content when open', () => {
    render(
      <Drawer open onClose={vi.fn()} title="History">
        <p>Drawer body</p>
      </Drawer>,
    );
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('closes on backdrop click when dismissable', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Drawer open onClose={onClose} dismissable>
        <p>Body</p>
      </Drawer>,
    );
    await user.click(screen.getAllByRole('button', { name: /close/i })[0]!);
    expect(onClose).toHaveBeenCalled();
  });
});
