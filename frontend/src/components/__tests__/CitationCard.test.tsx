import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CitationCard from '../CitationCard';

const mockCitation = {
  chunk_id: 'c1',
  document_id: 'd1',
  document_name: 'test-doc.pdf',
  content: 'This is the citation content that should be expandable.',
  score: 0.92,
  chunk_index: 3,
};

describe('CitationCard', () => {
  it('renders document name and score', () => {
    render(<CitationCard citation={mockCitation} />);
    expect(screen.getByText('test-doc.pdf')).toBeInTheDocument();
    expect(screen.getByText('Score: 92%')).toBeInTheDocument();
  });

  it('expands to show content on click', () => {
    render(<CitationCard citation={mockCitation} />);
    expect(screen.queryByText(mockCitation.content)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText(mockCitation.content)).toBeInTheDocument();
  });

  it('collapses on second click', () => {
    render(<CitationCard citation={mockCitation} />);
    const btn = screen.getByRole('button');
    fireEvent.click(btn);
    expect(screen.getByText(mockCitation.content)).toBeInTheDocument();
    fireEvent.click(btn);
    expect(screen.queryByText(mockCitation.content)).not.toBeInTheDocument();
  });
});
