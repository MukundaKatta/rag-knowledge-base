export interface Collection {
  id: string;
  name: string;
  description: string;
  document_count: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  collection_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  start_char: number;
  end_char: number;
  metadata_json: Record<string, unknown> | null;
}

export interface Citation {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  score: number;
  chunk_index: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[] | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface ConversationListItem {
  id: string;
  title: string;
  collection_id: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_name: string;
  content: string;
  score: number;
  chunk_index: number;
}

export interface Settings {
  chunk_size: number;
  chunk_overlap: number;
  top_k: number;
  rerank_top_k: number;
  mmr_lambda: number;
  llm_model: string;
  max_tokens: number;
  temperature: number;
  embedding_model: string;
}

export interface ProcessingProgress {
  status: string;
  step: string;
  progress: number;
  error?: string;
}

export interface SSEEvent {
  type: 'meta' | 'sources' | 'token' | 'error' | 'done';
  conversation_id?: string;
  sources?: Citation[];
  content?: string;
  citations?: Citation[];
}
