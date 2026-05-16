#!/usr/bin/env python3
#────────────────────────────────────────────────────────────
# sync_to_qdrant.py — SQLite → Qdrant Vector Sync
#
# Syncs verified agent memories from SQLite to Qdrant for
# semantic search and long-term memory retention.
#
# Usage:
#   python3 sync_to_qdrant.py --full         # full sync
#   python3 sync_to_qdrant.py --incremental  # sync since last run
#   python3 sync_to_qdrant.py --query <text> # semantic search
#   python3 sync_to_qdrant.py --status       # show sync status
#   python3 sync_to_qdrant.py --gc           # garbage collect old vectors
#────────────────────────────────────────────────────────────

import os
import sys
import json
import sqlite3
import hashlib
import argparse
import re
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional

#────────────────────────────────────────────────────────────
# Config
#────────────────────────────────────────────────────────────
ROOT_DIR       = Path(__file__).resolve().parent.parent.parent
DB_PATH        = ROOT_DIR / '07__MEMORY_SYSTEM' / 'SQLITE' / 'agent_state.db'
QDRANT_URL     = os.environ.get('QDRANT_URL', 'http://localhost:6333')
COLLECTION     = 'agent_memory'
STATE_FILE     = ROOT_DIR / '07__MEMORY_SYSTEM' / 'MEMORY_BRIDGE' / '.sync_state.json'

# Try to import qdrant client (pip install qdrant-client)
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import Distance, VectorParams, PointStruct
    from qdrant_client.http.exceptions import UnexpectedResponse
    HAS_QDRANT = True
except ImportError:
    HAS_QDRANT = False

# Try to import sentence transformers for embeddings
try:
    from sentence_transformers import SentenceTransformer
    HAS_EMBEDDINGS = True
except ImportError:
    HAS_EMBEDDINGS = False

#────────────────────────────────────────────────────────────
# Embedding model (lightweight local model)
#────────────────────────────────────────────────────────────
_model = None

def get_embedding_model():
    global _model
    if _model is None:
        if HAS_EMBEDDINGS:
            # Use a small, fast model
            _model = SentenceTransformer('all-MiniLM-L6-v2')
        else:
            # Fallback: simple hash-based pseudo-embedding (for development)
            _model = None
    return _model

def compute_embedding(text: str) -> list:
    model = get_embedding_model()
    if model is None:
        # Fallback: deterministic pseudo-embedding from text hash
        # NOT a real embedding — only for dev/testing
        h = hashlib.sha256(text.encode()).digest()
        return list(h[:384]) + [0.0] * (384 - len(list(h[:384]))) if len(h) < 384 else list(h[:384])

    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\t+', ' ', text)
    text = text.strip()
    if len(text) > 512:
        text = text[:512]

    embedding = model.encode(text)
    return embedding.tolist()

#────────────────────────────────────────────────────────────
# Database schema
#────────────────────────────────────────────────────────────
SCHEMA = '''
CREATE TABLE IF NOT EXISTS agent_memory (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_name  TEXT NOT NULL,
    file_name   TEXT NOT NULL,
    content     TEXT NOT NULL,
    chunk_type  TEXT NOT NULL,  -- 'scratchpad' | 'memory' | 'kanban' | 'identity'
    chunk_hash  TEXT NOT NULL,  -- SHA256 of content
    vector_id   TEXT,           -- Qdrant point ID
    synced_at   TEXT,           -- ISO timestamp
    created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agent ON agent_memory(agent_name);
CREATE INDEX IF NOT EXISTS idx_hash  ON agent_memory(chunk_hash);
CREATE INDEX IF NOT EXISTS idx_type  ON agent_memory(chunk_type);
'''

#────────────────────────────────────────────────────────────
# Helpers
#────────────────────────────────────────────────────────────
def log(msg, level='INFO'):
    ts = datetime.now().strftime('%H:%M:%S')
    icons = {'INFO': '[+]', 'WARN': '[!]', 'ERROR': '[-]', 'META': '[*]'}
    print('{0} {1} {2}'.format(ts, icons.get(level, '[?]'), msg), flush=True)

