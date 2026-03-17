import json
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.document import Conversation, Message, Collection
from app.models.schemas import (
    ChatRequest, ConversationResponse, ConversationListItem, MessageResponse
)
from app.services.retriever import retrieve
from app.services.llm_service import stream_response, parse_citations

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.get("/conversations", response_model=list[ConversationListItem])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    query = select(Conversation).order_by(Conversation.updated_at.desc())
    result = await db.execute(query)
    convos = result.scalars().all()

    items = []
    for c in convos:
        msg_count = (await db.execute(
            select(func.count(Message.id)).where(Message.conversation_id == c.id)
        )).scalar() or 0
        items.append(ConversationListItem(
            id=c.id, title=c.title, collection_id=c.collection_id,
            created_at=c.created_at, updated_at=c.updated_at,
            message_count=msg_count,
        ))
    return items


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    convo = await db.get(Conversation, conversation_id)
    if not convo:
        raise HTTPException(404, "Conversation not found")

    msgs_result = await db.execute(
        select(Message).where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = msgs_result.scalars().all()

    return ConversationResponse(
        id=convo.id, title=convo.title, collection_id=convo.collection_id,
        created_at=convo.created_at, updated_at=convo.updated_at,
        messages=[MessageResponse(
            id=m.id, conversation_id=m.conversation_id, role=m.role,
            content=m.content, citations=m.citations, created_at=m.created_at,
        ) for m in messages],
    )


@router.delete("/conversations/{conversation_id}", status_code=204)
async def delete_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    convo = await db.get(Conversation, conversation_id)
    if not convo:
        raise HTTPException(404, "Conversation not found")
    await db.delete(convo)
    await db.commit()


@router.post("/send")
async def send_message(data: ChatRequest, db: AsyncSession = Depends(get_db)):
    """Send a chat message and stream the response via SSE."""

    # Get or create conversation
    if data.conversation_id:
        convo = await db.get(Conversation, data.conversation_id)
        if not convo:
            raise HTTPException(404, "Conversation not found")
    else:
        convo = Conversation(
            title=data.message[:80],
            collection_id=data.collection_id,
        )
        db.add(convo)
        await db.commit()
        await db.refresh(convo)

    collection_id = data.collection_id or convo.collection_id
    if not collection_id:
        raise HTTPException(400, "No collection specified")

    coll = await db.get(Collection, collection_id)
    if not coll:
        raise HTTPException(404, "Collection not found")

    # Save user message
    user_msg = Message(
        conversation_id=convo.id,
        role="user",
        content=data.message,
    )
    db.add(user_msg)
    await db.commit()

    # Retrieve relevant chunks
    chunks = retrieve(coll.name, data.message)

    # Get conversation history
    msgs_result = await db.execute(
        select(Message).where(Message.conversation_id == convo.id)
        .order_by(Message.created_at)
    )
    history = [{"role": m.role, "content": m.content} for m in msgs_result.scalars().all()]

    async def event_stream():
        full_response = ""

        # Send conversation ID first
        yield f"data: {json.dumps({'type': 'meta', 'conversation_id': convo.id})}\n\n"

        # Send retrieved chunks as citations context
        citations_preview = []
        for c in chunks:
            citations_preview.append({
                "chunk_id": c["chunk_id"],
                "document_id": c.get("metadata", {}).get("document_id", ""),
                "document_name": c.get("metadata", {}).get("filename", "Unknown"),
                "content": c["content"][:200],
                "score": c.get("score", 0.0),
                "chunk_index": c.get("metadata", {}).get("chunk_index", 0),
            })
        yield f"data: {json.dumps({'type': 'sources', 'sources': citations_preview})}\n\n"

        # Stream LLM response
        try:
            async for token in stream_response(data.message, chunks, history):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
        except Exception as e:
            full_response = f"Error generating response: {str(e)}"
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

        # Parse citations and save assistant message
        citations = parse_citations(full_response, chunks)

        async with db.begin():
            assistant_msg = Message(
                conversation_id=convo.id,
                role="assistant",
                content=full_response,
                citations=citations,
            )
            db.add(assistant_msg)

        yield f"data: {json.dumps({'type': 'done', 'citations': citations})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")
