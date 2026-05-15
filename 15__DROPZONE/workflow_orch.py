#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Workflow Orchestrator
# ═══════════════════════════════════════════════════════════════
# Orchestrates the full processing pipeline: extract → embed →
# vectorize → organize → document → report.
# ═══════════════════════════════════════════════════════════════

import sys
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime

# Add dropzone modules to path
DZ_ROOT = Path(__file__).parent
sys.path.insert(0, str(DZ_ROOT))

from drop_utils import (
    print_step, print_info, print_warn, print_header,
    safe_json_dump, get_timestamp_id, Config
)
from extractor import ContentExtractor
from embed_engine import EmbeddingEngine
from vector_store import VectorStore
from meta_store import MetadataStore
from organizer import FileOrganizer
from markdown_gen import MarkdownGenerator

class WorkflowOrchestrator:
    WORKFLOWS = {
        'full': {
            'description': 'Complete processing: extract, embed, store, organize, document',
            'steps': ['extract', 'embed', 'store_vector', 'store_meta', 'organize', 'document', 'report'],
        },
        'quick': {
            'description': 'Fast: extract and basic organize only',
            'steps': ['extract', 'organize'],
        },
        'deep': {
            'description': 'Thorough analysis with full text embedding',
            'steps': ['extract', 'embed', 'store_vector', 'store_meta', 'organize', 'document', 'analyze', 'report'],
        },
        'minimal': {
            'description': 'Just extract text, no storage',
            'steps': ['extract'],
        },
    }
    
    def __init__(self, extractor: ContentExtractor, embedder: EmbeddingEngine,
                 vector_store: VectorStore, meta_store: MetadataStore,
                 organizer: FileOrganizer, markdown_gen: MarkdownGenerator):
        self.extractor = extractor
        self.embedder = embedder
        self.vector_store = vector_store
        self.meta_store = meta_store
        self.organizer = organizer
        self.markdown_gen = markdown_gen
        self._current_embedding = None  # Track current embedding for similarity
    
    def process(self, path: Path, workflow: str = 'full',
               session_id: Optional[str] = None,
               session_dir: Optional[Path] = None,
               async_mode: bool = False) -> Dict[str, Any]:
        
        workflow_config = self.WORKFLOWS.get(workflow, self.WORKFLOWS['full'])
        print_info(f'Workflow: {workflow} - {workflow_config[\"description\"]}')
        print()
        
        session_id = session_id or get_timestamp_id()
        self._current_embedding = None  # Reset for new session
        
        # Create session in metadata store
        self.meta_store.create_session(session_id, workflow)
        
        # Collect files to process
        files_to_process = self._collect_files(path)
        
        if not files_to_process:
            return {'status': 'error', 'error': 'No files to process'}
        
        print_step(f'Found {len(files_to_process)} file(s) to process')
        print()
        
        # Process each file
        results = {
            'session_id': session_id,
            'workflow': workflow,
            'files_processed': 0,
            'embeddings_created': 0,
            'markdown_files': 0,
            'organized_items': 0,
            'errors': [],
        }
        
        for i, filepath in enumerate(files_to_process, 1):
            print_header(f'Processing [{i}/{len(files_to_process)}]: {filepath.name}')
            
            file_result = self._process_file(
                filepath, workflow_config['steps'], session_id, session_dir
            )
            
            if file_result.get('status') == 'success':
                results['files_processed'] += 1
                if file_result.get('embedding_created'):
                    results['embeddings_created'] += 1
                if file_result.get('markdown_created'):
                    results['markdown_files'] += 1
                if file_result.get('organized_path'):
                    results['organized_items'] += 1
            else:
                results['errors'].append({
                    'file': str(filepath),
                    'error': file_result.get('error', 'Unknown error')
                })
            
            print()
        
        # Update session
        self.meta_store.update_session(
            session_id,
            files_processed=results['files_processed'],
            embeddings_created=results['embeddings_created'],
            markdown_files=results['markdown_files'],
            organized_items=results['organized_items'],
        )
        self.meta_store.complete_session(session_id)
        
        # Generate final report
        report_path = self.generate_session_report(session_id, session_dir)
        results['report_path'] = str(report_path)
        results['status'] = 'success'
        
        return results
    
    def _collect_files(self, path: Path) -> List[Path]:
        if path.is_file():
            return [path]
        elif path.is_dir():
            files = []
            for f in path.rglob('*'):
                if f.is_file() and not f.name.startswith('.'):
                    # Skip very large files
                    try:
                        if f.stat().st_size > Config.MAX_FILE_SIZE:
                            print_warn(f'Skipping (too large): {f.name}')
                            continue
                    except:
                        pass
                    files.append(f)
            return sorted(files)
        return []
    
    def _process_file(self, filepath: Path, steps: List[str],
                     session_id: str, session_dir: Optional[Path]) -> Dict[str, Any]:
        
        result = {'status': 'pending'}
        self._current_embedding = None  # Reset per file
        
        # Step 1: Extract
        if 'extract' in steps:
            print_step('Extracting content...')
            content_data = self.extractor.extract(filepath)
            
            if content_data.get('status') == 'error':
                result['status'] = 'error'
                result['error'] = content_data.get('error', 'Extraction failed')
                return result
            
            print_info(f'Type: {content_data.get(\"content_type\", \"unknown\")}')
            if content_data.get('word_count'):
                print_info(f'Words: {content_data.get(\"word_count\", 0)}')
            
            result['content_data'] = content_data
        
        # Step 2: Embed
        embedding_result = None
        if 'embed' in steps:
            print_step('Generating embedding...')
            try:
                # Prepare text for embedding
                text_to_embed = self._prepare_embedding_text(content_data)
                embedding_result = self.embedder.embed(text_to_embed)
                
                print_info(f'Model: {embedding_result.model}')
                print_info(f'Tokens: {embedding_result.tokens}')
                print_info(f'Latency: {embedding_result.latency_ms:.0f}ms')
                
                result['embedding_created'] = True
                self._current_embedding = embedding_result.embedding
            except Exception as e:
                print_warn(f'Embedding failed: {e}')
                result['embedding_created'] = False
        
        # Step 3: Store in vector DB
        if 'store_vector' in steps and embedding_result:
            print_step('Storing in vector database...')
            try:
                file_hash = content_data.get('extraction_metadata', {}).get('file_hash', '')
                filename = content_data.get('extraction_metadata', {}).get('file_name', '')
                
                metadata = {
                    'content_type': content_data.get('content_type', ''),
                    'word_count': content_data.get('word_count', 0),
                    'session_id': session_id,
                }
                
                point_id = self.vector_store.store_embedding(
                    file_hash, filename, embedding_result.embedding, metadata
                )
                
                content_data['embedding_id'] = point_id
                result['embedding_id'] = point_id
                print_info(f'Stored with ID: {point_id}')
            except Exception as e:
                print_warn(f'Vector storage failed: {e}')
        
        # Step 4: Store metadata
        if 'store_meta' in steps:
            print_step('Storing metadata...')
            try:
                self.meta_store.insert_file(content_data)
                print_info('Metadata stored')
            except Exception as e:
                print_warn(f'Metadata storage failed: {e}')
        
        # Step 5: Organize
        if 'organize' in steps:
            print_step('Organizing file...')
            try:
                organized_path = self.organizer.organize(filepath, content_data)
                if organized_path:
                    content_data['organized_path'] = str(organized_path)
                    result['organized_path'] = str(organized_path)
                    print_info(f'Organized to: {organized_path.relative_to(organized_path.parent)}')
            except Exception as e:
                print_warn(f'Organization failed: {e}')
        
        # Step 6: Document (generate markdown)
        if 'document' in steps:
            print_step('Generating documentation...')
            try:
                md_path = self.markdown_gen.generate(content_data, session_id)
                content_data['summary_md_path'] = str(md_path)
                result['markdown_created'] = True
                result['markdown_path'] = str(md_path)
            except Exception as e:
                print_warn(f'Markdown generation failed: {e}')
                result['markdown_created'] = False
        
        # Step 7: Analyze (deep workflow only)
        if 'analyze' in steps:
            print_step('Deep analysis...')
            self._add_analysis(content_data, session_id, embedding_result)
        
        # Save processed data
        if session_dir:
            session_data_path = session_dir / f'{filepath.name}.json'
            safe_json_dump(content_data, session_data_path)
        
        result['status'] = 'success'
        return result
    
    def _prepare_embedding_text(self, content_data: Dict[str, Any]) -> str:
        parts = []
        
        # Filename
        filename = content_data.get('extraction_metadata', {}).get('file_name', '')
        parts.append(f'File: {filename}')
        
        # Content type
        ct = content_data.get('content_type', '')
        parts.append(f'Type: {ct}')
        
        # Language if code
        if content_data.get('language'):
            parts.append(f'Language: {content_data.get(\"language\")}')
        
        # Text content (truncated)
        text = content_data.get('text_content', '')
        if text:
            # Take first 50000 chars for embedding
            parts.append(f'Content: {text[:50000]}')
        
        # Key metadata
        if content_data.get('headers'):
            parts.append(f'Headers: {\", \".join(content_data.get(\"headers\", [])[:10])}')
        
        if content_data.get('functions'):
            parts.append(f'Functions: {\", \".join(content_data.get(\"functions\", [])[:10])}')
        
        if content_data.get('keys'):
            parts.append(f'Config keys: {\", \".join(content_data.get(\"keys\", [])[:20])}')
        
        return '\n\n'.join(parts)
    
    def _add_analysis(self, content_data: Dict[str, Any], session_id: str, 
                     embedding_result: Optional[Any] = None):
        # Add semantic similarity analysis against recent files
        file_hash = content_data.get('extraction_metadata', {}).get('file_hash', '')
        
        # Use embedding from current processing if available
        embedding_for_search = None
        
        if embedding_result and embedding_result.embedding:
            embedding_for_search = embedding_result.embedding
        elif self._current_embedding:
            embedding_for_search = self._current_embedding
        
        if embedding_for_search:
            try:
                # Find similar files using actual embedding
                similar = self.vector_store.search(
                    Config.COLLECTION_NAME,
                    embedding_for_search,
                    top_k=5
                )
                
                # Store analysis
                self.meta_store.add_analysis(
                    file_hash,
                    'similarity',
                    {'similar_files': [s.get('id') for s in similar[:5]]}
                )
                
                if similar:
                    print_info(f'Found {len(similar)} similar files')
            except Exception as e:
                print_warn(f'Similarity analysis failed: {e}')
    
    def generate_session_report(self, session_id: str, 
                               session_dir: Optional[Path] = None) -> Path:
        session = self.meta_store.get_session(session_id)
        
        report_lines = [
            f'# DropZone Processing Report',
            f'',
            f'## Session: {session_id}',
            f'',
            f'**Generated:** {datetime.now().isoformat()}',
            f'',
            f'**Workflow:** {session.get(\"workflow\", \"unknown\") if session else \"unknown\"}',
            f'',
            f'**Status:** {session.get(\"status\", \"unknown\") if session else \"unknown\"}',
            f'',
        ]
        
        if session:
            report_lines.extend([
                f'## Statistics',
                f'',
                f'| Metric | Value |',
                f'|--------|-------|',
                f'| Files Processed | {session.get(\"files_processed\", 0)} |',
                f'| Embeddings Created | {session.get(\"embeddings_created\", 0)} |',
                f'| Markdown Files | {session.get(\"markdown_files\", 0)} |',
                f'| Organized Items | {session.get(\"organized_items\", 0)} |',
                f'',
                f'**Started:** {session.get(\"started_at\", \"unknown\")}',
                f'',
                f'**Completed:** {session.get(\"completed_at\", \"in progress\")}',
            ])
        
        # Files processed
        if session_dir and session_dir.exists():
            processed_files = list(session_dir.glob('*.json'))
            if processed_files:
                report_lines.append(f'## Processed Files')
                report_lines.append('')
                for pf in sorted(processed_files)[:50]:
                    report_lines.append(f'- `{pf.name}`')
        
        report_lines.append(f'')
        report_lines.append(f'---')
        report_lines.append(f'*Generated by Arkitekt DropZone*')
        
        drop_root = Path(__file__).parent
        report_path = drop_root / 'REPORTS' / f'{session_id}__report.md'
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        return report_path
    
    def generate_full_report(self) -> Path:
        report_lines = [
            '# DropZone Full Status Report',
            f'',
            f'**Generated:** {datetime.now().isoformat()}',
            f'',
        ]
        
        # System stats
        stats = self.meta_store.get_stats()
        
        report_lines.extend([
            '## Overall Statistics',
            f'',
            f'| Metric | Value |',
            f'|--------|-------|',
            f'| Total Files Processed | {stats.get(\"total_files\", 0)} |',
            f'| Total Sessions | {stats.get(\"total_sessions\", 0)} |',
            f'| Total Size | {stats.get(\"total_size\", 0) / (1024*1024):.1f} MB |',
        ])
        
        # By content type
        by_type = stats.get('by_type', {})
        if by_type:
            report_lines.extend([
                '',
                '## By Content Type',
                '',
                f'| Type | Count |',
                f'|------|-------|',
            ])
            for ct, count in sorted(by_type.items(), key=lambda x: -x[1]):
                report_lines.append(f'| {ct} | {count} |')
        
        # By extension
        by_ext = stats.get('by_ext', {})
        if by_ext:
            report_lines.extend([
                '',
                '## Top Extensions',
                '',
                f'| Extension | Count |',
                f'|----------|-------|',
            ])
            for ext, count in list(by_ext.items())[:15]:
                report_lines.append(f'| {ext} | {count} |')
        
        # Recent sessions
        sessions = self.meta_store.get_all_sessions()[:10]
        if sessions:
            report_lines.extend([
                '',
                '## Recent Sessions',
                '',
                f'| Session ID | Files | Status |',
                f'|------------|-------|--------|',
            ])
            for s in sessions:
                report_lines.append(f'| {s.get(\"id\", \"?\")} | {s.get(\"files_processed\", 0)} | {s.get(\"status\", \"?\")} |')
        
        # Organization stats
        org_stats = self.organizer.get_organization_stats()
        if org_stats:
            report_lines.extend([
                '',
                '## Organization Stats',
                '',
                f'| Category | Items |',
                f'|----------|-------|',
            ])
            for cat, count in sorted(org_stats.get('by_category', {}).items(), key=lambda x: -x[1]):
                report_lines.append(f'| {cat} | {count} |')
        
        report_lines.extend(['', '---', '*Generated by Arkitekt DropZone*'])
        
        drop_root = Path(__file__).parent
        report_path = drop_root / 'REPORTS' / f'full_status__{get_timestamp_id()}.md'
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(report_lines))
        
        print_step(f'Full report: {report_path}')
        return report_path