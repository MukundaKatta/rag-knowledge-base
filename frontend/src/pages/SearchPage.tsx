import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSearch } from '@/hooks/useSearch';
import * as api from '@/lib/api';
import type { Collection } from '@/types';

export default function SearchPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [input, setInput] = useState('');
  const { results, loading, query, search } = useSearch();

  useEffect(() => {
    api.getCollections().then(setCollections).catch(console.error);
  }, []);

  const handleSearch = () => {
    if (input.trim()) {
      search(input, selectedCollection || undefined);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Semantic Search</h2>

      <div className="flex gap-3 mb-6">
        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">All collections</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <div className="flex-1 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search your knowledge base..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-gray-400">Searching...</p>}

      {query && !loading && (
        <p className="text-sm text-gray-500 mb-4">
          {results.length} results for "{query}"
        </p>
      )}

      <div className="space-y-3">
        {results.map((r, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">{r.document_name}</span>
              <span className="text-xs text-gray-400">
                Score: {(r.score * 100).toFixed(1)}% &middot; Chunk #{r.chunk_index}
              </span>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {r.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
