"""Retrieve, re-rank, and apply MMR to search results."""

import numpy as np
from app.services.embedder import embed_texts, query_collection
from app.core.config import settings


def _cosine_similarity(a: list[float], b: list[float]) -> float:
    a_arr = np.array(a)
    b_arr = np.array(b)
    return float(np.dot(a_arr, b_arr) / (np.linalg.norm(a_arr) * np.linalg.norm(b_arr) + 1e-10))


def _cross_encoder_rerank(query: str, documents: list[str], top_k: int) -> list[int]:
    """Simple reranking by re-computing cosine similarity with query embedding.
    In production, use a cross-encoder model for better quality."""
    query_emb = embed_texts([query])[0]
    doc_embs = embed_texts(documents)
    scores = [_cosine_similarity(query_emb, d) for d in doc_embs]
    ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    return ranked[:top_k]


def _mmr_select(
    query_embedding: list[float],
    doc_embeddings: list[list[float]],
    top_k: int,
    lambda_param: float = 0.7,
) -> list[int]:
    """Maximal Marginal Relevance for diverse selection."""
    if not doc_embeddings:
        return []

    selected: list[int] = []
    remaining = list(range(len(doc_embeddings)))

    for _ in range(min(top_k, len(doc_embeddings))):
        best_score = -float("inf")
        best_idx = remaining[0] if remaining else 0

        for idx in remaining:
            relevance = _cosine_similarity(query_embedding, doc_embeddings[idx])

            max_sim = 0.0
            for sel_idx in selected:
                sim = _cosine_similarity(doc_embeddings[idx], doc_embeddings[sel_idx])
                max_sim = max(max_sim, sim)

            mmr_score = lambda_param * relevance - (1 - lambda_param) * max_sim
            if mmr_score > best_score:
                best_score = mmr_score
                best_idx = idx

        selected.append(best_idx)
        remaining.remove(best_idx)

    return selected


def retrieve(
    collection_name: str,
    query: str,
    top_k: int | None = None,
    rerank_top_k: int | None = None,
    mmr_lambda: float | None = None,
) -> list[dict]:
    """Full retrieval pipeline: search -> rerank -> MMR."""
    k = top_k or settings.top_k
    rerank_k = rerank_top_k or settings.rerank_top_k
    lam = mmr_lambda or settings.mmr_lambda

    results = query_collection(collection_name, query, top_k=k)

    if not results["ids"] or not results["ids"][0]:
        return []

    ids = results["ids"][0]
    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]

    # Convert distances to similarity scores (ChromaDB returns distances for cosine)
    scores = [1.0 - d for d in distances]

    # Rerank
    if len(docs) > rerank_k:
        rerank_indices = _cross_encoder_rerank(query, docs, rerank_k * 2)
        ids = [ids[i] for i in rerank_indices]
        docs = [docs[i] for i in rerank_indices]
        metas = [metas[i] for i in rerank_indices]
        scores = [scores[i] for i in rerank_indices]

    # MMR
    query_emb = embed_texts([query])[0]
    doc_embs = embed_texts(docs)
    mmr_indices = _mmr_select(query_emb, doc_embs, rerank_k, lam)

    results_out = []
    for idx in mmr_indices:
        results_out.append({
            "chunk_id": ids[idx],
            "content": docs[idx],
            "metadata": metas[idx],
            "score": scores[idx],
        })

    return results_out
