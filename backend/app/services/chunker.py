"""Split text into overlapping chunks using LangChain."""

from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings


def chunk_text(
    text: str,
    chunk_size: int | None = None,
    chunk_overlap: int | None = None,
) -> list[dict]:
    """Return list of {'content': str, 'start_char': int, 'end_char': int, 'chunk_index': int}."""
    size = chunk_size or settings.chunk_size
    overlap = chunk_overlap or settings.chunk_overlap

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    docs = splitter.create_documents([text])
    chunks = []
    offset = 0
    for i, doc in enumerate(docs):
        content = doc.page_content
        start = text.find(content, offset)
        if start == -1:
            start = offset
        end = start + len(content)
        chunks.append({
            "content": content,
            "start_char": start,
            "end_char": end,
            "chunk_index": i,
        })
        offset = start + 1

    return chunks
