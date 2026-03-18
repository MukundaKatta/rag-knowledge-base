# rag-knowledge-base

RAG (Retrieval-Augmented Generation) knowledge base application with a FastAPI backend, ChromaDB for vector storage, and Claude API integration.

## What's actually here

This repo has two distinct parts:

**backend/** - A real FastAPI application with working structure. It includes routers for collections, documents, chat, search, settings, and analytics. Dependencies include FastAPI, ChromaDB, sentence-transformers, Anthropic SDK, SQLAlchemy, and more. There is a Dockerfile, docker-compose.yml, and a proper app layout (api/, core/, models/, services/). Whether the individual route handlers are fully implemented or partially stubbed would require deeper inspection, but the scaffolding is real.

**frontend/** - A frontend directory (contents not fully audited).

**src/core.py** - A separate cookie-cutter stub class (`RagKnowledgeBase`) with generic methods (process, analyze, transform, validate, export) that all return `{"ok": True}` without doing anything. This file is unrelated to the actual backend code and appears to have been auto-generated.

## Tech stack (backend)

- FastAPI + Uvicorn
- ChromaDB for vector embeddings
- SQLAlchemy + aiosqlite
- Anthropic SDK (Claude API)
- sentence-transformers for embeddings
- langchain-text-splitters
- Docker support via Dockerfile and docker-compose.yml

## Status

The backend has real application structure and dependencies, but the src/core.py is a non-functional stub. The actual functionality of the backend routes has not been verified.
