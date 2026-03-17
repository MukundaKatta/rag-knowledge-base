import tempfile
from pathlib import Path
from app.services.document_processor import extract_text
from app.services.chunker import chunk_text


def test_extract_text_txt():
    with tempfile.NamedTemporaryFile(suffix=".txt", mode="w", delete=False) as f:
        f.write("Hello world. This is a test document.")
        f.flush()
        text = extract_text(f.name)
    assert "Hello world" in text
    Path(f.name).unlink()


def test_extract_text_md():
    with tempfile.NamedTemporaryFile(suffix=".md", mode="w", delete=False) as f:
        f.write("# Title\n\nSome markdown content.")
        f.flush()
        text = extract_text(f.name)
    assert "Title" in text
    Path(f.name).unlink()


def test_extract_text_unsupported():
    import pytest
    with tempfile.NamedTemporaryFile(suffix=".xyz", mode="w", delete=False) as f:
        f.write("data")
        f.flush()
        with pytest.raises(ValueError, match="Unsupported"):
            extract_text(f.name)
    Path(f.name).unlink()


def test_chunk_text_basic():
    text = "A" * 1000 + " " + "B" * 1000
    chunks = chunk_text(text, chunk_size=512, chunk_overlap=50)
    assert len(chunks) > 1
    for c in chunks:
        assert "content" in c
        assert "chunk_index" in c
        assert "start_char" in c
        assert "end_char" in c


def test_chunk_text_small():
    text = "Short text."
    chunks = chunk_text(text, chunk_size=512, chunk_overlap=50)
    assert len(chunks) == 1
    assert chunks[0]["content"] == "Short text."
    assert chunks[0]["chunk_index"] == 0
