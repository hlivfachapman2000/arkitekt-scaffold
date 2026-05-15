#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Markdown Generator
# ═══════════════════════════════════════════════════════════════
# Generates comprehensive markdown documentation from
# extracted file content and metadata.
# ═══════════════════════════════════════════════════════════════

from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib

from drop_utils import print_step, format_bytes, format_duration

class MarkdownGenerator:
    def __init__(self, output_root: Optional[Path] = None):
        self.output_root = output_root or Path(__file__).parent / 'SUMMARY_MD'
        self.output_root.mkdir(parents=True, exist_ok=True)
    
    def generate(self, content_data: Dict[str, Any], 
                session_id: str, options: Optional[Dict] = None) -> Path:
        options = options or {}
        
        filename = content_data.get('extraction_metadata', {}).get('file_name', 'unknown')
        file_hash = content_data.get('extraction_metadata', {}).get('file_hash', 'unknown')
        
        safe_name = self._sanitize_filename(filename)
        
        # Generate filename based on content type
        ext = content_data.get('extraction_metadata', {}).get('file_ext', '')
        base_name = safe_name.replace(ext, '') if ext else safe_name
        
        output_name = f'{session_id}__{base_name}.md'
        output_path = self.output_root / output_name
        
        # Generate content
        md_content = self._generate_content(content_data, options)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(md_content)
        
        print_step(f'Markdown: {output_path.name}')
        return output_path
    
    def _sanitize_filename(self, name: str) -> str:
        import re
        name = re.sub(r'[<>:\"/\\|?*]', '_', name)
        if len(name) > 150:
            name = name[:147] + '...'
        return name
    
    def _generate_content(self, data: Dict[str, Any], options: Dict) -> str:
        parts = []
        
        # Header
        meta = data.get('extraction_metadata', {})
        parts.append(self._header(data))
        
        # Quick summary
        parts.append(self._summary(data))
        
        # Content type specific sections
        content_type = data.get('content_type', 'unknown')
        
        if content_type == 'markdown':
            parts.append(self._markdown_analysis(data))
        elif content_type == 'code':
            parts.append(self._code_analysis(data))
        elif content_type == 'json':
            parts.append(self._json_analysis(data))
        elif content_type == 'yaml':
            parts.append(self._yaml_analysis(data))
        elif content_type == 'csv':
            parts.append(self._csv_analysis(data))
        elif content_type == 'text':
            parts.append(self._text_analysis(data))
        elif content_type == 'log':
            parts.append(self._log_analysis(data))
        elif content_type == 'env':
            parts.append(self._env_analysis(data))
        
        # Full text content (truncated if needed)
        if options.get('include_content', True):
            parts.append(self._content_section(data))
        
        # Relationships and tags
        parts.append(self._relationships_section(data))
        
        # Footer
        parts.append(self._footer(data))
        
        return '\n\n'.join(parts)
    
    def _header(self, data: Dict[str, Any]) -> str:
        meta = data.get('extraction_metadata', {})
        
        return f'''---
title: {meta.get('file_name', 'Unknown')}
type: dropzone_analysis
file_hash: {meta.get('file_hash', 'unknown')}
content_type: {data.get('content_type', 'unknown')}
extracted_at: {meta.get('extracted_at', datetime.now().isoformat())}
---

# 📄 {meta.get('file_name', 'Unknown')}

| Property | Value |
|----------|-------|
| **Content Type** | {data.get('content_type', 'unknown')} |
| **File Hash** | `{meta.get('file_hash', 'unknown')[:16]}...` |
| **Size** | {format_bytes(meta.get('file_size', 0))} |
| **Extension** | {meta.get('file_ext', 'none')} |
| **Extracted** | {meta.get('extracted_at', 'unknown')} |

'''
    
    def _summary(self, data: Dict[str, Any]) -> str:
        content_type = data.get('content_type', 'unknown')
        
        summary_lines = [f'## 📋 Summary\n']
        
        if content_type == 'code':
            summary_lines.append(f'- **Language:** {data.get(\"language\", \"Unknown\")}')
            summary_lines.append(f'- **Functions:** {data.get(\"function_count\", 0)}')
            summary_lines.append(f'- **Lines:** {data.get(\"line_count\", 0)}')
            summary_lines.append(f'- **Imports:** {data.get(\"import_count\", 0)}')
            
            if data.get('is_test_file'):
                summary_lines.append(f'- 🔬 **Test file detected**')
        
        elif content_type == 'markdown':
            summary_lines.append(f'- **Headers:** {data.get(\"header_count\", 0)}')
            summary_lines.append(f'- **Links:** {data.get(\"link_count\", 0)}')
            summary_lines.append(f'- **Code blocks:** {data.get(\"code_block_count\", 0)}')
            
            if data.get('is_documentation'):
                summary_lines.append(f'- 📚 **Documentation file**')
        
        elif content_type == 'json':
            summary_lines.append(f'- **Keys:** {data.get(\"structure\", {}).get(\"key_count\", \"?\")}')
            summary_lines.append(f'- **Type:** {data.get(\"structure\", {}).get(\"type\", \"unknown\")}')
        
        elif content_type == 'log':
            summary_lines.append(f'- **Errors:** {data.get(\"error_count\", 0)}')
            summary_lines.append(f'- **Lines:** {data.get(\"line_count\", 0)}')
            log_levels = data.get('log_levels', {})
            if log_levels.get('ERROR', 0) > 0:
                summary_lines.append(f'- ⚠️  **Contains errors!**')
        
        elif content_type == 'env':
            summary_lines.append(f'- **Variables:** {data.get(\"variable_count\", 0)}')
            summary_lines.append(f'- **Sensitive:** {data.get(\"sensitive_count\", 0)}')
            if data.get('has_sensitive'):
                summary_lines.append(f'- 🔐 **Contains sensitive data!**')
        
        else:
            summary_lines.append(f'- **Word count:** {data.get(\"word_count\", data.get(\"line_count\", 0))}')
        
        return '\n'.join(summary_lines)
    
    def _markdown_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 📝 Markdown Analysis\n']
        
        headers = data.get('headers', [])
        if headers:
            parts.append('### Headers')
            for h in headers[:15]:
                level = h.count('#') if h.startswith('#') else 1
                indent = '  ' * min(level - 1, 3)
                parts.append(f'{indent}- {h.replace(\"#\", \"\").strip()}')
        
        frontmatter = data.get('frontmatter', {})
        if frontmatter:
            parts.append('\n### Frontmatter')
            parts.append('```yaml')
            for k, v in frontmatter.items():
                parts.append(f'{k}: {v}')
            parts.append('```')
        
        return '\n'.join(parts)
    
    def _code_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 💻 Code Analysis\n']
        
        parts.append(f'**Language:** {data.get(\"language\", \"Unknown\")}\n')
        
        functions = data.get('functions', [])
        if functions:
            parts.append(f'\n### Functions ({data.get(\"function_count\", 0)} total)')
            for fn in functions[:20]:
                parts.append(f'- `{fn}()`')
        
        imports = data.get('imports', [])
        if imports:
            parts.append(f'\n### Imports ({data.get(\"import_count\", 0)} total)')
            for imp in imports[:15]:
                parts.append(f'- `{imp}`')
        
        if data.get('is_test_file'):
            parts.append('\n> 🔬 **Test file** - Unit or integration tests')
        
        return '\n'.join(parts)
    
    def _json_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 📊 JSON Structure\n']
        
        structure = data.get('structure', {})
        
        def describe_structure(s, indent=0):
            lines = []
            prefix = '  ' * indent
            
            if s.get('type') == 'object':
                lines.append(f'{prefix}**Object** with {s.get(\"key_count\", \"?\")} keys')
                for k, v in s.get('nested', {}).items():
                    lines.append(f'{prefix}- `{k}`:')
                    lines.extend(describe_structure(v, indent + 2)[:3])  # Limit depth
            elif s.get('type') == 'array':
                lines.append(f'{prefix}**Array** with {s.get(\"length\", \"?\")} items')
                if s.get('item_types'):
                    lines.append(f'{prefix}  Item types: {s.get(\"item_types\")}')
            else:
                lines.append(f'{prefix}{s.get(\"type\", \"unknown\")}')
            
            return lines
        
        parts.extend(describe_structure(structure)[:30])  # Limit output
        
        return '\n'.join(parts)
    
    def _yaml_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## ⚙️ YAML Analysis\n']
        
        keys = data.get('keys', [])
        if keys:
            parts.append(f'\n### Keys ({data.get(\"key_count\", 0)} total)')
            for key in keys[:30]:
                parts.append(f'- `{key}`')
        
        return '\n'.join(parts)
    
    def _csv_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 📈 CSV Analysis\n']
        
        parts.append(f'- **Rows:** {data.get(\"row_count\", 0)}')
        parts.append(f'- **Columns:** {data.get(\"column_count\", 0)}\n')
        
        headers = data.get('headers', [])
        if headers:
            parts.append('### Columns')
            for h in headers:
                parts.append(f'- `{h}`')
        
        sample_rows = data.get('sample_rows', [])
        if sample_rows:
            parts.append('\n### Sample Data')
            parts.append('```')
            parts.append(','.join(headers))
            for row in sample_rows[:3]:
                parts.append(','.join(str(v) for v in row))
            parts.append('```')
        
        return '\n'.join(parts)
    
    def _text_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 📃 Text Analysis\n']
        
        parts.append(f'- **Words:** {data.get(\"word_count\", 0)}')
        parts.append(f'- **Lines:** {data.get(\"line_count\", 0)}')
        parts.append(f'- **Characters:** {data.get(\"char_count\", 0)}')
        
        return '\n'.join(parts)
    
    def _log_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 📋 Log Analysis\n']
        
        log_levels = data.get('log_levels', {})
        
        parts.append('\n### Log Level Distribution')
        for level, count in log_levels.items():
            bar = '█' * min(count, 50)
            parts.append(f'- **{level}:** {count} {bar}')
        
        if log_levels.get('ERROR', 0) > 0:
            parts.append('\n> ⚠️ **WARNING:** This log contains ERROR entries!')
        
        return '\n'.join(parts)
    
    def _env_analysis(self, data: Dict[str, Any]) -> str:
        parts = ['## 🔐 Environment Variables\n']
        
        parts.append(f'- **Total variables:** {data.get(\"variable_count\", 0)}')
        parts.append(f'- **Sensitive variables:** {data.get(\"sensitive_count\", 0)}\n')
        
        if data.get('sensitive_variables'):
            parts.append('### ⚠️ Sensitive Variables (DO NOT COMMIT)')
            for v in data.get('sensitive_variables', [])[:10]:
                parts.append(f'- `{v}`')
            
            parts.append('\n> 🔐 **SECURITY WARNING:** This file contains sensitive data!')
            parts.append('> Move to `13__MISC/QUARANTINE/` or secrets manager.')
        
        return '\n'.join(parts)
    
    def _content_section(self, data: Dict[str, Any]) -> str:
        parts = ['## 📜 Content\n']
        
        text = data.get('text_content', '')
        
        if not text:
            parts.append('\n*No extractable text content.*')
            return '\n'.join(parts)
        
        # Truncate if too long
        max_chars = 10000
        if len(text) > max_chars:
            text = text[:max_chars] + f'\n\n... (truncated, {len(text) - max_chars} more characters)'
        
        parts.append('\n```')
        parts.append(text)
        parts.append('```')
        
        return '\n'.join(parts)
    
    def _relationships_section(self, data: Dict[str, Any]) -> str:
        parts = ['## 🔗 Relationships\n']
        
        content_type = data.get('content_type', '')
        language = data.get('language', '')
        
        # Suggest related content types
        related = []
        
        if content_type == 'code':
            related.extend(['text', 'markdown', 'yaml'])
        elif content_type == 'markdown':
            related.extend(['text', 'code', 'json'])
        elif content_type == 'json':
            related.extend(['yaml', 'csv', 'text'])
        
        if related:
            parts.append('\n### Related Content Types')
            parts.append(f'Based on this **{content_type}** file, you might want to explore:')
            for r in set(related):
                parts.append(f'- [[type:{r}]]')
        
        # Tags
        tags = data.get('tags', [])
        if tags:
            parts.append('\n### Tags')
            parts.append(', '.join(f'`{t}`' for t in tags))
        
        return '\n'.join(parts)
    
    def _footer(self, data: Dict[str, Any]) -> str:
        meta = data.get('extraction_metadata', {})
        
        return f'''

---

*Generated by Arkitekt DropZone on {datetime.now().isoformat()}*

- Source file: `{meta.get('file_path', 'unknown')}`
- File hash: `{meta.get('file_hash', 'unknown')}`
- Extractor version: {meta.get('extractor_version', '1.0.0')}
'''
    
    def generate_summary(self, session_id: str, files_data: List[Dict[str, Any]]) -> Path:
        output_path = self.output_root / f'{session_id}__SUMMARY.md'
        
        lines = [
            f'# DropZone Processing Summary',
            f'\n## Session: {session_id}',
            f'\nGenerated: {datetime.now().isoformat()}',
            f'\n## Files Processed: {len(files_data)}\n'
        ]
        
        # Group by content type
        by_type = {}
        for fd in files_data:
            ct = fd.get('content_type', 'unknown')
            if ct not in by_type:
                by_type[ct] = []
            by_type[ct].append(fd)
        
        lines.append('## By Content Type\n')
        for ct, files in sorted(by_type.items(), key=lambda x: -len(x[1])):
            lines.append(f'- **{ct.upper()}**: {len(files)} files')
        
        lines.append('\n## Files\n')
        for fd in files_data:
            meta = fd.get('extraction_metadata', {})
            lines.append(f'- [[{meta.get(\"file_name\", \"unknown\")}]] ({fd.get(\"content_type\", \"?\")})')
        
        lines.append(f'\n---\n*Generated by Arkitekt DropZone*')
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        
        print_step(f'Session summary: {output_path.name}')
        return output_path