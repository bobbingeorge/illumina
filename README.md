# IlluminaReviewer — AI-Powered Code Review Comment Generator

An interactive web application where developers submit code snippets and receive AI-generated review comments highlighting issues and suggestions. Powered by **Qwen 2.5 Coder** running locally via Ollama.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────┐│
│  │  Monaco Editor   │  │   Review Comments Panel          ││
│  │  - Multi-language│  │   - Severity cards (err/warn/info)│
│  │  - Syntax hilite │  │   - Category badges              ││
│  │  - Line numbers  │  │   - Code suggestions             ││
│  └──────────────────┘  └──────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────┐
│  │  Toolbar: [Review Code] [Language ▾] [Sample Buttons]   │
│  └──────────────────────────────────────────────────────────┘
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP POST /api/review
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + Python)                │
│                                                             │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐│
│  │ /api/review   │→ │ Prompt Engine│→ │ Response Parser  ││
│  │ /api/samples  │  │ (system +    │  │ (JSON extraction)││
│  │ /api/health   │  │  user prompt)│  │                  ││
│  └───────────────┘  └──────────────┘  └──────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │ OpenAI-compatible API
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Ollama (Local LLM Runtime)                      │
│              Model: qwen2.5-coder:7b-instruct               │
│              Endpoint: http://localhost:11434                │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. User writes/pastes code in the Monaco Editor and selects a language
2. Clicks "Review Code" → Frontend sends `POST /api/review` with `{ code, language }`
3. Backend constructs a structured prompt and sends it to Ollama (Qwen model)
4. Qwen returns review comments as structured JSON
5. Backend validates/parses the response and returns it to the frontend
6. Frontend renders comments as severity-coded cards with line references and suggestions

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Monaco Editor |
| Backend | Python, FastAPI, httpx, Pydantic |
| LLM | Qwen 2.5 Coder 7B Instruct (via Ollama) |
| Communication | REST API (JSON) |

## Prerequisites

- **Python 3.6+** (with pip)
- **Node.js 18+** (with npm)
- **Ollama** — https://ollama.com/download

## Setup & Run

### Step 1: Install Ollama and pull the model

```bash
# Install Ollama from https://ollama.com/download
# Then pull the Qwen model:
ollama pull qwen2.5-coder:7b-instruct
```

This downloads ~4.5GB. Ensure Ollama is running:

```bash
ollama serve
```

### Step 2: Start the Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Backend runs at: **http://localhost:8000**

### Step 3: Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

### Step 4: Open the App

Navigate to http://localhost:5173 in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/review` | Submit code for AI review |
| GET | `/api/samples` | Get sample code snippets |
| GET | `/api/health` | Health check + model info |

### POST /api/review

**Request:**
```json
{
  "code": "def foo(): pass",
  "language": "python"
}
```

**Response:**
```json
{
  "comments": [
    {
      "line": 1,
      "severity": "info",
      "category": "style",
      "comment": "Function 'foo' has no implementation or docstring",
      "suggestion": "def foo():\n    \"\"\"TODO: Implement.\"\"\"\n    raise NotImplementedError"
    }
  ],
  "summary": "Found 1 issues: 0 errors, 0 warnings, 1 suggestions"
}
```

## Supported Languages

Python, JavaScript, TypeScript, Java, C++, C, C#, Go, Rust, Ruby, PHP, Swift, Kotlin, SQL

## Project Structure

```
IlluminaReviewer/
├── backend/
│   ├── main.py              # FastAPI server, API endpoints
│   ├── prompts.py           # LLM system & user prompt templates
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js       # Dev server + API proxy config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   └── src/
│       ├── App.jsx          # Main app layout & state
│       ├── main.jsx         # React entry point
│       ├── index.css        # Tailwind + custom styles
│       ├── api/
│       │   └── review.js   # API client functions
│       └── components/
│           ├── Header.jsx         # App branding header
│           ├── CodeEditor.jsx     # Monaco editor wrapper
│           └── ReviewComments.jsx # Comment cards with severity
└── README.md
```

## Features

- **Multi-language support** — Review code in 14+ languages
- **Monaco Editor** — Full IDE-like editing with syntax highlighting
- **Structured feedback** — Comments categorized by severity and type
- **Code suggestions** — AI provides corrected code snippets
- **Sample library** — Pre-loaded buggy code for quick demos
- **Fully local** — No data leaves your machine (Ollama runs locally)
- **Zero cost** — No API keys or cloud services required
