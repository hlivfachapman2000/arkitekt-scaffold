#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# ARKITEKT DROPZONE — Intelligent File Understanding Engine
# ═══════════════════════════════════════════════════════════════
# Drop anything here. Get maximum understanding out.
#
# Usage:
#   python3 drop.py /path/to/file_or_folder
#   python3 drop.py --watch           # Watch mode
#   python3 drop.py --status          # Show processing status
#   python3 drop.py --query <text>    # Semantic search
#   python3 drop.py --report          # Generate analysis report
#
# ═══════════════════════════════════════════════════════════════

import os
import sys
import json
import argparse
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional, List, Dict, Any

# Add dropzone modules to path
DZ_ROOT = Path(__file__).parent
sys.path.insert(0, str(DZ_ROOT))

from drop_utils import (
    ensure_dirs, get_file_hash, format_bytes, 
    format_duration, print_header, print_step,
    load_env, get_timestamp_id
)
from extractor import ContentExtractor
from embed_engine import EmbeddingEngine
from vector_store import VectorStore
from meta_store import MetadataStore
from organizer import FileOrganizer
from markdown_gen import MarkdownGenerator
from workflow_orch import WorkflowOrchestrator

class DropZone:
    def __init__(self, drop_root: Optional[Path] = None):
        self.drop_root = drop_root or Path(__file__).parent
        ensure_dirs(self.drop_root)
        load_env()
        
        self.extractor = ContentExtractor()
        self.embedder = EmbeddingEngine()
        self.vector_store = VectorStore(self.drop_root / 'INDEX')
        self.meta_store = MetadataStore(self.drop_root / 'INDEX' / 'metadata.db')
        self.organizer = FileOrganizer(self.drop_root / 'ORGANIZED')
        self.markdown_gen = MarkdownGenerator()
        self.orchestrator = WorkflowOrchestrator(
            extractor=self.extractor,
            embedder=self.embedder,
            vector_store=self.vector_store,
            meta_store=self.meta_store,
            organizer=self.organizer,
            markdown_gen=self.markdown_gen
        )
    
    def drop(self, path: str, workflow: str = 'full', async_mode: bool = False) -> Dict[str, Any]:
        drop_path = Path(path).resolve()
        
        if not drop_path.exists():
            return {'status': 'error', 'error': f'Path does not exist: {path}'}
        
        session_id = get_timestamp_id()
        start_time = datetime.now()
        
        print_header(f'🔽 DROPZONE PROCESSING')
        print(f'  Input:   {drop_path}')
        print(f'  Type:    {\"folder\" if drop_path.is_dir() else drop_path.suffix}')
        print(f'  Workflow: {workflow}')
        print(f'  Session: {session_id}')
        print()
        
        # Create session directory
        session_dir = self.drop_root / 'ANALYSIS' / 'sessions' / session_id
        session_dir.mkdir(parents=True, exist_ok=True)
        
        # Route through orchestrator
        result = self.orchestrator.process(
            path=drop_path,
            workflow=workflow,
            session_id=session_id,
            session_dir=session_dir,
            async_mode=async_mode
        )
        
        duration = datetime.now() - start_time
        result['duration_seconds'] = duration.total_seconds()
        result['session_id'] = session_id
        
        # Summary output
        print()
        print_header(f'✅ DROP COMPLETE')
        print(f'  Duration:  {format_duration(duration)}')
        print(f'  Files:     {result.get(\"files_processed\", 0)}')
        print(f'  Embeddings:{result.get(\"embeddings_created\", 0)}')
        print(f'  Markdown:  {result.get(\"markdown_files\", 0)}')
        print(f'  Organized: {result.get(\"organized_items\", 0)}')
        
        if result.get('report_path'):
            print(f'  Report:    {result[\"report_path\"]}')
        
        return result
    
    def watch(self, poll_interval: int = 5):
        import time
        watched_path = self.drop_root / 'DROPPED'
        print_header(f'👁️  WATCH MODE')
        print(f'  Watching: {watched_path}')
        print(f'  Interval: {poll_interval}s')
        print()
        
        known_files = set()
        while True:
            current_files = set(f.name for f in watched_path.iterdir() if f.is_file())
            new_files = current_files - known_files
            
            for fname in new_files:
                fpath = watched_path / fname
                if not fname.startswith('.'):
                    print_step(f'New file detected: {fname}')
                    self.drop(str(fpath), workflow='full')
            
            known_files = current_files
            time.sleep(poll_interval)
    
    def query(self, text: str, top_k: int = 10) -> List[Dict[str, Any]]:
        print_header(f'🔍 SEMANTIC SEARCH')
        print(f'  Query: {text}')
        print()
        
        results = self.vector_store.search(text, top_k=top_k)
        
        print(f'Found {len(results)} results:')
        for i, r in enumerate(results, 1):
            print(f'  [{i}] {r[\"filename\"]} (score: {r[\"score\"]:.3f})')
            print(f'      {r.get(\"snippet\", \"\")[:80]}...')
        
        return results
    
    def status(self) -> Dict[str, Any]:
        print_header(f'📊 DROPZONE STATUS')
        
        stats = {
            'dropped': len(list((self.drop_root / 'DROPPED').iterdir())),
            'processed': len(list((self.drop_root / 'PROCESSED').iterdir())),
            'organized': len(list((self.drop_root / 'ORGANIZED').iterdir())),
            'sessions': len(list((self.drop_root / 'ANALYSIS' / 'sessions').iterdir())),
        }
        
        for k, v in stats.items():
            print(f'  {k.capitalize()}: {v}')
        
        # Check infrastructure
        print()
        print_step('Checking infrastructure...')
        
        qdrant_ok = self.vector_store.health_check()
        print(f'  Qdrant:  {\"✅\" if qdrant_ok else \"❌\"}')
        
        ollama_ok = self.embedder.health_check()
        print(f'  Ollama:  {\"✅\" if ollama_ok else \"❌\"}')
        
        return stats
    
    def report(self, session_id: Optional[str] = None) -> str:
        print_header(f'📝 GENERATING REPORT')
        
        if session_id:
            report_path = self.orchestrator.generate_session_report(session_id)
        else:
            report_path = self.orchestrator.generate_full_report()
        
        print(f'  Report: {report_path}')
        return report_path

