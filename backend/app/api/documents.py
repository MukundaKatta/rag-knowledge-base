import asyncio
import json
import uuid
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db, async_session
from app.core.config import settings
from app.models.document import Document, Collection, Chunk
from app.models.schemas import DocumentResponse, ChunkResponse
from app.services.document_processor import extract_text
from app.services.chunker import chunk_text
from app.services.embedder import add_chunks_to_chroma, delete_document_chunks

router = APIRouter(prefix="/api/documents", tags=["documents"])

# SSE progress tracking
_progress: dict[str, dict] = {}


async def process_document(document_id: str, file_path: str, collection_name: str):
    """Background task: extract, chunk, embed, store."""
    async with async_session() as db:
        doc = await db.get(Document, document_id)
        if not doc:
            return

        _progress[document_id] = {"status": "processing", "step": "extracting", "progress": 0}
        try:
            # Extract
            doc.status = "processing"
            await db.commit()

            text = extract_text(file_path)
            _progress[document_id] = {"status": "processing", "step": "chunking", "progress": 25}

            # Chunk
            chunks = chunk_text(text)
            _progress[document_id] = {"status": "processing", "step": "embedding", "progress": 50}

            # Store chunks in SQLite
            chunk_ids = []
            chunk_texts = []
            chunk_metas = []
            for c in chunks:
                chunk_id = str(uuid.uuid4())
                chunk_obj = Chunk(
                    id=chunk_id,
                    document_id=document_id,
                    content=c["content"],
                    chunk_index=c["chunk_index"],
                    start_char=c["start_char"],
                    end_char=c["end_char"],
                    metadata_json={"filename": doc.filename, "document_id": document_id},
                )
                db.add(chunk_obj)
                chunk_ids.append(chunk_id)
                chunk_texts.append(c["content"])
                chunk_metas.append({
                    "document_id": document_id,
                    "filename": doc.filename,
                    "chunk_index": c["chunk_index"],
                })

            await db.commit()
            _progress[document_id] = {"status": "processing", "step": "storing", "progress": 75}

            # Embed and store in ChromaDB
            add_chunks_to_chroma(collection_name, chunk_ids, chunk_texts, chunk_metas)

            doc.status = "completed"
            doc.chunk_count = len(chunks)
            await db.commit()

            _progress[document_id] = {"status": "completed", "step": "done", "progress": 100}

        except Exception as e:
            doc.status = "failed"
            doc.error_message = str(e)
            await db.commit()
            _progress[document_id] = {"status": "failed", "step": "error", "progress": 0, "error": str(e)}


@router.post("", response_model=DocumentResponse, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    collection_id: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    coll = await db.get(Collection, collection_id)
    if not coll:
        raise HTTPException(404, "Collection not found")

    # Validate file type
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in (".pdf", ".docx", ".txt", ".md"):
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    # Save file
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = upload_dir / f"{file_id}{suffix}"

    content = await file.read()
    file_path.write_bytes(content)

    # Create document record
    doc = Document(
        id=file_id,
        filename=file.filename or "unknown",
        file_type=suffix.lstrip("."),
        file_size=len(content),
        collection_id=collection_id,
        status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Start background processing
    background_tasks.add_task(process_document, doc.id, str(file_path), coll.name)

    return doc


@router.get("", response_model=list[DocumentResponse])
async def list_documents(
    collection_id: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Document).order_by(Document.created_at.desc())
    if collection_id:
        query = query.where(Document.collection_id == collection_id)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


@router.get("/{document_id}/chunks", response_model=list[ChunkResponse])
async def get_document_chunks(document_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    query = select(Chunk).where(Chunk.document_id == document_id).order_by(Chunk.chunk_index)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db)):
    doc = await db.get(Document, document_id)
    if not doc:
        raise HTTPException(404, "Document not found")

    coll = await db.get(Collection, doc.collection_id)
    if coll:
        delete_document_chunks(coll.name, document_id)

    # Remove uploaded file
    upload_dir = Path(settings.upload_dir)
    for f in upload_dir.glob(f"{document_id}.*"):
        f.unlink(missing_ok=True)

    await db.delete(doc)
    await db.commit()


@router.get("/{document_id}/progress")
async def document_progress(document_id: str):
    """SSE endpoint for processing progress."""
    async def event_stream():
        while True:
            progress = _progress.get(document_id, {"status": "pending", "step": "waiting", "progress": 0})
            yield f"data: {json.dumps(progress)}\n\n"
            if progress.get("status") in ("completed", "failed"):
                _progress.pop(document_id, None)
                break
            await asyncio.sleep(0.5)

    return StreamingResponse(event_stream(), media_type="text/event-stream")
