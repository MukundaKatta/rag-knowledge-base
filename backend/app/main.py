from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api import collections, documents, chat, search, settings_routes, analytics_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure directories exist
    Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
    Path(settings.chroma_persist_dir).mkdir(parents=True, exist_ok=True)
    db_path = settings.database_url.replace("sqlite+aiosqlite:///", "")
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    await init_db()
    yield


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(collections.router)
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(search.router)
app.include_router(settings_routes.router)
app.include_router(analytics_routes.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
