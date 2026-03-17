import { useState, useCallback } from 'react';
import * as api from '@/lib/api';
import type { SearchResult } from '@/types';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const search = useCallback(async (q: string, collectionId?: string, topK?: number) => {
    if (!q.trim()) return;
    setLoading(true);
    setQuery(q);
    try {
      const res = await api.searchDocuments(q, collectionId, topK);
      setResults(res);
    } catch (err) {
      console.error('Search failed', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
  }, []);

  return { results, loading, query, search, clearResults };
}
