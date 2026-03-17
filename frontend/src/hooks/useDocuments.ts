import { useState, useCallback, useEffect } from 'react';
import * as api from '@/lib/api';
import type { Document, ProcessingProgress } from '@/types';

export function useDocuments(collectionId?: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const docs = await api.getDocuments(collectionId);
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  const upload = useCallback(
    async (file: File, colId: string) => {
      const doc = await api.uploadDocument(file, colId);
      setDocuments((prev) => [doc, ...prev]);
      return doc;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    await api.deleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const watchProgress = useCallback(
    (documentId: string, onProgress: (p: ProcessingProgress) => void) => {
      const eventSource = new EventSource(`/api/documents/${documentId}/progress`);
      eventSource.onmessage = (event) => {
        const data: ProcessingProgress = JSON.parse(event.data);
        onProgress(data);
        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close();
          fetchDocuments();
        }
      };
      eventSource.onerror = () => eventSource.close();
      return () => eventSource.close();
    },
    [fetchDocuments],
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return { documents, loading, upload, remove, fetchDocuments, watchProgress };
}