def get_db() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute('PRAGMA journal_mode=WAL')
    conn.executescript(SCHEMA)
    return conn

def load_sync_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {'last_full_sync': None, 'last_incremental_sync': None, 'vectors_count': 0}

def save_sync_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2))

#────────────────────────────────────────────────────────────
# Scan agent memory files and build chunk list
#────────────────────────────────────────────────────────────
def scan_agent_files() -> list:
    agents_dir = ROOT_DIR / '05__AGENTS'
    chunks = []

    for agent_dir in agents_dir.iterdir():
        if not agent_dir.is_dir():
            continue
        if agent_dir.name.startswith('_'):
            continue  # skip system agents like _ORCHESTRATOR

        agent_name = agent_dir.name

        for fname in ['MEMORY.md', 'SCRATCHPAD.md', 'KANBAN.md', 'IDENTITY.md']:
            fpath = agent_dir / fname
            if not fpath.exists():
                continue

            content = fpath.read_text()
            if not content.strip():
                continue

            chunk_hash = hashlib.sha256(content.encode()).hexdigest()

            # Split large files into chunks (~1000 chars each)
            chunk_type = fname.replace('.md', '').lower()

            if len(content) > 1000:
                sub_chunks = split_into_chunks(content, 800)
                for i, sub in enumerate(sub_chunks):
                    sub_hash = hashlib.sha256(sub.encode()).hexdigest()
                    chunks.append({
                        'agent_name': agent_name,
                        'file_name': f'{fname}[{i}]',
                        'content': sub,
                        'chunk_type': chunk_type,
                        'chunk_hash': sub_hash,
                        'parent_hash': chunk_hash
                    })
            else:
                chunks.append({
                    'agent_name': agent_name,
                    'file_name': fname,
                    'content': content,
                    'chunk_type': chunk_type,
                    'chunk_hash': chunk_hash,
                    'parent_hash': chunk_hash
                })

    return chunks

def split_into_chunks(text: str, size: int) -> list:
    paragraphs = re.split(r'\n\n+', text)
    chunks = []
    current = ''

    for para in paragraphs:
        if len(current) + len(para) + 2 <= size:
            current += ('\n\n' if current else '') + para
        else:
            if current:
                chunks.append(current)
            current = para

    if current:
        chunks.append(current)

    return chunks

#────────────────────────────────────────────────────────────
# Qdrant operations
#────────────────────────────────────────────────────────────
_qdrant_client = None

def get_qdrant_client() -> Optional['QdrantClient']:
    global _qdrant_client
    if not HAS_QDRANT:
        return None

    if _qdrant_client is None:
        try:
            _qdrant_client = QdrantClient(url=QDRANT_URL, timeout=5.0)
            # Test connection
            _qdrant_client.get_collections()
            log(f'Connected to Qdrant at {QDRANT_URL}', 'INFO')
        except Exception as e:
            log(f'Qdrant connection failed: {e}', 'WARN')
            _qdrant_client = None

    return _qdrant_client

def ensure_collection(client) -> bool:
    try:
        collections = client.get_collections().collections
        names = [c.name for c in collections]

        if COLLECTION not in names:
            client.create_collection(
                collection_name=COLLECTION,
                vectors_config=VectorParams(size=384, distance=Distance.COSINE)
            )
            log(f'Created collection: {COLLECTION}', 'INFO')
        else:
            log(f'Collection exists: {COLLECTION}', 'INFO')

        return True
    except Exception as e:
        log(f'Collection setup failed: {e}', 'ERROR')
        return False

