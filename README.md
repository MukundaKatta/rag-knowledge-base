# RAG Knowledge Base

A retrieval-augmented generation (RAG) system for querying your documents using natural language, powered by FastAPI and ChromaDB.

## Features

- **Document Ingestion** — Upload PDFs, DOCX, and text files with automatic processing
- **Smart Chunking** — Configurable text splitting via LangChain splitters
- **Vector Search** — Semantic retrieval using Sentence Transformers + ChromaDB
- **AI Chat** — Conversational Q&A with streaming responses (Anthropic Claude)
- **Citations** — Every answer includes source references with chunk previews
- **Collections** — Organize documents into named knowledge bases
- **Full-Text Search** — Keyword-based search alongside semantic search
- **Processing Status** — Track document ingestion progress in real time
- **Analytics** — Query and usage analytics dashboard
- **Configurable** — Adjust chunking, embedding, and retrieval settings via UI

## Tech Stack

- **Backend:** FastAPI + SQLAlchemy (async) + aiosqlite
- **Vector Store:** ChromaDB
- **Embeddings:** Sentence Transformers (all-MiniLM-L6-v2)
- **LLM:** Anthropic Claude (streaming via SSE)
- **Document Parsing:** pypdf, python-docx, Unstructured
- **Text Splitting:** LangChain text splitters
- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Testing:** pytest (backend) + Vitest (frontend)
- **Containerization:** Docker + Docker Compose

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (recommended)
- Anthropic API key

### Installation

```bash
git clone <repo-url>
cd rag-knowledge-base
cp .env.example .env   # add your ANTHROPIC_API_KEY
```

### Run

```bash
# With Docker (recommended)
docker-compose up

# Or manually
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

## Project Structure

```
backend/
├── app/
│   ├── api/             # REST endpoints (collections, documents, chat, search)
│   ├── models/          # SQLAlchemy models and Pydantic schemas
│   ├── services/
│   │   ├── document_processor.py  # File parsing pipeline
│   │   ├── chunker.py             # Text splitting
│   │   ├── embedder.py            # Embedding generation
│   │   ├── retriever.py           # Vector similarity search
│   │   ├── llm_service.py         # Claude streaming integration
│   │   └── analytics.py           # Usage tracking
│   ├── core/            # Config and database setup
│   └── main.py          # FastAPI app entry point
└── tests/               # Backend test suite
frontend/
└── src/
    ├── components/      # Sidebar, Chat, Upload, Citations, Markdown
    ├── pages/           # Chat, Documents, Collections, Search, Settings
    └── hooks/           # useSSE, useChat, useDocuments, useSearch
```

## License

MIT
