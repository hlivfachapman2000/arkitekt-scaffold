#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Content Extraction Engine
# ═══════════════════════════════════════════════════════════════
# Extracts text, metadata, and structure from any file type.
# Supports: text, markdown, code, PDF, images (OCR), audio, etc.
# ═══════════════════════════════════════════════════════════════

import os
import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib

class ContentExtractor:
    SUPPORTED_EXTENSIONS = {
        # Text / Documents
        '.txt', '.md', '.markdown', '.rst', '.log',
        # Code
        '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.kt', '.swift',
        '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.rb', '.php',
        '.html', '.css', '.scss', '.less', '.vue', '.svelte',
        '.sql', '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
        '.yaml', '.yml', '.toml', '.json', '.jsonl', '.xml', '.csv',
        '.ini', '.cfg', '.conf', '.env',
        # Documents
        '.pdf', '.doc', '.docx', '.odt',
        # Images (for future OCR)
        '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
        # Data
        '.parquet', '.avro', '.feather',
    }
    
    CODE_EXTENSIONS = {
        '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.kt', '.swift',
        '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.rb', '.php',
        '.html', '.css', '.scss', '.less', '.vue', '.svelte',
        '.sql', '.sh', '.bash', '.zsh', '.ps1', '.bat', '.cmd',
    }
    
    def __init__(self):
        self.extractors = {
            '.txt': self._extract_text,
            '.md': self._extract_markdown,
            '.markdown': self._extract_markdown,
            '.log': self._extract_log,
            '.rst': self._extract_text,
            '.py': self._extract_code,
            '.js': self._extract_code,
            '.ts': self._extract_code,
            '.jsx': self._extract_code,
            '.tsx': self._extract_code,
            '.java': self._extract_code,
            '.kt': self._extract_code,
            '.swift': self._extract_code,
            '.c': self._extract_code,
            '.cpp': self._extract_code,
            '.h': self._extract_code,
            '.hpp': self._extract_code,
            '.cs': self._extract_code,
            '.go': self._extract_code,
            '.rs': self._extract_code,
            '.rb': self._extract_code,
            '.php': self._extract_code,
            '.html': self._extract_code,
            '.css': self._extract_code,
            '.scss': self._extract_code,
            '.less': self._extract_code,
            '.vue': self._extract_code,
            '.svelte': self._extract_code,
            '.sql': self._extract_code,
            '.sh': self._extract_code,
            '.bash': self._extract_code,
            '.zsh': self._extract_code,
            '.ps1': self._extract_code,
            '.bat': self._extract_code,
            '.cmd': self._extract_code,
            '.yaml': self._extract_yaml,
            '.yml': self._extract_yaml,
            '.toml': self._extract_toml,
            '.json': self._extract_json,
            '.jsonl': self._extract_jsonl,
            '.xml': self._extract_xml,
            '.csv': self._extract_csv,
            '.ini': self._extract_text,
            '.cfg': self._extract_text,
            '.conf': self._extract_text,
            '.env': self._extract_env,
            '.pdf': self._extract_pdf,
            '.doc': self._extract_doc,
            '.docx': self._extract_docx,
            '.odt': self._extract_text,
            '.png': self._extract_image,
            '.jpg': self._extract_image,
            '.jpeg': self._extract_image,
            '.gif': self._extract_image,
            '.svg': self._extract_svg,
            '.webp': self._extract_image,
        }
    
    def extract(self, filepath: Path, options: Optional[Dict] = None) -> Dict[str, Any]:
        options = options or {}
        
        if not filepath.exists():
            return {'error': f'File not found: {filepath}', 'status': 'error'}
        
        if filepath.stat().st_size > 100_000_000:  # 100MB limit
            return {'error': 'File too large (>100MB)', 'status': 'error'}
        
        ext = filepath.suffix.lower()
        extractor = self.extractors.get(ext, self._extract_binary)
        
        try:
            result = extractor(filepath)
            result['extraction_metadata'] = {
                'file_path': str(filepath),
                'file_name': filepath.name,
                'file_ext': ext,
                'file_size': filepath.stat().st_size,
                'file_hash': self._get_file_hash(filepath),
                'extracted_at': datetime.now().isoformat(),
                'extractor_version': '1.0.0',
            }
            result['status'] = 'success'
            return result
        except Exception as e:
            return {
                'error': str(e),
                'status': 'error',
                'extraction_metadata': {
                    'file_path': str(filepath),
                    'file_name': filepath.name,
                    'file_ext': ext,
                    'failed_at': datetime.now().isoformat(),
                }
            }
    
    def _get_file_hash(self, filepath: Path) -> str:
        hasher = hashlib.sha256()
        with open(filepath, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                hasher.update(chunk)
        return hasher.hexdigest()
    
    def _extract_text(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        return {
            'content_type': 'text',
            'text_content': content,
            'word_count': len(content.split()),
            'line_count': content.count('\n') + 1,
            'char_count': len(content),
        }
    
    def _extract_markdown(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Extract frontmatter
        frontmatter = {}
        if content.startswith('---'):
            parts = content[3:].split('---', 1)
            if len(parts) == 2:
                fm_text, content = parts
                for line in fm_text.strip().split('\n'):
                    if ':' in line:
                        key, val = line.split(':', 1)
                        frontmatter[key.strip()] = val.strip()
        
        # Count headers, links, images
        headers = re.findall(r'^#{1,6}\\s+(.+)$', content, re.MULTILINE)
        links = re.findall(r'!?\\[([^\\]]+)\\]\\([^)]+\\)', content)
        code_blocks = re.findall(r'```[\\s\\S]*?```', content)
        
        return {
            'content_type': 'markdown',
            'text_content': content,
            'frontmatter': frontmatter,
            'word_count': len(content.split()),
            'headers': headers,
            'header_count': len(headers),
            'link_count': len(links),
            'code_block_count': len(code_blocks),
            'is_documentation': len(headers) > 2,
        }
    
    def _extract_log(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Parse log levels
        log_levels = {
            'ERROR': len(re.findall(r'\bERROR\b', content, re.I)),
            'WARN': len(re.findall(r'\b(WARN|WARNING)\\b', content, re.I)),
            'INFO': len(re.findall(r'\\bINFO\\b', content, re.I)),
            'DEBUG': len(re.findall(r'\\bDEBUG\\b', content, re.I)),
        }
        
        # Timestamps pattern
        timestamps = re.findall(
            r'\\d{4}-\\d{2}-\\d{2}[T\\s]\\d{2}:\\d{2}:\\d{2}',
            content
        )
        
        return {
            'content_type': 'log',
            'text_content': content,
            'log_levels': log_levels,
            'error_count': log_levels['ERROR'],
            'timestamp_count': len(timestamps),
            'line_count': content.count('\n') + 1,
        }
    
    def _extract_code(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Language detection
        ext_to_lang = {
            '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
            '.jsx': 'JSX', '.tsx': 'TSX', '.java': 'Java', '.kt': 'Kotlin',
            '.swift': 'Swift', '.c': 'C', '.cpp': 'C++', '.cs': 'C#',
            '.go': 'Go', '.rs': 'Rust', '.rb': 'Ruby', '.php': 'PHP',
        }
        language = ext_to_lang.get(filepath.suffix.lower(), 'Unknown')
        
        # Count code elements
        functions = re.findall(r'(?:def|function|fn|class|interface|struct|enum)\\s+(\\w+)', content)
        imports = re.findall(r'(?:import|from|require|include|#include)\\s+([\\w.]+)', content)
        comments = re.findall(r'(?://|#|/\\*|\\*|<!--)', content)
        
        # Complexity estimate
        lines = content.split('\n')
        code_lines = [l for l in lines if l.strip() and not l.strip().startswith(('//', '#', '/*', '*'))]
        comment_lines = [l for l in lines if l.strip().startswith(('//', '#', '/*', '*', '<!--'))]
        
        return {
            'content_type': 'code',
            'language': language,
            'text_content': content,
            'function_count': len(functions),
            'functions': functions[:20],  # Limit
            'import_count': len(imports),
            'imports': imports[:20],
            'comment_count': len(comments),
            'line_count': len(lines),
            'code_lines': len(code_lines),
            'comment_lines': len(comment_lines),
            'is_test_file': bool(re.search(r'\\b(test|spec|Test|Spec)\\b', filepath.name)),
        }
    
    def _extract_yaml(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Extract key paths
        keys = []
        for line in content.split('\n'):
            if ':' in line and not line.strip().startswith('#'):
                key = line.split(':')[0].strip()
                if key:
                    keys.append(key)
        
        return {
            'content_type': 'yaml',
            'text_content': content,
            'key_count': len(keys),
            'keys': keys[:30],
            'word_count': len(content.split()),
        }
    
    def _extract_toml(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        sections = re.findall(r'^\\[([^\\]]+)\\]', content, re.MULTILINE)
        
        return {
            'content_type': 'toml',
            'text_content': content,
            'section_count': len(sections),
            'sections': sections,
        }
    
    def _extract_json(self, filepath: Path) -> Dict[str, Any]:
        import json
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        def get_stats(obj, depth=0, max_depth=5):
            if depth > max_depth:
                return {'type': 'nested', 'max_depth_reached': True}
            
            if isinstance(obj, dict):
                return {
                    'type': 'object',
                    'key_count': len(obj),
                    'keys': list(obj.keys())[:20],
                    'nested': {k: get_stats(v, depth+1) for k, v in list(obj.items())[:5]}
                }
            elif isinstance(obj, list):
                return {
                    'type': 'array',
                    'length': len(obj),
                    'item_types': [type(v).__name__ for v in obj[:3]]
                }
            else:
                return {'type': type(obj).__name__, 'sample': str(obj)[:50]}
        
        return {
            'content_type': 'json',
            'text_content': '',  # Don't embed raw JSON
            'structure': get_stats(data),
            'json_data': data,  # Keep for later processing
        }
    
    def _extract_jsonl(self, filepath: Path) -> Dict[str, Any]:
        import json
        lines = []
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    lines.append(json.loads(line))
        
        return {
            'content_type': 'jsonl',
            'text_content': '',
            'line_count': len(lines),
            'first_items': lines[:3],
            'keys': list(lines[0].keys()) if lines else [],
        }
    
    def _extract_xml(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        tags = re.findall(r'<(\\w+)[^>]*>', content)
        unique_tags = list(set(tags))
        
        return {
            'content_type': 'xml',
            'text_content': content,
            'tag_count': len(tags),
            'unique_tags': unique_tags[:30],
            'tag_count_by_type': {t: tags.count(t) for t in unique_tags[:15]},
        }
    
    def _extract_csv(self, filepath: Path) -> Dict[str, Any]:
        import csv
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
        
        headers = rows[0] if rows else []
        data_rows = rows[1:] if len(rows) > 1 else []
        
        return {
            'content_type': 'csv',
            'text_content': '',
            'row_count': len(data_rows),
            'column_count': len(headers),
            'headers': headers,
            'sample_rows': data_rows[:5],
        }
    
    def _extract_env(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.readlines()
        
        variables = []
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key = line.split('=', 1)[0]
                variables.append(key)
        
        # Flag sensitive variables
        sensitive_patterns = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN', 'API_KEY', 'PRIVATE']
        sensitive = [v for v in variables if any(p in v.upper() for p in sensitive_patterns)]
        
        return {
            'content_type': 'env',
            'text_content': ''.join(lines),
            'variable_count': len(variables),
            'variables': variables,
            'sensitive_count': len(sensitive),
            'has_sensitive': len(sensitive) > 0,
            'sensitive_variables': sensitive[:10],
        }
    
    def _extract_pdf(self, filepath: Path) -> Dict[str, Any]:
        # Try pdfplumber first, fallback to text extraction
        try:
            import pdfplumber
            text_parts = []
            page_count = 0
            with pdfplumber.open(filepath) as pdf:
                page_count = len(pdf.pages)
                for page in pdf.pages:
                    t = page.extract_text()
                    if t:
                        text_parts.append(t)
            text = '\n\n'.join(text_parts)
            
            return {
                'content_type': 'pdf',
                'text_content': text,
                'word_count': len(text.split()),
                'page_count': page_count,
            }
        except ImportError:
            return {
                'content_type': 'pdf',
                'text_content': '[PDF extraction requires: pip install pdfplumber]',
                'note': 'Install pdfplumber for text extraction',
            }
        except Exception as e:
            return {
                'content_type': 'pdf',
                'text_content': f'[PDF extraction failed: {str(e)}]',
                'error': str(e),
            }
    
    def _extract_doc(self, filepath: Path) -> Dict[str, Any]:
        return {
            'content_type': 'doc',
            'text_content': '[.doc extraction requires: pip install python-docx or pywin32]',
            'note': 'Install python-docx for text extraction',
        }
    
    def _extract_docx(self, filepath: Path) -> Dict[str, Any]:
        try:
            from docx import Document
            doc = Document(filepath)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            text = '\n\n'.join(paragraphs)
            
            return {
                'content_type': 'docx',
                'text_content': text,
                'word_count': len(text.split()),
                'paragraph_count': len(paragraphs),
            }
        except ImportError:
            return {
                'content_type': 'docx',
                'text_content': '[.docx extraction requires: pip install python-docx]',
                'note': 'Install python-docx for text extraction',
            }
    
    def _extract_image(self, filepath: Path) -> Dict[str, Any]:
        # Image metadata extraction
        try:
            from PIL import Image
            img = Image.open(filepath)
            
            metadata = {
                'format': img.format,
                'mode': img.mode,
                'size': img.size,
                'width': img.width,
                'height': img.height,
            }
            
            return {
                'content_type': 'image',
                'text_content': '',  # No text in images (use OCR for that)
                'image_metadata': metadata,
                'aspect_ratio': round(img.width / img.height, 2) if img.height > 0 else 0,
            }
        except ImportError:
            return {
                'content_type': 'image',
                'text_content': '',
                'note': 'Install Pillow for image metadata: pip install Pillow',
            }
    
    def _extract_svg(self, filepath: Path) -> Dict[str, Any]:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            content = f.read()
        
        # Extract SVG elements
        elements = re.findall(r'<(\\w+)', content)
        unique_elements = list(set(elements))
        
        # Extract dimensions
        width = re.search(r'width=\"(\\d+)', content)
        height = re.search(r'height=\"(\\d+)', content)
        
        return {
            'content_type': 'svg',
            'text_content': content,
            'element_count': len(elements),
            'element_types': unique_elements,
            'width': int(width.group(1)) if width else None,
            'height': int(height.group(1)) if height else None,
        }
    
    def _extract_binary(self, filepath: Path) -> Dict[str, Any]:
        return {
            'content_type': 'binary',
            'text_content': '',
            'note': f'Binary file type {filepath.suffix} - no text extraction available',
        }
    
    def extract_batch(self, filepaths: List[Path], options: Optional[Dict] = None) -> List[Dict[str, Any]]:
        results = []
        for fp in filepaths:
            result = self.extract(fp, options)
            results.append(result)
        return results