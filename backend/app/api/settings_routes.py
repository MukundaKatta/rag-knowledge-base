from fastapi import APIRouter
from app.core.config import settings
from app.models.schemas import SettingsResponse, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("", response_model=SettingsResponse)
async def get_settings():
    return SettingsResponse(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        top_k=settings.top_k,
        rerank_top_k=settings.rerank_top_k,
        mmr_lambda=settings.mmr_lambda,
        llm_model=settings.llm_model,
        max_tokens=settings.max_tokens,
        temperature=settings.temperature,
        embedding_model=settings.embedding_model,
    )


@router.put("", response_model=SettingsResponse)
async def update_settings(data: SettingsUpdate):
    if data.chunk_size is not None:
        settings.chunk_size = data.chunk_size
    if data.chunk_overlap is not None:
        settings.chunk_overlap = data.chunk_overlap
    if data.top_k is not None:
        settings.top_k = data.top_k
    if data.rerank_top_k is not None:
        settings.rerank_top_k = data.rerank_top_k
    if data.mmr_lambda is not None:
        settings.mmr_lambda = data.mmr_lambda
    if data.max_tokens is not None:
        settings.max_tokens = data.max_tokens
    if data.temperature is not None:
        settings.temperature = data.temperature

    return SettingsResponse(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
        top_k=settings.top_k,
        rerank_top_k=settings.rerank_top_k,
        mmr_lambda=settings.mmr_lambda,
        llm_model=settings.llm_model,
        max_tokens=settings.max_tokens,
        temperature=settings.temperature,
        embedding_model=settings.embedding_model,
    )
