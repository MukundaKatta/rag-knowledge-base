const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Collections
export const getCollections = () => request<import('@/types').Collection[]>('/collections');
export const createCollection = (data: { name: string; description?: string }) =>
  request<import('@/types').Collection>('/collections', { method: 'POST', body: JSON.stringify(data) });
export const getCollection = (id: string) => request<import('@/types').Collection>(`/collections/${id}`);
export const updateCollection = (id: string, data: { name?: string; description?: string }) =>
  request<import('@/types').Collection>(`/collections/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCollection = (id: string) =>
  request<void>(`/collections/${id}`, { method: 'DELETE' });

// Documents
export const getDocuments = (collectionId?: string) =>
  request<import('@/types').Document[]>(`/documents${collectionId ? `?collection_id=${collectionId}` : ''}`);
export const getDocument = (id: string) => request<import('@/types').Document>(`/documents/${id}`);
export const getDocumentChunks = (id: string) => request<import('@/types').Chunk[]>(`/documents/${id}/chunks`);
export const deleteDocument = (id: string) =>
  request<void>(`/documents/${id}`, { method: 'DELETE' });

export async function uploadDocument(file: File, collectionId: string): Promise<import('@/types').Document> {
  const form = new FormData();
  form.append('file', file);
  form.append('collection_id', collectionId);
  const res = await fetch(`${API_BASE}/documents`, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }
  return res.json();
}

// Chat
export const getConversations = () => request<import('@/types').ConversationListItem[]>('/chat/conversations');
export const getConversation = (id: string) => request<import('@/types').Conversation>(`/chat/conversations/${id}`);
export const deleteConversation = (id: string) =>
  request<void>(`/chat/conversations/${id}`, { method: 'DELETE' });

// Search
export const searchDocuments = (query: string, collectionId?: string, topK?: number) =>
  request<import('@/types').SearchResult[]>('/search', {
    method: 'POST',
    body: JSON.stringify({ query, collection_id: collectionId, top_k: topK }),
  });

// Settings
export const getSettings = () => request<import('@/types').Settings>('/settings');
export const updateSettings = (data: Partial<import('@/types').Settings>) =>
  request<import('@/types').Settings>('/settings', { method: 'PUT', body: JSON.stringify(data) });

// Analytics
export const getAnalytics = () => request<Record<string, unknown>>('/analytics');