def upsert_vectors(client, chunks: list) -> int:
    if not chunks:
        return 0

    points = []
    for i, chunk in enumerate(chunks):
        point_id = chunk['chunk_hash'][:16]
        vector = compute_embedding(chunk['content'])
        payload = {
            'agent_name': chunk['agent_name'],
            'file_name': chunk['file_name'],
            'chunk_type': chunk['chunk_type'],
            'content_preview': chunk['content'][:200],
            'indexed_at': datetime.now().isoformat()
        }
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))

    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(points), batch_size):
        batch = points[i:i+batch_size]
        try:
            client.upsert(collection_name=COLLECTION, points=batch)
        except Exception as e:
            log(f'Upsert batch failed: {e}', 'ERROR')
            continue

    return len(points)

def semantic_search(client, query: str, top_k: int = 5) -> list:
    vector = compute_embedding(query)

    try:
        results = client.search(
            collection_name=COLLECTION,
            vector=vector,
            limit=top_k
        )
        return [
            {
                'score': r.score,
                'agent': r.payload.get('agent_name'),
                'file': r.payload.get('file_name'),
                'type': r.payload.get('chunk_type'),
                'preview': r.payload.get('content_preview', '')
            }
            for r in results
        ]
    except Exception as e:
        log(f'Search failed: {e}', 'ERROR')
        return []

def count_vectors(client) -> int:
    try:
        info = client.get_collection(COLLECTION)
        return info.points_count
    except:
        return 0

#────────────────────────────────────────────────────────────
# Sync operations
#────────────────────────────────────────────────────────────
def incremental_sync():
    state = load_sync_state()
    chunks = scan_agent_files()

    conn = get_db()
    new_count = 0
    unsynced_chunks = []  # collect for Qdrant upsert, avoid N+1 re-scan

    for chunk in chunks:
        # Check if already synced (by hash)
        row = conn.execute(
            'SELECT vector_id FROM agent_memory WHERE chunk_hash = ?',
            (chunk['chunk_hash'],)
        ).fetchone()

        if row and row[0]:
            continue  # already synced

        vector_id = chunk['chunk_hash'][:16]

        # Store in SQLite
        conn.execute('''
            INSERT OR REPLACE INTO agent_memory
            (agent_name, file_name, content, chunk_type, chunk_hash, vector_id, synced_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            chunk['agent_name'],
            chunk['file_name'],
            chunk['content'],
            chunk['chunk_type'],
            chunk['chunk_hash'],
            vector_id,
            datetime.now().isoformat()
        ))
        new_count += 1
        unsynced_chunks.append(chunk)  # track while looping — no re-scan needed

    conn.commit()
    conn.close()

    # Sync new chunks to Qdrant
    client = get_qdrant_client()
    if client:
        ensure_collection(client)
        if new_count > 0:
            vectors_count = upsert_vectors(client, unsynced_chunks)
            log(f'Synced {vectors_count} new vectors to Qdrant', 'INFO')

    state['last_incremental_sync'] = datetime.now().isoformat()
    save_sync_state(state)

    log(f'Incremental sync complete: {new_count} new chunks', 'INFO')
    return new_count

def full_sync():
    state = load_sync_state()
    log('Starting full sync — this may take a few minutes', 'INFO')

    chunks = scan_agent_files()
    log(f'Found {len(chunks)} memory chunks across all agents', 'INFO')

    conn = get_db()
    conn.execute('DELETE FROM agent_memory WHERE 1=1')  # Fresh start
    conn.commit()
    conn.close()

    # Insert all chunks
    conn = get_db()
    for chunk in chunks:
        conn.execute('''
            INSERT INTO agent_memory
            (agent_name, file_name, content, chunk_type, chunk_hash, synced_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            chunk['agent_name'],
            chunk['file_name'],
            chunk['content'],
            chunk['chunk_type'],
            chunk['chunk_hash'],
            datetime.now().isoformat()
        ))
    conn.commit()
    conn.close()

    # Sync to Qdrant
    client = get_qdrant_client()
    vectors_count = 0
    if client:
        if ensure_collection(client):
            # Clear and re-upload
            try:
                client.delete_collection(COLLECTION)
            except:
                pass
            ensure_collection(client)
            vectors_count = upsert_vectors(client, chunks)

    state['last_full_sync'] = datetime.now().isoformat()
    state['vectors_count'] = vectors_count
    save_sync_state(state)

    log(f'Full sync complete: {len(chunks)} chunks, {vectors_count} vectors', 'INFO')
    return len(chunks)

