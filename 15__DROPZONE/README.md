# 🔽 ARKITEKT DROPZONE — Intelligent File Understanding Engine

> *Drop anything here. Get maximum understanding out.*

A comprehensive file drop system that automatically vectorizes, organizes, stores, and documents any content you throw at it. Designed to achieve the absolute maximum understanding of mixed content dumps.

---

## Overview

DropZone is an intelligent file processing pipeline that:

1. **Extracts** — Pulls text, metadata, and structure from any file type
2. **Vectorizes** — Creates semantic embeddings using Ollama
3. **Stores** — Saves vectors in Qdrant, metadata in SQLite
4. **Organizes** — Intelligently categorizes files by content type
5. **Documents** — Generates comprehensive markdown reports
6. **Searches** — Enables semantic search across all processed content

---

## Quick Start

```bash
# Process a single file
python3 15__DROPZONE/drop.py /path/to/file.pdf

# Process an entire folder
python3 15__DROPZONE/drop.py /path/to/folder/

# Watch mode (auto-process new drops)
python3 15__DROPZONE/drop.py --watch

# Semantic search
python3 15__DROPZONE/drop.py --query \"find code about authentication\"

# Check status
python3 15__DROPZONE/drop.py --status

# Generate full report
python3 15__DROPZONE/drop.py --report
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         DROPZONE PIPELINE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│   │  DROP   │────▶│ EXTRACT │────▶│  EMBED  │────▶│  STORE  │  │
│   │         │     │         │     │         │     │         │  │
│   └─────────┘     └─────────┘     └─────────┘     └────┬────┘  │
│                                                         │       │
│   ┌─────────┐     ┌─────────┐     ┌─────────┐          │       │
│   │ORGANIZE │◀────│DOCUMENT │◀────│ANALYZE  │◀─────────┘       │
│   │         │     │         │     │         │                  │
│   └─────────┘     └─────────┘     └─────────┘                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Components:
├── drop.py              # Main CLI entry point
├── drop_utils.py        # Shared utilities and config
├── extractor.py         # Content extraction from all file types
├── embed_engine.py      # Ollama embedding integration
├── vector_store.py      # Qdrant vector database interface
├── meta_store.py        # SQLite metadata storage
├── organizer.py         # Intelligent file organization
├── markdown_gen.py      # Markdown documentation generator
└── workflow_orch.py     # Pipeline orchestration
```

---

## Directory Structure

```
15__DROPZONE/
├── DROPPED/              # Raw files dropped for processing
├── PROCESSED/            # Processed files (with sidecar metadata)
├── ORGANIZED/            # Intelligently organized by content type
│   ├── CODE/
│   │   ├── PYTHON/
│   │   ├── JAVASCRIPT/
│   │   └── ...
│   ├── TEXT/
│   ├── DOCUMENTATION/
│   ├── DATA/
│   ├── CONFIG/
│   ├── IMAGES/
│   ├── LOGS/
│   └── SECURITY_CHECK/   # Sensitive files (env, keys, etc.)
├── INDEX/                # Vector DB and metadata storage
│   ├── metadata.db       # SQLite database
│   └── qdrant/           # Vector data
├── WORKFLOWS/            # Pipeline configurations
├── ANALYSIS/             # Processing session data
│   └── sessions/         # Per-session analysis JSON
├── REPORTS/              # Generated reports
└── SUMMARY_MD/           # Markdown documentation output
```

---

## Content Types Supported

| Type | Extensions | Analysis |
|------|------------|----------|
| **Code** | .py, .js, .ts, .java, .go, .rs, etc. | Language detection, functions, imports |
| **Markdown** | .md, .markdown | Headers, links, code blocks, frontmatter |
| **JSON** | .json, .jsonl | Structure analysis, key extraction |
| **YAML** | .yaml, .yml | Key paths, section detection |
| **CSV** | .csv | Headers, row count, sample data |
| **Text** | .txt, .log | Word/line count, pattern detection |
| **Documents** | .pdf, .docx | Text extraction (with dependencies) |
| **Images** | .png, .jpg, .svg | Metadata extraction |
| **Config** | .env, .ini, .toml | Variable detection, sensitive flags |

---

## Workflows

### Full Processing (`--workflow full`)
Complete pipeline: extract → embed → vector store → metadata store → organize → document → report

### Quick Mode (`--workflow quick`)
Fast processing: extract → organize only (skip embeddings)

### Deep Analysis (`--workflow deep`)
Thorough analysis with semantic similarity detection and detailed reporting

### Minimal (`--workflow minimal`)
Just extract text, no storage (useful for preview)

---

## Configuration

### Environment Variables

```bash
# Ollama / Embedding
LOCAL_OLLAMA_NETWORK_URL=http://localhost:11434
LOCAL_EMBEDDING_URL=http://localhost:11434/v1/embeddings
LOCAL_EMBEDDING_MODEL=qwen3-embedding:8b
LOCAL_EMBEDDING_DIMS=4096

# Qdrant Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                    # Optional

# Processing
DROPZONE_BATCH_SIZE=10
DROPZONE_MAX_FILE_SIZE=100000000   # 100MB
```

### Required Services

