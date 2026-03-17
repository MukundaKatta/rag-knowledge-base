import { FileText, Trash2, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Document } from '@/types';

interface Props {
  document: Document;
  onDelete: (id: string) => void;
  onSelect?: (id: string) => void;
}

const statusIcons = {
  pending: <Clock size={14} className="text-yellow-500" />,
  processing: <Loader2 size={14} className="text-blue-500 animate-spin" />,
  completed: <CheckCircle size={14} className="text-green-500" />,
  failed: <XCircle size={14} className="text-red-500" />,
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({ document: doc, onDelete, onSelect }: Props) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onSelect?.(doc.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileText size={18} className="text-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{doc.filename}</p>
            <p className="text-xs text-gray-400">
              {formatSize(doc.file_size)} &middot; {doc.file_type.toUpperCase()} &middot; {doc.chunk_count} chunks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {statusIcons[doc.status]}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(doc.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {doc.error_message && (
        <p className="text-xs text-red-500 mt-2 truncate">{doc.error_message}</p>
      )}
    </div>
  );
}
