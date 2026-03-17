import { Loader2 } from 'lucide-react';
import type { ProcessingProgress } from '@/types';

interface Props {
  progress: ProcessingProgress | null;
}

const stepLabels: Record<string, string> = {
  waiting: 'Waiting...',
  extracting: 'Extracting text...',
  chunking: 'Splitting into chunks...',
  embedding: 'Generating embeddings...',
  storing: 'Storing in vector database...',
  done: 'Complete!',
  error: 'Failed',
};

export default function ProcessingStatus({ progress }: Props) {
  if (!progress) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        {progress.status === 'processing' && (
          <Loader2 size={16} className="text-blue-500 animate-spin" />
        )}
        <span className="text-sm font-medium text-blue-700">
          {stepLabels[progress.step] || progress.step}
        </span>
      </div>
      <div className="w-full bg-blue-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
      {progress.error && (
        <p className="text-xs text-red-500 mt-2">{progress.error}</p>
      )}
    </div>
  );
}
