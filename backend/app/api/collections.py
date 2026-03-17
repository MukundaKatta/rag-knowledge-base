from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.document import Collection, Document
from app.models.schemas import CollectionCreate, CollectionUpdate, CollectionResponse
from app.services.embedder import delete_chroma_collection

router = APIRouter(prefix="/api/collections", tags=["collections"])


@router.get("", response_model=list[CollectionResponse])
async def list_collections(db: AsyncSession = Depends(get_db)):
    query = select(Collection).order_by(Collection.created_at.desc())
    result = await db.execute(query)
    collections = result.scalars().all()

    responses = []
    for c in collections:
        doc_count_q = select(func.count(Document.id)).where(Document.collection_id == c.id)
        doc_count = (await db.execute(doc_count_q)).scalar() or 0
        resp = CollectionResponse(
            id=c.id,
            name=c.name,
            description=c.description,
            document_count=doc_count,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        responses.append(resp)
    return responses


@router.post("", response_model=CollectionResponse, status_code=201)
async def create_collection(data: CollectionCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(Collection).where(Collection.name == data.name))
    if existing.scalar():
        raise HTTPException(400, "Collection name already exists")

    coll = Collection(name=data.name, description=data.description)
    db.add(coll)
    await db.commit()
    await db.refresh(coll)
    return CollectionResponse(
        id=coll.id, name=coll.name, description=coll.description,
        document_count=0, created_at=coll.created_at, updated_at=coll.updated_at,
    )


@router.get("/{collection_id}", response_model=CollectionResponse)
async def get_collection(collection_id: str, db: AsyncSession = Depends(get_db)):
    coll = await db.get(Collection, collection_id)
    if not coll:
        raise HTTPException(404, "Collection not found")
    doc_count = (await db.execute(
        select(func.count(Document.id)).where(Document.collection_id == coll.id)
    )).scalar() or 0
    return CollectionResponse(
        id=coll.id, name=coll.name, description=coll.description,
        document_count=doc_count, created_at=coll.created_at, updated_at=coll.updated_at,
    )


@router.put("/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str, data: CollectionUpdate, db: AsyncSession = Depends(get_db)
):
    coll = await db.get(Collection, collection_id)
    if not coll:
        raise HTTPException(404, "Collection not found")
    if data.name is not None:
        coll.name = data.name
    if data.description is not None:
        coll.description = data.description
    await db.commit()
    await db.refresh(coll)
    doc_count = (await db.execute(
        select(func.count(Document.id)).where(Document.collection_id == coll.id)
    )).scalar() or 0
    return CollectionResponse(
        id=coll.id, name=coll.name, description=coll.description,
        document_count=doc_count, created_at=coll.created_at, updated_at=coll.updated_at,
    )


@router.delete("/{collection_id}", status_code=204)
async def delete_collection(collection_id: str, db: AsyncSession = Depends(get_db)):
    coll = await db.get(Collection, collection_id)
    if not coll:
        raise HTTPException(404, "Collection not found")
    delete_chroma_collection(coll.name)
    await db.delete(coll)
    await db.commit()
