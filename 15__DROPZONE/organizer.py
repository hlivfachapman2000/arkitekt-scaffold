#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — File Organizer
# ═══════════════════════════════════════════════════════════════
# Intelligently organizes dropped files into structured directories
# based on content type, semantic analysis, and rules.
# ═══════════════════════════════════════════════════════════════

import os
import shutil
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib

from drop_utils import print_step, print_warn, format_bytes

class FileOrganizer:
    ORGANIZATION_RULES = {
        # By content type
        'code': {
            'target_dir': 'CODE',
            'conditions': lambda d: d.get('content_type') == 'code',
        },
        'text': {
            'target_dir': 'TEXT',
            'conditions': lambda d: d.get('content_type') == 'text',
        },
        'markdown': {
            'target_dir': 'DOCUMENTATION',
            'conditions': lambda d: d.get('content_type') == 'markdown',
        },
        'json': {
            'target_dir': 'DATA/JSON',
            'conditions': lambda d: d.get('content_type') == 'json',
        },
        'csv': {
            'target_dir': 'DATA/CSV',
            'conditions': lambda d: d.get('content_type') == 'csv',
        },
        'yaml': {
            'target_dir': 'CONFIG',
            'conditions': lambda d: d.get('content_type') == 'yaml',
        },
        'env': {
            'target_dir': 'SECURITY_CHECK',
            'conditions': lambda d: d.get('content_type') == 'env',
        },
        'image': {
            'target_dir': 'IMAGES',
            'conditions': lambda d: d.get('content_type') == 'image',
        },
        'svg': {
            'target_dir': 'IMAGES/VECTOR',
            'conditions': lambda d: d.get('content_type') == 'svg',
        },
        'log': {
            'target_dir': 'LOGS',
            'conditions': lambda d: d.get('content_type') == 'log',
        },
        
        # By language
        'python': {
            'target_dir': 'CODE/PYTHON',
            'conditions': lambda d: d.get('language') == 'Python',
        },
        'javascript': {
            'target_dir': 'CODE/JAVASCRIPT',
            'conditions': lambda d: d.get('language') == 'JavaScript',
        },
        'typescript': {
            'target_dir': 'CODE/TYPESCRIPT',
            'conditions': lambda d: d.get('language') == 'TypeScript',
        },
        'rust': {
            'target_dir': 'CODE/RUST',
            'conditions': lambda d: d.get('language') == 'Rust',
        },
        'go': {
            'target_dir': 'CODE/GOLANG',
            'conditions': lambda d: d.get('language') == 'Go',
        },
        
        # By file extension
        '.pdf': {
            'target_dir': 'DOCUMENTS/PDF',
            'conditions': lambda d: d.get('extraction_metadata', {}).get('file_ext') == '.pdf',
        },
        '.docx': {
            'target_dir': 'DOCUMENTS/WORD',
            'conditions': lambda d: d.get('extraction_metadata', {}).get('file_ext') == '.docx',
        },
    }
    
    SECURITY_SENSITIVE = [
        '.env', '.pem', '.key', '.crt', '.csr', '.p12',
        'id_rsa', 'id_dsa', 'private_key', 'secret'
    ]
    
    def __init__(self, organized_root: Path):
        self.organized_root = organized_root
        self.organized_root.mkdir(parents=True, exist_ok=True)
        
        # Create standard directory structure
        self._ensure_structure()
    
    def _ensure_structure(self):
        dirs = [
            'CODE/PYTHON', 'CODE/JAVASCRIPT', 'CODE/TYPESCRIPT', 'CODE/RUST', 
            'CODE/GOLANG', 'CODE/OTHER',
            'TEXT', 'DOCUMENTATION', 'DOCUMENTS/PDF', 'DOCUMENTS/WORD',
            'DATA/JSON', 'DATA/CSV', 'DATA/OTHER',
            'CONFIG', 'LOGS', 'IMAGES', 'IMAGES/VECTOR',
            'SECURITY_CHECK', 'ARCHIVE', 'UNKNOWN'
        ]
        
        for d in dirs:
            (self.organized_root / d).mkdir(parents=True, exist_ok=True)
    
    def organize(self, source_path: Path, content_data: Dict[str, Any],
                mode: str = 'auto') -> Optional[Path]:
        
        if not source_path.exists():
            return None
        
        # Security check
        if self._is_security_sensitive(source_path.name):
            target_dir = self.organized_root / 'SECURITY_CHECK'
            target_path = self._move_file(source_path, target_dir, content_data)
            print_step(f'Security sensitive → {target_path.relative_to(self.organized_root)}')
            return target_path
        
        # Determine target directory
        target_dir = self._determine_target(content_data)
        
        # Move file
        target_path = self._move_file(source_path, target_dir, content_data)
        
        # Create metadata sidecar
        self._create_sidecar(target_path, content_data)
        
        return target_path
    
    def _is_security_sensitive(self, filename: str) -> bool:
        lower_name = filename.lower()
        return any(s in lower_name for s in self.SECURITY_SENSITIVE)
    
    def _determine_target(self, content_data: Dict[str, Any]) -> Path:
        content_type = content_data.get('content_type', '')
        language = content_data.get('language', '')
        
        # Try content-type specific rule
        if content_type in self.ORGANIZATION_RULES:
            rule = self.ORGANIZATION_RULES[content_type]
            if rule['conditions'](content_data):
                return self.organized_root / rule['target_dir']
        
        # Try language-specific rule
        if language:
            lang_key = language.lower()
            if lang_key in self.ORGANIZATION_RULES:
                rule = self.ORGANIZATION_RULES[lang_key]
                if rule['conditions'](content_data):
                    return self.organized_root / rule['target_dir']
        
        # Try extension-based
        ext = content_data.get('extraction_metadata', {}).get('file_ext', '')
        if ext in self.ORGANIZATION_RULES:
            rule = self.ORGANIZATION_RULES[ext]
            if rule['conditions'](content_data):
                return self.organized_root / rule['target_dir']
        
        # Fallback
        return self.organized_root / 'UNKNOWN'
    
    def _move_file(self, source: Path, target_dir: Path, 
                  content_data: Dict[str, Any]) -> Path:
        # Security: resolve paths to prevent path traversal
        source = source.resolve()
        target_dir = target_dir.resolve()
        
        # Ensure target is within organized_root
        if not str(target_dir).startswith(str(self.organized_root)):
            raise ValueError(f'Invalid target directory: {target_dir}')
        
        target_dir.mkdir(parents=True, exist_ok=True)
        
        target_name = self._sanitize_filename(source.name)
        target_path = target_dir / target_name
        
        # Handle name collisions
        if target_path.exists():
            base, ext = target_path.stem, target_path.suffix
            counter = 1
            while target_path.exists():
                target_path = target_dir / f'{base}_{counter}{ext}'
                counter += 1
        
        # Copy file manually to avoid preserving dangerous permissions
        # This is safer than shutil.copy2 which preserves executable bits
        with open(source, 'rb') as src_f:
            with open(target_path, 'wb') as dst_f:
                shutil.copyfileobj(src_f, dst_f)
        
        return target_path
    
    def _sanitize_filename(self, name: str) -> str:
        import re
        # Remove problematic characters
        name = re.sub(r'[<>:\"/\\|?*]', '_', name)
        # Limit length
        if len(name) > 200:
            name = name[:197] + '...'
        return name
    
    def _create_sidecar(self, target_path: Path, content_data: Dict[str, Any]):
        sidecar_path = target_path.with_suffix(target_path.suffix + '.meta.json')
        
        import json
        meta = {
            'original_name': content_data.get('extraction_metadata', {}).get('file_name'),
            'original_path': content_data.get('extraction_metadata', {}).get('file_path'),
            'content_type': content_data.get('content_type'),
            'language': content_data.get('language'),
            'organized_at': datetime.now().isoformat(),
            'file_hash': content_data.get('extraction_metadata', {}).get('file_hash'),
        }
        
        with open(sidecar_path, 'w', encoding='utf-8') as f:
            json.dump(meta, f, indent=2)
    
    def organize_batch(self, files: List[Path], contents: List[Dict[str, Any]],
                      mode: str = 'auto') -> List[Path]:
        results = []
        for fp, cd in zip(files, contents):
            result = self.organize(fp, cd, mode)
            if result:
                results.append(result)
        return results
    
    def get_organization_stats(self) -> Dict[str, Any]:
        stats = {'total': 0, 'by_category': {}}
        
        for category in self.ORGANIZATION_RULES.keys():
            target_dir = self.organized_root / self.ORGANIZATION_RULES[category]['target_dir']
            if target_dir.exists():
                count = len(list(target_dir.iterdir()))
                stats['by_category'][category] = count
                stats['total'] += count
        
        # Count unknown
        unknown_dir = self.organized_root / 'UNKNOWN'
        if unknown_dir.exists():
            stats['by_category']['unknown'] = len(list(unknown_dir.iterdir()))
            stats['total'] += stats['by_category']['unknown']
        
        return stats
    
    def create_index_md(self) -> Path:
        index_path = self.organized_root / 'INDEX.md'
        
        lines = [
            '# Organized Files Index',
            f'\nGenerated: {datetime.now().isoformat()}\n',
            '## Structure\n'
        ]
        
        for category, rule in self.ORGANIZATION_RULES.items():
            target_dir = self.organized_root / rule['target_dir']
            if target_dir.exists():
                files = list(target_dir.iterdir())
                if files:
                    lines.append(f'\n### {category.upper()} ({len(files)} files)')
                    lines.append(f'- Directory: `{rule[\"target_dir\"]}`')
                    for f in sorted(files)[:20]:
                        lines.append(f'  - [[{f.name}]]')
                    if len(files) > 20:
                        lines.append(f'  - ... and {len(files) - 20} more')
        
        with open(index_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        return index_path