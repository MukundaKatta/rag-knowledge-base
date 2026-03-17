"""Analytics service for tracking usage and statistics."""

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.document import Document, Collection, Chunk, Conversation, Message


async def get_stats(db: AsyncSession) -> dict:
    collections_count = (await db.execute(select(func.count(Collection.id)))).scalar() or 0
    documents_count = (await db.execute(select(func.count(Document.id)))).scalar() or 0
    chunks_count = (await db.execute(select(func.count(Chunk.id)))).scalar() or 0
    conversations_count = (await db.execute(select(func.count(Conversation.id)))).scalar() or 0
    messages_count = (await db.execute(select(func.count(Message.id)))).scalar() or 0

    # Documents by status
    status_query = (
        select(Document.status, func.count(Document.id))
        .group_by(Document.status)
    )
    status_rows = (await db.execute(status_query)).all()
    status_dist = {row[0]: row[1] for row in status_rows}

    return {
        "collections": collections_count,
        "documents": documents_count,
        "chunks": chunks_count,
        "conversations": conversations_count,
        "messages": messages_count,
        "documents_by_status": status_dist,
    }
