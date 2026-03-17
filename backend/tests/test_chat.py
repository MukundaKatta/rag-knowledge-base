"""Tests for chat-related utilities."""
from app.services.llm_service import parse_citations


def test_parse_citations_basic():
    chunks = [
        {"chunk_id": "c1", "content": "Chunk 1 content", "metadata": {"document_id": "d1", "filename": "doc.pdf", "chunk_index": 0}, "score": 0.9},
        {"chunk_id": "c2", "content": "Chunk 2 content", "metadata": {"document_id": "d1", "filename": "doc.pdf", "chunk_index": 1}, "score": 0.8},
    ]
    text = "According to [Source 1], the answer is yes. Also [Source 2] confirms."
    citations = parse_citations(text, chunks)
    assert len(citations) == 2
    assert citations[0]["chunk_id"] == "c1"
    assert citations[1]["chunk_id"] == "c2"


def test_parse_citations_no_matches():
    chunks = [{"chunk_id": "c1", "content": "text", "metadata": {}, "score": 0.9}]
    text = "No citations here."
    citations = parse_citations(text, chunks)
    assert len(citations) == 0


def test_parse_citations_dedup():
    chunks = [{"chunk_id": "c1", "content": "text", "metadata": {"document_id": "d1", "filename": "f.txt", "chunk_index": 0}, "score": 0.9}]
    text = "[Source 1] says this. And again [Source 1] confirms."
    citations = parse_citations(text, chunks)
    assert len(citations) == 1


def test_parse_citations_out_of_range():
    chunks = [{"chunk_id": "c1", "content": "text", "metadata": {}, "score": 0.9}]
    text = "[Source 5] does not exist."
    citations = parse_citations(text, chunks)
    assert len(citations) == 0
