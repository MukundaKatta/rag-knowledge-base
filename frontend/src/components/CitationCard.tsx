import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';
import type { Citation } from '@/types';

interface Props {
  citation: Citation;
}

export default function CitationCard({ citation }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors"
      >
        <FileText size={12} className="text-blue-500 flex-shrink-0" />
        <span className="font-medium text-gray-700 truncate flex-1 text-left">
          {citation.document_name}
        </span>
        <span className="text-gray-400">
          Score: {(citation.score * 100).toFixed(0)}%
        </span>
        {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {expanded && (
        <div className="px-3 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-600 whitespace-pre-wrap">
          {citation.content}
        </div>
      )}
    </div>
  );
}