1. **Qdrant** — Vector database for semantic search
   ```bash
   docker compose up -d qdrant
   ```

2. **Ollama** — Local embedding model
   ```bash
   ollama serve
   ollama pull qwen3-embedding:8b
   ```

---

## Features

### Intelligent Organization

Files are automatically sorted into appropriate directories based on content analysis:

- **Security-sensitive files** (.env, .pem, keys) → `SECURITY_CHECK/`
- **Code by language** → `CODE/PYTHON/`, `CODE/JAVASCRIPT/`, etc.
- **Documentation** → `DOCUMENTATION/`
- **Data files** → `DATA/JSON/`, `DATA/CSV/`
- **Images** → `IMAGES/` and `IMAGES/VECTOR/`

### Markdown Documentation

Every processed file gets a comprehensive markdown report with:

- File metadata and hashes
- Content-specific analysis (functions, headers, structure)
- Extracted text (truncated if large)
- Related content type suggestions
- Processing timestamp and version

### Semantic Search

Query your dropped content using natural language:

```bash
python3 15__DROPZONE/drop.py --query \"authentication code in Python\"
```

### Session Tracking

All processing sessions are tracked with:

- Files processed count
- Embeddings created count
- Processing duration
- Errors encountered
- Generated outputs

---

## API Reference

### DropZone Class

```python
from drop import DropZone

dz = DropZone()

# Process files
result = dz.drop('/path/to/file')

# Watch for new drops
dz.watch(poll_interval=5)

# Semantic search
results = dz.query('find relevant files', top_k=10)

# Check status
stats = dz.status()
```

### Content Extractor

```python
from extractor import ContentExtractor

extractor = ContentExtractor()
result = extractor.extract('/path/to/file.txt')

# Batch processing
results = extractor.extract_batch([file1, file2, file3])
```

### Embedding Engine

```python
from embed_engine import EmbeddingEngine

embedder = EmbeddingEngine()
result = embedder.embed('text to embed')

# Batch embeddings
results = embedder.embed_batch(['text1', 'text2', 'text3'])
```

---

## Advanced Usage

### Custom Workflows

Edit `workflow_orch.py` to create custom processing pipelines:

```python
WORKFLOWS = {
    'custom': {
        'description': 'My custom workflow',
        'steps': ['extract', 'embed', 'store_vector', 'custom_step'],
    },
}
```

### Adding New File Types

Extend `extractor.py` with new extraction methods:

```python
def _extract_custom(self, filepath: Path) -> Dict[str, Any]:
    # Your custom extraction logic
    return {'content_type': 'custom', 'text_content': '...'}
```

Then add to `SUPPORTED_EXTENSIONS` dict.

### Organization Rules

Add new rules in `organizer.py`:

```python
ORGANIZATION_RULES = {
    'my_type': {
        'target_dir': 'MY_CATEGORY',
        'conditions': lambda d: d.get('content_type') == 'my_type',
    },
}
```

---

## Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Pull the embedding model
ollama pull qwen3-embedding:8b
```

### Qdrant connection issues
```bash
# Start Qdrant
docker compose up -d qdrant

# Check health
curl http://localhost:6333/health
```

### File too large
Increase `DROPZONE_MAX_FILE_SIZE` in `.env` or increase limit:
```bash
export DROPZONE_MAX_FILE_SIZE=500000000  # 500MB
```

---

## Architecture Diagram

```
                    ┌──────────────────────────────────────┐
                    │           Human Operator             │
                    └──────────────────┬───────────────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │           drop.py (CLI)              │
                    │  ┌────────────────────────────────┐  │
                    │  │     WorkflowOrchestrator       │  │
                    │  └──────────────┬─────────────────┘  │
                    └──────────────────┼───────────────────┘
                                       │
          ┌────────────────────────────┼────────────────────────────┐
          │                            │                            │
          ▼                            ▼                            ▼
   ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
   │  EXTRACTOR   │            │   EMBEDDER   │            │  ORGANIZER   │
   │  (all types) │            │   (Ollama)   │            │  (by type)   │
   └──────┬───────┘            └──────┬───────┘            └──────┬───────┘
          │                            │                            │
          ▼                            ▼                            ▼
   ┌──────────────┐            ┌──────────────┐            ┌──────────────┐
   │  CONTENT     │            │   VECTORS    │            │  ORGANIZED   │
   │  DATA        │───────────▶│   (Qdrant)   │            │  FILES       │
   └──────┬───────┘            └──────────────┘            └──────────────┘
          │                                                         │
          │                            ┌────────────────────────────┘
          ▼                            │
   ┌──────────────┐            ┌──────────────┐
   │  META_STORE  │            │   MARKDOWN   │
   │  (SQLite)    │            │   GENERATOR  │
   └──────────────┘            └──────────────┘
          │                            │
          ▼                            ▼
   ┌──────────────────────────────────────────────┐
   │           REPORTS & ANALYSIS                 │
   │  - Session reports (markdown)                │
   │  - Full status reports                       │
   │  - Organization index                        │
   │  - Semantic similarity data                  │
   └──────────────────────────────────────────────┘
```

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-01-XX | Initial release |

---

*Built with ⚡ by Arkitekt*