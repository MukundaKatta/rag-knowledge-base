from pydantic import BaseModel, Field
from datetime import datetime


# --- Collection ---
class CollectionCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str = ""


class CollectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None


class CollectionResponse(BaseModel):
    id: str
    name: str
    description: str
    document_count: int = 0
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Document ---
class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_type: str
    file_size: int
    collection_id: str
    status: str
    chunk_count: int
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Chunk ---
class ChunkResponse(BaseModel):
    id: str
    document_id: str
    content: str
    chunk_index: int
    start_char: int
    end_char: int
    metadata_json: dict | None = None

    model_config = {"from_attributes": True}


# --- Chat ---
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: str | None = None
    collection_id: str | None = None


class CitationData(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str
    content: str
    score: float
    chunk_index: int


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    citations: list[CitationData] | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationResponse(BaseModel):
    id: str
    title: str
    collection_id: str | None = None
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] = []

    model_config = {"from_attributes": True}


class ConversationListItem(BaseModel):
    id: str
    title: str
    collection_id: str | None = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


# --- Search ---
class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    collection_id: str | None = None
    top_k: int = 10


class SearchResult(BaseModel):
    chunk_id: str
    document_id: str
    document_name: str
    content: str
    score: float
    chunk_index: int


# --- Settings ---
class SettingsResponse(BaseModel):
    chunk_size: int
    chunk_overlap: int
    top_k: int
    rerank_top_k: int
    mmr_lambda: float
    llm_model: str
    max_tokens: int
    temperature: float
    embedding_model: str


class SettingsUpdate(BaseModel):
    chunk_size: int | None = None
    chunk_overlap: int | None = None
    top_k: int | None = None
    rerank_top_k: int | None = None
    mmr_lambda: float | None = None
    max_tokens: int | None = None
    temperature: float | None = None
