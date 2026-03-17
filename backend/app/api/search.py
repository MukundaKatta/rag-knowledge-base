from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.document import Collection
from app.models.schemas import SearchRequest, SearchResult
from app.services.retriever import retrieve

router = APIRouter(prefix="/api/search", tags=["search"])


@router.post("", response_model=list[SearchResult])
async def semantic_search(data: SearchRequest, db: AsyncSession = Depends(get_db)):
    if data.collection_id:
        coll = await db.get(Collection, data.collection_id)
        if not coll:
            raise HTTPException(404, "Collection not found")
        collection_name = coll.name
    else:
        # Search the first available collection
        from sqlalchemy import select
        result = await db.execute(select(Collection).limit(1))
        coll = result.scalar()
        if not coll:
            raise HTTPException(400, "No collections available")
        collection_name = coll.name

    chunks = retrieve(collection_name, data.query, top_k=data.top_k)

    return [
        SearchResult(
            chunk_id=c["chunk_id"],
            document_id=c.get("metadata", {}).get("document_id", ""),
            document_name=c.get("metadata", {}).get("filename", "Unknown"),
            content=c["content"],
            score=c.get("score", 0.0),
            chunk_index=c.get("metadata", {}).get("chunk_index", 0),
        )
        for c in chunks
    ]
