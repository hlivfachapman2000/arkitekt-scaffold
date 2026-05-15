// types/nodes/memory-node.ts

export type MemoryBackend = 'pgvector' | 'sqlite-vec' | 'chroma' | 'weaviate' | 'lm-studio-embed' | 'file-system';

export type EmbeddingModel = 'e5-mistral-7b' | 'text-embedding-3-large' | 'gte-large' | 'custom';

export interface MemoryIndex {
  id: string;
  name: string;
  documentCount: number;
  vectorDimension: number;
  lastIndexed: string;
  sizeBytes: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number; // 0-1
  evictedCount: number;
  ttlSeconds: number;
}

export interface MemoryNodeData {
  type: 'memory';
  memoryId: string;
  name: string;
  backend: MemoryBackend;
  embeddingModel: EmbeddingModel;
  embeddingDimension: number;
  indices: MemoryIndex[];
  cache?: {
    enabled: boolean;
    stats: CacheStats;
    maxSize: number;
  };
  fileDropEnabled: boolean;
  autoChunkSize: number;
  autoChunkOverlap: number;
  connectedAgents: string[];
  totalDocuments: number;
  totalVectors: number;
  storageUsedBytes: number;
  lastQuery: string;
  lastQueryLatencyMs: number;
}

export interface MemoryNodeConfig {
  maxIndices: 10;
  maxFileSizeMb: 50;
  supportedFormats: string[];
  autoIndexOnDrop: boolean;
}