import type { Chunk } from '@/types';

interface Props {
  chunks: Chunk[];
}

export default function ChunkPreview({ chunks }: Props) {
  if (chunks.length === 0) {
    return <p className="text-sm text-gray-400">No chunks available.</p>;
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto">
      {chunks.map((chunk) => (
        <div key={chunk.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-blue-600">
              Chunk #{chunk.chunk_index}
            </span>
            <span className="text-xs text-gray-400">
              chars {chunk.start_char}-{chunk.end_char}
            </span>
          </div>
          <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
            {chunk.content}
          </p>
        </div>
      ))}
    </div>
  );
}
