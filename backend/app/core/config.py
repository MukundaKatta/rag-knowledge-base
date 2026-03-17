from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    app_name: str = "RAG Knowledge Base"
    anthropic_api_key: str = ""
    chroma_persist_dir: str = "./data/chroma"
    upload_dir: str = "./data/uploads"
    database_url: str = "sqlite+aiosqlite:///./data/db/rag.db"
    cors_origins: str = "http://localhost:5173"

    # Embedding
    embedding_model: str = "all-MiniLM-L6-v2"

    # Chunking
    chunk_size: int = 512
    chunk_overlap: int = 50

    # Retrieval
    top_k: int = 10
    rerank_top_k: int = 5
    mmr_lambda: float = 0.7

    # LLM
    llm_model: str = "claude-sonnet-4-20250514"
    max_tokens: int = 4096
    temperature: float = 0.3

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
