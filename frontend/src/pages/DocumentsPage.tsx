import { useState, useEffect, useCallback } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import * as api from '@/lib/api';
import UploadZone from '@/components/UploadZone';
import DocumentCard from '@/components/DocumentCard';
import ChunkPreview from '@/components/ChunkPreview';
import ProcessingStatus from '@/components/ProcessingStatus';
import type { Collection, Chunk, ProcessingProgress } from '@/types';

export default function DocumentsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const { documents, loading, upload, remove, watchProgress } = useDocuments(selectedCollection || undefined);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);
  const [selectedDocChunks, setSelectedDocChunks] = useState<Chunk[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  useEffect(() => {
    api.getCollections().then(setCollections).catch(console.error);
  }, []);

  const handleUpload = useCallback(
    async (files: File[]) => {
      if (!selectedCollection) return;
      for (const file of files) {
        try {
          const doc = await upload(file, selectedCollection);
          watchProgress(doc.id, (p) => setProgress(p));
        } catch (err) {
          console.error('Upload failed', err);
        }
      }
    },
    [selectedCollection, upload, watchProgress],
  );

  const handleSelectDoc = useCallback(async (docId: string) => {
    setSelectedDocId(docId);
    try {
      const chunks = await api.getDocumentChunks(docId);
      setSelectedDocChunks(chunks);
    } catch (err) {
      console.error(err);
      setSelectedDocChunks([]);
    }
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Documents</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upload and list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white flex-1"
            >
              <option value="">All collections</option>
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <UploadZone onUpload={handleUpload} disabled={!selectedCollection} />

          {progress && progress.status !== 'completed' && (
            <ProcessingStatus progress={progress} />
          )}

          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-gray-400">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents yet. Upload some files to get started.</p>
            ) : (
              documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={remove}
                  onSelect={handleSelectDoc}
                />
              ))
            )}
          </div>
        </div>

        {/* Right: Chunk preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {selectedDocId ? 'Chunk Preview' : 'Select a document'}
          </h3>
          {selectedDocId ? (
            <ChunkPreview chunks={selectedDocChunks} />
          ) : (
            <p className="text-sm text-gray-400">Click on a document to view its chunks.</p>
          )}
        </div>
      </div>
    </div>
  );
}
