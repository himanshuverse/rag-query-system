# RAG-Based Document Query System

> AI-powered document Q&A using Retrieval-Augmented Generation (RAG). Upload any PDF and have natural language conversations grounded in its content.

---

## Overview

A full-stack RAG pipeline that allows users to upload documents and ask context-aware questions. The system retrieves relevant document chunks and uses an LLM to generate grounded, accurate responses.

---

## Key Features

- 📄 PDF ingestion and text extraction
- 🔍 Semantic search using vector embeddings
- 🤖 Context-aware responses using LLM APIs
- 💾 Persistent session memory (MongoDB with fallback)
- ⚡ Robust error handling and fallback mechanisms

---

## Architecture

```
Frontend (React + Vite) → Backend API (Node.js/Express) → Embedding Service (FastAPI/Python)
                                      ↓
                       Pinecone (vectors) + MongoDB (sessions)
                                      ↓
                            Google Gemini (LLM)
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TailwindCSS |
| Backend | Node.js, Express, MongoDB |
| AI/ML | Google Gemini API, Sentence Transformers |
| Infrastructure | FastAPI, Pinecone |

---

## How It Works

### 1. Upload
- PDF is parsed and split into chunks
- Chunks are converted into embeddings
- Stored in Pinecone with metadata

### 2. Query
- User query is embedded
- Relevant chunks are retrieved from Pinecone
- Context + query sent to Gemini LLM
- Response returned and stored in session

### 3. Fallbacks
- LLM unavailable → return retrieved context directly
- MongoDB unavailable → local storage fallback

---

## Project Structure

```
rag-document-query-system/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── server.js
├── frontend/
├── services/
│   └── embedding_service.py
└── README.md
```

---

## Prerequisites

- Node.js 18+
- Python 3.10+
- Pinecone account
- Google Gemini API key

---

## Installation

```bash
git clone https://github.com/Divyanshu1405/rag-document-query-system.git
cd rag-document-query-system

cd backend && npm install && cd ..
cd frontend && npm install && cd ..

python -m venv .venv
source .venv/bin/activate        # macOS/Linux
.\.venv\Scripts\Activate.ps1     # Windows

pip install fastapi uvicorn sentence-transformers pydantic
```

---

## Configuration

Create `backend/.env`:

```env
GEMINI_API_KEY=your_key
PINECONE_API_KEY=your_key
PINECONE_INDEX_NAME=your_index
MONGO_URI=your_mongodb_uri
PYTHON_API_URL=http://127.0.0.1:8000/embed/
```

---

## Running the Application

Terminal 1 — Python Embedding Service

```bash
uvicorn services.embedding_service:app --reload
```

Terminal 2 — Backend

```bash
cd backend
npm run dev
```

Terminal 3 — Frontend

```bash
cd frontend
npm run dev
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and index a PDF |
| POST | `/api/query` | Ask a question |
| GET | `/api/query/history/:sessionId` | Retrieve session history |

---



## Notes

- Initially prototyped during a hackathon, later refined and stabilized
- Focus on backend design, API integration, and system reliability

---

## License

ISC
