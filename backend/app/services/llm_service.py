"""LLM service for generating responses with citations using Claude."""

import json
import re
from collections.abc import AsyncGenerator
import anthropic
from app.core.config import settings


def _build_system_prompt(chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks):
        doc_name = chunk.get("metadata", {}).get("filename", "Unknown")
        context_parts.append(
            f"[Source {i+1}: {doc_name}]\n{chunk['content']}"
        )
    context = "\n\n---\n\n".join(context_parts)

    return f"""You are a knowledgeable assistant that answers questions using ONLY the provided context.
When you use information from the context, cite the source using [Source N] notation where N is the source number.
If you cannot answer the question from the provided context, say so clearly.
Always be accurate and helpful.

CONTEXT:
{context}"""


def _build_messages(
    query: str,
    history: list[dict] | None = None,
) -> list[dict]:
    messages = []
    if history:
        for msg in history[-10:]:  # Last 10 messages for context
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": query})
    return messages


async def stream_response(
    query: str,
    chunks: list[dict],
    history: list[dict] | None = None,
) -> AsyncGenerator[str, None]:
    """Stream Claude response as SSE data chunks."""
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    system = _build_system_prompt(chunks)
    messages = _build_messages(query, history)

    with client.messages.stream(
        model=settings.llm_model,
        max_tokens=settings.max_tokens,
        temperature=settings.temperature,
        system=system,
        messages=messages,
    ) as stream:
        for text in stream.text_stream:
            yield text


def parse_citations(content: str, chunks: list[dict]) -> list[dict]:
    """Extract citation references from the response text."""
    citations = []
    pattern = r"\[Source (\d+)\]"
    matches = re.findall(pattern, content)
    seen = set()

    for match in matches:
        idx = int(match) - 1
        if 0 <= idx < len(chunks) and idx not in seen:
            seen.add(idx)
            chunk = chunks[idx]
            citations.append({
                "chunk_id": chunk["chunk_id"],
                "document_id": chunk.get("metadata", {}).get("document_id", ""),
                "document_name": chunk.get("metadata", {}).get("filename", "Unknown"),
                "content": chunk["content"][:300],
                "score": chunk.get("score", 0.0),
                "chunk_index": chunk.get("metadata", {}).get("chunk_index", 0),
            })

    return citations
