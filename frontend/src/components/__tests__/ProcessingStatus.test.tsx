import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProcessingStatus from '../ProcessingStatus';

describe('ProcessingStatus', () => {
  it('renders nothing when progress is null', () => {
    const { container } = render(<ProcessingStatus progress={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows extracting step', () => {
    render(
      <ProcessingStatus
        progress={{ status: 'processing', step: 'extracting', progress: 25 }}
      />,
    );
    expect(screen.getByText('Extracting text...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <ProcessingStatus
        progress={{ status: 'failed', step: 'error', progress: 0, error: 'Something went wrong' }}
      />,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
