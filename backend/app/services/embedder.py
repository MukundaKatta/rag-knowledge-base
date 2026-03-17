"""Manage sentence-transformer embeddings and ChromaDB storage."""

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from app.core.config import settings

_model: SentenceTransformer | None = None
_client: chromadb.ClientAPI | None = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.embedding_model)
    return _model


def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
    return _client


def get_or_create_collection(collection_name: str):
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )


def embed_texts(texts: list[str]) -> list[list[float]]:
    model = get_model()
    embeddings = model.encode(texts, show_progress_bar=False, normalize_embeddings=True)
    return embeddings.tolist()


def add_chunks_to_chroma(
    collection_name: str,
    chunk_ids: list[str],
    texts: list[str],
    metadatas: list[dict],
):
    coll = get_or_create_collection(collection_name)
    embeddings = embed_texts(texts)
    coll.add(
        ids=chunk_ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
    )


def query_collection(
    collection_name: str,
    query: str,
    top_k: int = 10,
) -> dict:
    coll = get_or_create_collection(collection_name)
    query_emb = embed_texts([query])
    results = coll.query(
        query_embeddings=query_emb,
        n_results=min(top_k, coll.count()) if coll.count() > 0 else 1,
        include=["documents", "metadatas", "distances"],
    )
    return results


def delete_document_chunks(collection_name: str, document_id: str):
    coll = get_or_create_collection(collection_name)
    try:
        coll.delete(where={"document_id": document_id})
    except Exception:
        pass


def delete_chroma_collection(collection_name: str):
    client = get_chroma_client()
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
