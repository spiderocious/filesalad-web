import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UploadScreen } from '../upload-screen.tsx';

describe('UploadScreen', () => {
  it('renders the brand heading', () => {
    render(<UploadScreen />);
    expect(screen.getByRole('heading', { name: 'FileSalad' })).toBeInTheDocument();
  });

  it('renders the library drop zone', () => {
    render(<UploadScreen />);
    expect(screen.getByLabelText(/drop a file/i)).toBeInTheDocument();
  });

  it('renders the usage meter', () => {
    render(<UploadScreen />);
    expect(screen.getByText(/uploads this month/i)).toBeInTheDocument();
  });
});
