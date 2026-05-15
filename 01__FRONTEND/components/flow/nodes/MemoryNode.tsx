// components/flow/nodes/MemoryNode.tsx

'use client';

import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FileUploadCompact } from '@/components/ui/file-upload-compact';
import type { MemoryNodeData } from '@/types/nodes/memory-node';

interface MemoryNodeProps { data: any; selected?: boolean; }
function MemoryNodeComponent({ data, selected }: MemoryNodeProps) {
  const memoryData = data as unknown as MemoryNodeData;
  const [showInspector, setShowInspector] = useState(false);
  const storageGb = memoryData.storageUsedBytes / (1024 * 1024 * 1024);

  return (
    <div
      className={`w-56 border border-white bg-black ${selected ? 'border-2' : ''}`}
      onDoubleClick={() => setShowInspector(!showInspector)}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-white px-3 py-2`}>
        <span className={`text-xs font-medium text-white`}>{memoryData.name}</span>
      </div>

      {/* Backend */}
      <div className={`flex items-center justify-between border-b border-white px-3 py-1`}>
        <span className={`border border-white px-1 py-0.5 text-xs text-white`}>
          {memoryData.backend}
        </span>
        <span className={`text-xs text-gray-500`}>{memoryData.embeddingDimension}d</span>
      </div>

      {/* Stats */}
      <div className={`border-b border-white px-3 py-1`}>
        <div className={`flex items-center justify-between text-xs`}>
          <span className={`text-gray-500`}>DOCS</span>
          <span className={`text-white`}>{memoryData.totalDocuments.toLocaleString()}</span>
        </div>
        <div className={`flex items-center justify-between text-xs`}>
          <span className={`text-gray-500`}>VECS</span>
          <span className={`text-white`}>{memoryData.totalVectors.toLocaleString()}</span>
        </div>
        <div className={`flex items-center justify-between text-xs`}>
          <span className={`text-gray-500`}>STOR</span>
          <span className={`text-white`}>{storageGb.toFixed(1)}G</span>
        </div>
      </div>

      {/* Cache */}
      {memoryData.cache && (
        <div className={`border-b border-white px-3 py-1`}>
          <div className={`flex items-center justify-between text-xs`}>
            <span className={`text-gray-500`}>CACHE</span>
            <span className={`text-white`}>{(memoryData.cache.stats.hitRate * 100).toFixed(0)}%</span>
          </div>
          <div className={`h-1 w-full bg-gray-900`}>
            <div className={`h-full bg-white`} style={{ width: `${memoryData.cache.stats.hitRate * 100}%` }} />
          </div>
        </div>
      )}

      {/* Indices */}
      <div className={`border-b border-white px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>INDICES: {memoryData.indices.length}</span>
      </div>

      {/* File drop */}
      {memoryData.fileDropEnabled && (
        <div className={`border-b border-white px-3 py-1`}>
          <FileUploadCompact
            onFilesUploaded={(files) => {
              console.log('[MemoryNode] Files uploaded:', files.map(f => f.name));
            }}
            className={`w-full`}
          />
        </div>
      )}

      {/* Connected agents */}
      <div className={`flex items-center justify-between px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>{memoryData.connectedAgents.length} agents</span>
        <button
          onClick={() => setShowInspector(!showInspector)}
          className={`text-xs text-white border border-white px-1`}
        >
          INSPECT
        </button>
      </div>

      {/* Handles */}
      <Handle type={`target`} position={Position.Top} className={`!bg-white`} />
      <Handle type={`source`} position={Position.Bottom} className={`!bg-white`} />
      <Handle type={`target`} position={Position.Left} id={`input`} className={`!bg-gray-500`} />
      <Handle type={`source`} position={Position.Right} id={`query`} className={`!bg-gray-500`} />

      {/* Inspector */}
      {showInspector && (
        <div className={`absolute -right-64 top-0 z-50 w-60 border border-white bg-black p-2`}>
          <div className={`mb-2 flex items-center justify-between border-b border-white pb-2`}>
            <span className={`text-xs text-white`}>MEMORY INSPECTOR</span>
            <button onClick={() => setShowInspector(false)} className={`text-xs text-gray-500`}>X</button>
          </div>
          <input
            type={`text`}
            placeholder={`Search...`}
            className={`w-full border border-white bg-black px-2 py-1 text-xs text-white`}
          />
        </div>
      )}
    </div>
  );
}

export const MemoryNode = memo(MemoryNodeComponent);