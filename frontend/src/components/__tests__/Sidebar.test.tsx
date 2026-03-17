import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  it('renders the app title', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>,
    );
    expect(screen.getByText('RAG Knowledge Base')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>,
    );
    expect(screen.getByText('Chat')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Collections')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});
