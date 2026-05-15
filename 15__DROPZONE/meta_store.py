#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Metadata Store (SQLite)
# ═══════════════════════════════════════════════════════════════
# Stores structured metadata about dropped files in SQLite.
# Enables fast queries, filtering, and relationship tracking.
# ═══════════════════════════════════════════════════════════════

import sqlite3
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from dataclasses import dataclass

from drop_utils import print_step, print_warn

@dataclass
class FileRecord:
    id: int
    file_hash: str
    filename: str
    file_path: str
    content_type: str
    file_ext: str
    file_size: int
    word_count: int
    language: Optional[str]
    tags: List[str]
    embedding_id: Optional[str]
    organized_path: Optional[str]
    summary_md_path: Optional[str]
    created_at: str
    processed_at: str

class MetadataStore:
    def __init__(self, db_path: Path):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db_path = db_path
        self.conn = None
        self._init_db()
    
    def _get_conn(self):
        if self.conn is None:
            self.conn = sqlite3.connect(str(self.db_path), check_same_thread=False)
            self.conn.row_factory = sqlite3.Row
        return self.conn
    
    def _init_db(self):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_hash TEXT UNIQUE NOT NULL,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                content_type TEXT,
                file_ext TEXT,
                file_size INTEGER,
                word_count INTEGER DEFAULT 0,
                language TEXT,
                tags TEXT DEFAULT '[]',
                embedding_id TEXT,
                organized_path TEXT,
                summary_md_path TEXT,
                created_at TEXT,
                processed_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS processing_sessions (
                id TEXT PRIMARY KEY,
                started_at TEXT,
                completed_at TEXT,
                files_processed INTEGER DEFAULT 0,
                embeddings_created INTEGER DEFAULT 0,
                markdown_files INTEGER DEFAULT 0,
                organized_items INTEGER DEFAULT 0,
                status TEXT DEFAULT 'running',
                workflow TEXT,
                notes TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS content_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_hash TEXT REFERENCES files(file_hash),
                analysis_type TEXT,
                analysis_data TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_hash TEXT REFERENCES files(file_hash),
                target_hash TEXT REFERENCES files(file_hash),
                relationship_type TEXT,
                confidence REAL DEFAULT 1.0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_files_hash ON files(file_hash)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_files_type ON files(content_type)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_files_ext ON files(file_ext)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_analysis_file ON content_analysis(file_hash)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_rels_source ON relationships(source_hash)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_rels_target ON relationships(target_hash)')
        
        conn.commit()
        print_step('Metadata store initialized')
    
    def insert_file(self, data: Dict[str, Any]) -> int:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        extraction_meta = data.get('extraction_metadata', {})
        
        cursor.execute('''
            INSERT OR REPLACE INTO files (
                file_hash, filename, file_path, content_type, file_ext,
                file_size, word_count, language, tags, embedding_id,
                organized_path, summary_md_path, created_at, processed_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            extraction_meta.get('file_hash', ''),
            extraction_meta.get('file_name', ''),
            extraction_meta.get('file_path', ''),
            data.get('content_type', ''),
            extraction_meta.get('file_ext', ''),
            extraction_meta.get('file_size', 0),
            data.get('word_count', data.get('line_count', 0)),
            data.get('language'),
            json.dumps(data.get('tags', [])),
            data.get('embedding_id'),
            data.get('organized_path'),
            data.get('summary_md_path'),
            extraction_meta.get('extracted_at', datetime.now().isoformat()),
            datetime.now().isoformat()
        ))
        
        conn.commit()
        return cursor.lastrowid
    
    def get_file_by_hash(self, file_hash: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM files WHERE file_hash = ?', (file_hash,))
        row = cursor.fetchone()
        
        if row:
            return dict(row)
        return None
    
    def get_files_by_type(self, content_type: str, limit: int = 100) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM files WHERE content_type = ? ORDER BY processed_at DESC LIMIT ?',
            (content_type, limit)
        )
        
        return [dict(row) for row in cursor.fetchall()]
    
    def get_files_by_ext(self, ext: str, limit: int = 100) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM files WHERE file_ext = ? ORDER BY processed_at DESC LIMIT ?',
            (ext, limit)
        )
        
        return [dict(row) for row in cursor.fetchall()]
    
    def get_recent_files(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute(
            'SELECT * FROM files ORDER BY processed_at DESC LIMIT ?',
            (limit,)
        )
        
        return [dict(row) for row in cursor.fetchall()]
    
    def create_session(self, session_id: str, workflow: str = 'full') -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO processing_sessions (id, started_at, workflow, status)
            VALUES (?, ?, ?, 'running')
        ''', (session_id, datetime.now().isoformat(), workflow))
        
        conn.commit()
        return True
    
    def update_session(self, session_id: str, **kwargs) -> bool:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        allowed_fields = ['files_processed', 'embeddings_created', 'markdown_files', 
                         'organized_items', 'status', 'notes', 'completed_at']
        
        updates = []
        values = []
        
        for key, value in kwargs.items():
            if key in allowed_fields:
                updates.append(f'{key} = ?')
                values.append(value)
        
        if updates:
            values.append(session_id)
            query = f'UPDATE processing_sessions SET {', '.join(updates)} WHERE id = ?'
            cursor.execute(query, values)
            conn.commit()
        
        return True
    
    def complete_session(self, session_id: str) -> bool:
        return self.update_session(
            session_id,
            status='completed',
            completed_at=datetime.now().isoformat()
        )
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM processing_sessions WHERE id = ?', (session_id,))
        row = cursor.fetchone()
        
        if row:
            return dict(row)
        return None
    
    def get_all_sessions(self) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM processing_sessions ORDER BY started_at DESC')
        return [dict(row) for row in cursor.fetchall()]
    
    def add_analysis(self, file_hash: str, analysis_type: str, analysis_data: Dict[str, Any]):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO content_analysis (file_hash, analysis_type, analysis_data)
            VALUES (?, ?, ?)
        ''', (file_hash, analysis_type, json.dumps(analysis_data)))
        
        conn.commit()
    
    def get_analysis(self, file_hash: str, analysis_type: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        if analysis_type:
            cursor.execute(
                'SELECT * FROM content_analysis WHERE file_hash = ? AND analysis_type = ?',
                (file_hash, analysis_type)
            )
        else:
            cursor.execute(
                'SELECT * FROM content_analysis WHERE file_hash = ?',
                (file_hash,)
            )
        
        results = []
        for row in cursor.fetchall():
            r = dict(row)
            r['analysis_data'] = json.loads(r['analysis_data'])
            results.append(r)
        
        return results
    
    def add_relationship(self, source_hash: str, target_hash: str, 
                        rel_type: str, confidence: float = 1.0):
        conn = self._get_conn()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO relationships (source_hash, target_hash, relationship_type, confidence)
            VALUES (?, ?, ?, ?)
        ''', (source_hash, target_hash, rel_type, confidence))
        
        conn.commit()
    
    def get_related(self, file_hash: str, rel_type: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        if rel_type:
            cursor.execute('''
                SELECT r.*, f.filename, f.content_type 
                FROM relationships r
                JOIN files f ON f.file_hash = r.target_hash
                WHERE r.source_hash = ? AND r.relationship_type = ?
                ORDER BY r.confidence DESC
            ''', (file_hash, rel_type))
        else:
            cursor.execute('''
                SELECT r.*, f.filename, f.content_type 
                FROM relationships r
                JOIN files f ON f.file_hash = r.target_hash
                WHERE r.source_hash = ?
                ORDER BY r.confidence DESC
            ''', (file_hash,))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def search_files(self, query: str, limit: int = 50) -> List[Dict[str, Any]]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        # Simple LIKE search on filename and content_type
        cursor.execute('''
            SELECT * FROM files 
            WHERE filename LIKE ? OR content_type LIKE ?
            ORDER BY processed_at DESC LIMIT ?
        ''', (f'%{query}%', f'%{query}%', limit))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def get_stats(self) -> Dict[str, Any]:
        conn = self._get_conn()
        cursor = conn.cursor()
        
        stats = {}
        
        cursor.execute('SELECT COUNT(*) as count FROM files')
        stats['total_files'] = cursor.fetchone()['count']
        
        cursor.execute('SELECT content_type, COUNT(*) as count FROM files GROUP BY content_type')
        stats['by_type'] = {row['content_type']: row['count'] for row in cursor.fetchall()}
        
        cursor.execute('SELECT file_ext, COUNT(*) as count FROM files GROUP BY file_ext ORDER BY count DESC LIMIT 20')
        stats['by_ext'] = {row['file_ext']: row['count'] for row in cursor.fetchall()}
        
        cursor.execute('SELECT SUM(file_size) as total FROM files')
        stats['total_size'] = cursor.fetchone()['total'] or 0
        
        cursor.execute('SELECT COUNT(*) as count FROM processing_sessions WHERE status = ?', ('completed',))
        stats['total_sessions'] = cursor.fetchone()['count']
        
        return stats
    
    def close(self):
        if self.conn:
            self.conn.close()
            self.conn = None