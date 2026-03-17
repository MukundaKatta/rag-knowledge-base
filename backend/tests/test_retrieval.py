"""Tests for retrieval and chunking logic."""
import numpy as np
from app.services.retriever import _cosine_similarity, _mmr_select


def test_cosine_similarity_identical():
    v = [1.0, 0.0, 0.0]
    assert abs(_cosine_similarity(v, v) - 1.0) < 1e-6


def test_cosine_similarity_orthogonal():
    a = [1.0, 0.0]
    b = [0.0, 1.0]
    assert abs(_cosine_similarity(a, b)) < 1e-6


def test_mmr_select_basic():
    query_emb = [1.0, 0.0, 0.0]
    doc_embs = [
        [0.9, 0.1, 0.0],
        [0.8, 0.2, 0.0],
        [0.0, 0.0, 1.0],
    ]
    selected = _mmr_select(query_emb, doc_embs, top_k=2, lambda_param=0.7)
    assert len(selected) == 2
    # First should be most relevant
    assert selected[0] == 0


def test_mmr_select_empty():
    selected = _mmr_select([1.0], [], top_k=5)
    assert selected == []


def test_mmr_select_diversity():
    """MMR should prefer diverse results over redundant ones."""
    query_emb = [1.0, 0.0]
    doc_embs = [
        [0.95, 0.05],  # very similar to query
        [0.94, 0.06],  # almost same as above
        [0.5, 0.5],    # different
    ]
    selected = _mmr_select(query_emb, doc_embs, top_k=2, lambda_param=0.5)
    assert len(selected) == 2
    # With lambda=0.5 (high diversity), should pick 0 and 2 (diverse)
    assert 0 in selected
    assert 2 in selected
