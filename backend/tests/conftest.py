import os
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

# Override settings before importing app
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./data/db/test_rag.db"
os.environ["CHROMA_PERSIST_DIR"] = "./data/chroma_test"
os.environ["UPLOAD_DIR"] = "./data/uploads_test"
os.environ["ANTHROPIC_API_KEY"] = "test-key"

from app.core.database import Base, get_db, engine
from app.main import app

test_engine = create_async_engine("sqlite+aiosqlite:///./data/db/test_rag.db", echo=False)
test_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with test_session() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with test_session() as session:
        yield session
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client(db):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
