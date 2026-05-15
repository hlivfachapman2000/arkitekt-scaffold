#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════
# DROPZONE — Vector Store (Qdrant)
# ═══════════════════════════════════════════════════════════════
# Stores and retrieves vector embeddings from Qdrant.
# Provides semantic search across all dropped content.
# ═══════════════════════════════════════════════════════════════

import os
import json
import requests
from typing import List, Dict, Any, Optional
from pathlib import Path
from datetime import datetime
import uuid

from drop_utils import Config, print_step, print_warn, safe_json_dump

class VectorStore:
    def __init__(self, index_dir: Path):
        self.index_dir = index_dir
        self.index_dir.mkdir(parents=True, exist_ok=True)
        
        self.url = Config.QDRANT_URL
        self.api_key = Config.QDRANT_API_KEY
        
        self.collection_name = Config.COLLECTION_NAME
        self.collection_name_meta = Config.COLLECTION_NAME_META
        
        self.session = requests.Session()
        if self.api_key:
            self.session.headers['api-key'] = self.api_key
        
        self._ensure_collection()
    
    def _ensure_collection(self):
        if not self.collection_exists(self.collection_name):
            self.create_collection(self.collection_name, Config.EMBEDDING_DIMS)
        
        if not self.collection_exists(self.collection_name_meta):
            self.create_collection(self.collection_name_meta, Config.EMBEDDING_DIMS)
    
    def _headers(self) -> Dict[str, str]:
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['api-key'] = self.api_key
        return headers
    
    def collection_exists(self, name: str) -> bool:
        try:
            response = self.session.get(
                f'{self.url}/collections/{name}',
                headers=self._headers(),
                timeout=10
            )
            return response.status_code == 200
        except Exception:
            return False
    
    def create_collection(self, name: str, vector_size: int, distance: str = 'Cosine'):
        payload = {
            'vectors': {
                'size': vector_size,
                'distance': distance
            }
        }
        
        try:
            response = self.session.put(
                f'{self.url}/collections/{name}',
                json=payload,
                headers=self._headers(),
                timeout=30
            )
            
            if response.status_code in (200, 201):
                print_step(f'Created collection: {name}')
            else:
                print_warn(f'Failed to create collection {name}: {response.text}')
        except Exception as e:
            print_warn(f'Collection creation error: {e}')
    
    def upsert(self, collection: str, points: List[Dict[str, Any]]) -> bool:
        if not points:
            return True
        
        payload = {
            'points': points
        }
        
        try:
            response = self.session.put(
                f'{self.url}/collections/{collection}/points',
                json=payload,
                headers=self._headers(),
                timeout=60
            )
            
            if response.status_code in (200, 201):
                return True
            else:
                print_warn(f'Upsert failed: {response.text}')
                return False
        except Exception as e:
            print_warn(f'Upsert error: {e}')
            return False
    
    def search(self, collection: str, query_vector: List[float], 
              top_k: int = 10, score_threshold: float = 0.0) -> List[Dict[str, Any]]:
        payload = {
            'vector': query_vector,
            'limit': top_k,
            'score_threshold': score_threshold
        }
        
        try:
            response = self.session.post(
                f'{self.url}/collections/{collection}/points/search',
                json=payload,
                headers=self._headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('result', [])
            else:
                print_warn(f'Search failed: {response.text}')
                return []
        except Exception as e:
            print_warn(f'Search error: {e}')
            return []
    
    def search_text(self, collection: str, query_text: str, 
                   embed_func, top_k: int = 10) -> List[Dict[str, Any]]:
        # First embed the query text
        result = embed_func(query_text)
        query_vector = result.embedding
        
        return self.search(collection, query_vector, top_k)
    
    def delete_point(self, collection: str, point_id: str) -> bool:
        try:
            response = self.session.delete(
                f'{self.url}/collections/{collection}/points/{point_id}',
                headers=self._headers(),
                timeout=10
            )
            return response.status_code in (200, 204)
        except Exception:
            return False
    
    def get_collection_info(self, collection: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.session.get(
                f'{self.url}/collections/{collection}',
                headers=self._headers(),
                timeout=10
            )
            if response.status_code == 200:
                return response.json()
            return None
        except Exception:
            return None
    
    def health_check(self) -> bool:
        try:
            response = self.session.get(f'{self.url}/health', timeout=10)
            return response.status_code == 200
        except Exception:
            return False
    
    def store_embedding(self, file_hash: str, filename: str, 
                        embedding: List[float], metadata: Dict[str, Any],
                        collection: Optional[str] = None) -> str:
        collection = collection or self.collection_name
        point_id = str(uuid.uuid4())
        
        point = {
            'id': point_id,
            'vector': embedding,
            'payload': {
                'file_hash': file_hash,
                'filename': filename,
                'stored_at': datetime.now().isoformat(),
                **metadata
            }
        }
        
        self.upsert(collection, [point])
        return point_id
    
    def store_content(self, content_data: Dict[str, Any], 
                     embedding: List[float]) -> str:
        file_hash = content_data.get('extraction_metadata', {}).get('file_hash', '')
        filename = content_data.get('extraction_metadata', {}).get('file_name', '')
        
        metadata = {
            'content_type': content_data.get('content_type', 'unknown'),
            'word_count': content_data.get('word_count', 0),
            'file_ext': content_data.get('extraction_metadata', {}).get('file_ext', ''),
        }
        
        return self.store_embedding(file_hash, filename, embedding, metadata)
    
    def semantic_search(self, query: str, embed_func, top_k: int = 10) -> List[Dict[str, Any]]:
        return self.search_text(self.collection_name, query, embed_func, top_k)
    
    def get_recent(self, collection: Optional[str] = None, 
                  limit: int = 50) -> List[Dict[str, Any]]:
        collection = collection or self.collection_name
        
        try:
            response = self.session.post(
                f'{self.url}/collections/{collection}/points/scroll',
                json={'limit': limit},
                headers=self._headers(),
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('result', {}).get('points', [])
            return []
        except Exception:
            return []
    
    def count(self, collection: Optional[str] = None) -> int:
        collection = collection or self.collection_name
        
        try:
            response = self.session.get(
                f'{self.url}/collections/{collection}',
                headers=self._headers(),
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('result', {}).get('vectors_count', 0)
            return 0
        except Exception:
            return 0