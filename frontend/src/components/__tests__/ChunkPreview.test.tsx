import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChunkPreview from '../ChunkPreview';

describe('ChunkPreview', () => {
  it('shows empty message when no chunks', () => {
    render(<ChunkPreview chunks={[]} />);
    expect(screen.getByText('No chunks available.')).toBeInTheDocument();
  });

  it('renders chunks', () => {
    const chunks = [
      {
        id: 'c1',
        document_id: 'd1',
        content: 'First chunk content',
        chunk_index: 0,
        start_char: 0,
        end_char: 19,
        metadata_json: null,
      },
      {
        id: 'c2',
        document_id: 'd1',
        content: 'Second chunk content',
        chunk_index: 1,
        start_char: 20,
        end_char: 40,
        metadata_json: null,
      },
    ];
    render(<ChunkPreview chunks={chunks} />);
    expect(screen.getByText('First chunk content')).toBeInTheDocument();
    expect(screen.getByText('Second chunk content')).toBeInTheDocument();
    expect(screen.getByText('Chunk #0')).toBeInTheDocument();
    expect(screen.getByText('Chunk #1')).toBeInTheDocument();
  });
});
