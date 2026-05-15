#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Utility Functions
# ═══════════════════════════════════════════════════════════════

import os
import hashlib
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import sys

try:
    from dotenv import load_dotenv
    DOTENV_LOADED = True
except ImportError:
    DOTENV_LOADED = False

# ANSI colors
GREEN = '\u001b[32m'
YELLOW = '\u001b[33m'
BLUE = '\u001b[34m'
CYAN = '\u001b[36m'
BOLD = '\u001b[1m'
RESET = '\u001b[0m'

def load_env():
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists() and DOTENV_LOADED:
        load_dotenv(env_path)
    elif not DOTENV_LOADED:
        import warnings
        warnings.warn('python-dotenv not found. .env values will not be loaded.')

def ensure_dirs(drop_root: Path):
    dirs = [
        'DROPPED', 'PROCESSED', 'ORGANIZED', 'INDEX',
        'WORKFLOWS/scripts', 'WORKFLOWS/pipelines',
        'ANALYSIS/sessions', 'ANALYSIS/embeddings', 'ANALYSIS/metadata',
        'ANALYSIS/structure', 'ANALYSIS/similarity',
        'REPORTS', 'SUMMARY_MD'
    ]
    for d in dirs:
        (drop_root / d).mkdir(parents=True, exist_ok=True)

def get_file_hash(filepath: Path, algorithm: str = 'sha256') -> str:
    hasher = hashlib.new(algorithm)
    with open(filepath, 'rb') as f:
        for chunk in iter(lambda: f.read(8192), b''):
            hasher.update(chunk)
    return hasher.hexdigest()

def format_bytes(size: int) -> str:
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size < 1024:
            return f'{size:.1f} {unit}'
        size /= 1024
    return f'{size:.1f} PB'

def format_duration(seconds: float) -> str:
    if seconds < 60:
        return f'{seconds:.1f}s'
    elif seconds < 3600:
        return f'{seconds/60:.1f}m'
    else:
        return f'{seconds/3600:.1f}h'

def get_timestamp_id() -> str:
    return datetime.now().strftime('%Y%m%d_%H%M%S')

def print_header(title: str):
    width = 60
    print()
    print(f'{CYAN}{BOLD}{chr(9552) * width}{RESET}')
    print(f'{CYAN}{BOLD}  {title}{RESET}')
    print(f'{CYAN}{BOLD}{chr(9552) * width}{RESET}')

def print_step(msg: str, icon: str = '▸'):
    print(f'{GREEN}{icon} {msg}{RESET}')

def print_info(msg: str):
    print(f'{BLUE}  {chr(8467)}  {msg}{RESET}')

def print_warn(msg: str):
    print(f'{YELLOW}  {chr(9998)}  {msg}{RESET}')

def sanitize_filename(name: str) -> str:
    import re
    name = re.sub(r'[^\u00C0-\u024F\u1E00-\u1EFFa-zA-Z0-9_.-]', '_', name)
    return name[:200]

def read_env(key: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(key, default)

def get_env_or_fail(key: str, error_msg: Optional[str] = None) -> str:
    value = os.environ.get(key)
    if not value:
        raise EnvironmentError(error_msg or f'Required env var {key} not set')
    return value

def chunk_list(lst: list, chunk_size: int) -> list:
    return [lst[i:i+chunk_size] for i in range(0, len(lst), chunk_size)]

def merge_dicts(*dicts: Dict) -> Dict:
    result = {}
    for d in dicts:
        result.update(d)
    return result

def safe_json_dump(obj: Any, path: Path, indent: int = 2):
    import json
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(obj, f, indent=indent, ensure_ascii=False, default=str)

def safe_json_load(path: Path) -> Any:
    import json
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

class Config:
    # Ollama / Embedding
    OLLAMA_URL = os.environ.get('LOCAL_OLLAMA_NETWORK_URL', 'http://localhost:11434')
    EMBEDDING_URL = os.environ.get('LOCAL_EMBEDDING_URL', f'{OLLAMA_URL}/v1/embeddings')
    EMBEDDING_MODEL = os.environ.get('LOCAL_EMBEDDING_MODEL', 'qwen3-embedding:8b')
    EMBEDDING_DIMS = int(os.environ.get('LOCAL_EMBEDDING_DIMS', '4096'))
    
    # Qdrant
    QDRANT_URL = os.environ.get('QDRANT_URL', 'http://localhost:6333')
    QDRANT_API_KEY = os.environ.get('QDRANT_API_KEY', '')
    
    # Paths
    DROP_ROOT = Path(__file__).parent.resolve()
    INDEX_DIR = DROP_ROOT / 'INDEX'
    
    # Processing
    BATCH_SIZE = int(os.environ.get('DROPZONE_BATCH_SIZE', '10'))
    MAX_FILE_SIZE = int(os.environ.get('DROPZONE_MAX_FILE_SIZE', '100_000_000'))  # 100MB
    
    # Collections
    COLLECTION_NAME = 'arkitekt_dropzone'
    COLLECTION_NAME_META = 'arkitekt_dropzone_meta'

Config = Config()