def main():
    parser = argparse.ArgumentParser(
        description='Arkitekt DropZone — Intelligent File Understanding Engine',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  python3 drop.py /path/to/file.pdf              Process single file
  python3 drop.py /path/to/folder/              Process entire folder
  python3 drop.py --watch                        Watch for new drops
  python3 drop.py --query \"find code about X\"   Semantic search
  python3 drop.py --status                       Show system status
  python3 drop.py --report session_xxx           Generate report
        '''
    )
    
    parser.add_argument('path', nargs='?', help='File or folder to process')
    parser.add_argument('--watch', action='store_true', help='Watch mode')
    parser.add_argument('--status', action='store_true', help='Show status')
    parser.add_argument('--query', type=str, help='Semantic search query')
    parser.add_argument('--report', type=str, nargs='?', const='latest', help='Generate report')
    parser.add_argument('--workflow', default='full', 
                       choices=['full', 'quick', 'deep', 'minimal'],
                       help='Processing workflow (default: full)')
    parser.add_argument('--async', dest='async_mode', action='store_true', help='Async processing')
    parser.add_argument('--top-k', type=int, default=10, help='Results for search')
    
    args = parser.parse_args()
    
    dz = DropZone()
    
    if args.watch:
        dz.watch()
    elif args.status:
        dz.status()
    elif args.query:
        dz.query(args.query, top_k=args.top_k)
    elif args.report is not None:
        dz.report(args.report)
    elif args.path:
        result = dz.drop(args.path, workflow=args.workflow, async_mode=args.async_mode)
        sys.exit(0 if result.get('status') != 'error' else 1)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()