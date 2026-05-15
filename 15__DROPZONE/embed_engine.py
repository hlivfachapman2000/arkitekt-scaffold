#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Embedding Engine (Ollama)
# ═══════════════════════════════════════════════════════════════
# Generates embeddings using Ollama's embedding models.
# Falls back to remote OpenAI-compatible API if configured.
# ═══════════════════════════════════════════════════════════════

import os
import json
import requests
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass

from drop_utils import Config, print_step, print_warn

@dataclass
class EmbeddingResult:
    embedding: List[float]
    model: str
    tokens: int
    latency_ms: float

class EmbeddingEngine:
    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = base_url or Config.OLLAMA_URL
        self.model = model or Config.EMBEDDING_MODEL
        self.embedding_dims = Config.EMBEDDING_DIMS
        
        # Session for connection pooling
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'Arkitekt-DropZone/1.0'
        })
        
        # Optional API key for remote endpoints
        self.api_key = os.environ.get('OPENAI_API_KEY', '')
        if self.api_key:
            self.session.headers['Authorization'] = f'Bearer {self.api_key}'
    
    def embed(self, text: str, model: Optional[str] = None) -> EmbeddingResult:
        model = model or self.model
        
        start_time = datetime.now()
        
        # Try Ollama first
        try:
            return self._embed_ollama(text, model, start_time)
        except Exception as e:
            print_warn(f'Ollama embed failed: {e}')
            # Fallback to OpenAI-compatible endpoint
            try:
                return self._embed_openai_compatible(text, model, start_time)
            except Exception as e2:
                raise RuntimeError(f'All embedding backends failed: {e2}')
    
    def _embed_ollama(self, text: str, model: str, start_time: datetime) -> EmbeddingResult:
        url = f'{self.base_url}/api/embeddings'
        payload = {'model': model, 'prompt': text}
        
        response = self.session.post(url, json=payload, timeout=120)
        response.raise_for_status()
        
        data = response.json()
        latency = (datetime.now() - start_time).total_seconds() * 1000
        
        return EmbeddingResult(
            embedding=data['embedding'],
            model=model,
            tokens=data.get('tokens', 0),
            latency_ms=latency
        )
    
    def _embed_openai_compatible(self, text: str, model: str, start_time: datetime) -> EmbeddingResult:
        # Use the explicit embedding URL from Config, with fallback to base_url
        base = self.base_url if self.base_url != 'http://localhost:11434' else Config.OLLAMA_URL
        url = f'{base}/v1/embeddings'
        payload = {
            'model': model,
            'input': text
        }
        
        response = self.session.post(url, json=payload, timeout=120)
        response.raise_for_status()
        
        data = response.json()
        latency = (datetime.now() - start_time).total_seconds() * 1000
        
        embedding = data['data'][0]['embedding']
        
        return EmbeddingResult(
            embedding=embedding,
            model=model,
            tokens=data.get('usage', {}).get('total_tokens', 0),
            latency_ms=latency
        )
    
    def embed_batch(self, texts: List[str], model: Optional[str] = None, 
                   batch_size: int = 10, fail_fast: bool = False) -> List[EmbeddingResult]:
        results = []
        for i, text in enumerate(texts):
            if not text.strip():  # Skip empty texts
                continue
            try:
                result = self.embed(text, model)
                results.append(result)
            except Exception as e:
                if fail_fast:
                    raise RuntimeError(f'Embedding failed at index {i}: {e}')
                print_warn(f'Embedding failed for text [{i}]: {e}')
                # Don't add zero-vector placeholders - skip failed embeddings
                # Zero vectors corrupt search results
        return results
    
    def embed_file(self, filepath: Path, max_chars: int = 100000) -> EmbeddingResult:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            text = f.read(max_chars)
        
        return self.embed(text)
    
    def embed_dict(self, data: Dict[str, Any]) -> List[EmbeddingResult]:
        texts = []
        
        # Combine relevant fields
        if 'text_content' in data:
            texts.append(data['text_content'][:50000])  # Limit per field
        
        if 'frontmatter' in data:
            texts.append(str(data['frontmatter']))
        
        if 'content_type' in data:
            ct = data.get('content_type', 'unknown')
            texts.append(f'This is a {ct} file.')
        
        if 'language' in data:
            lang = data.get('language', 'unknown')
            texts.append(f'Language: {lang}')
        
        if 'structure' in data:
            struct_str = str(data.get('structure', ''))[:2000]
            texts.append(f'Structure: {struct_str}')
        
        if not texts:
            fname = data.get('file_name', 'unknown')
            texts.append(f'File: {fname}')
        
        return self.embed_batch(texts)
    
    def health_check(self) -> bool:
        try:
            response = self.session.get(f'{self.base_url}/api/tags', timeout=10)
            if response.status_code == 200:
                # Check if embedding model is available
                data = response.json()
                models = [m['name'] for m in data.get('models', [])]
                if self.model in models or any('embedding' in m.lower() for m in models):
                    return True
            return False
        except Exception:
            return False
    
    def list_models(self) -> List[str]:
        try:
            response = self.session.get(f'{self.base_url}/api/tags', timeout=10)
            if response.status_code == 200:
                data = response.json()
                return [m['name'] for m in data.get('models', [])]
        except Exception:
            return []
    
    def get_embedding_dimension(self) -> int:
        return self.embedding_dims
    
    def cosine_similarity(self, a: List[float], b: List[float]) -> float:
        dot_product = sum(x * y for x, y in zip(a, b))
        norm_a = sum(x * x for x in a) ** 0.5
        norm_b = sum(x * x for x in b) ** 0.5
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return dot_product / (norm_a * norm_b)