def query_memory(query: str, top_k: int = 5):
    client = get_qdrant_client()
    if not client:
        log('Qdrant not available — using SQLite fallback', 'WARN')
        conn = get_db()
        rows = conn.execute(
            '''SELECT agent_name, file_name, content, chunk_type
               FROM agent_memory
               WHERE content LIKE ?
               LIMIT ?''',
            (f'%{query}%', top_k)
        ).fetchall()
        conn.close()
        for row in rows:
            print(f'[{row[3]}] {row[0]}/{row[1]}')
            print(f'  {row[2][:200]}...\n')
        return

    results = semantic_search(client, query, top_k)
    print(f'\nTop {len(results)} results for: {query}')
    print('-' * 60)
    for r in results:
        score = r['score']
        agent = r['agent']
        fname = r['file']
        ctype = r['type']
        print(f'[{score:.3f}] {agent}/{fname} ({ctype})')
        _preview = r["preview"]
        print(f"  {_preview}")
        print()

def show_status():
    state = load_sync_state()
    conn = get_db()
    total_chunks = conn.execute('SELECT COUNT(*) FROM agent_memory').fetchone()[0]
    synced = conn.execute('SELECT COUNT(*) FROM agent_memory WHERE vector_id IS NOT NULL').fetchone()[0]
    conn.close()

    client = get_qdrant_client()
    qdrant_vectors = count_vectors(client) if client else 0

    print(f'SQLite chunks:   {total_chunks}')
    print(f'SQLite synced:   {synced}')
    print(f'Qdrant vectors:  {qdrant_vectors}')
    print(f"Last full:       {state.get('last_full_sync', 'never')}")
    print(f"Last incremental: {state.get('last_incremental_sync', 'never')}")
    print(f'Qdrant available: {client is not None}')
    print(f"Embeddings:       {'sentence-transformers' if HAS_EMBEDDINGS else 'hash fallback'}")

def garbage_collect():
    log('Garbage collecting old vectors...', 'INFO')
    state = load_sync_state()
    conn = get_db()

    # Find chunks that exist in DB but have no recent file content
    rows = conn.execute('SELECT id, agent_name, file_name, chunk_hash FROM agent_memory').fetchall()
    removed = 0

    for row in rows:
        _, agent, fname, chash = row
        fpath = ROOT_DIR / '05__AGENTS' / agent / fname.replace('[0]', '.md').replace('[1]', '.md').replace('[2]', '.md')
        # Basic check: does agent dir still exist?
        if not (ROOT_DIR / '05__AGENTS' / agent).exists():
            conn.execute('DELETE FROM agent_memory WHERE id = ?', (row[0],))
            removed += 1

    conn.commit()
    conn.close()

    # Also remove from Qdrant
    client = get_qdrant_client()
    if client:
        try:
            info = client.get_collection(COLLECTION)
            log(f'Qdrant collection has {info.points_count} points', 'INFO')
        except:
            pass

    log(f'GC complete: removed {removed} stale DB entries', 'INFO')

#────────────────────────────────────────────────────────────
# CLI
#────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='SQLite → Qdrant Memory Bridge')
    parser.add_argument('--full', action='store_true', help='Full re-sync')
    parser.add_argument('--incremental', action='store_true', help='Incremental sync (default)')
    parser.add_argument('--query', type=str, help='Semantic search query')
    parser.add_argument('--status', action='store_true', help='Show sync status')
    parser.add_argument('--gc', action='store_true', help='Garbage collect stale entries')

    args = parser.parse_args()

    if args.status:
        show_status()
    elif args.gc:
        garbage_collect()
    elif args.full:
        full_sync()
    elif args.query:
        query_memory(args.query)
    elif args.incremental:
        incremental_sync()
    else:
        # Default: incremental
        incremental_sync()

if __name__ == '__main__':
    main()