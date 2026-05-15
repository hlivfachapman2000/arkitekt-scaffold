"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../../lib/utils';
import { Database, FileText, Globe, Archive, Search } from 'lucide-react';

export const KnowledgeNode = memo(({ data }: { data: any }) => {
  const Icon = data.knowledgeType === 'vector' ? Database :
               data.knowledgeType === 'file' ? FileText :
               data.knowledgeType === 'wiki' ? Globe : Archive;

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 p-3 shadow-2xl w-48 flex flex-col gap-2 rounded-none hover:border-zinc-500 transition-colors">
      <Handle type="target" position={Position.Top} className="!w-4 !bg-zinc-700 !border-0 !h-1 !rounded-none" />
      
      <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-zinc-400" />
          <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest">{data.label || 'VEC_STORE'}</span>
              <span className="text-[7px] text-zinc-600 uppercase font-black">{data.knowledgeType || 'MEMORY'}</span>
          </div>
      </div>

      <div className="mt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[8px] font-mono border-b border-zinc-800/50 pb-1">
              <span className="text-zinc-500">RECORDS</span>
              <span className="text-zinc-300">{data.recordCount || '1.2k'}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono border-b border-zinc-800/50 pb-1">
              <span className="text-zinc-500">INDEXED</span>
              <span className="text-zinc-300">{data.indexedAt || '12m AGO'}</span>
          </div>
      </div>

      <div className="flex gap-1 mt-1">
          <button className="flex-1 h-6 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center">
              <Search className="w-2.5 h-2.5 text-zinc-500" />
          </button>
          <button className="flex-1 h-6 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center font-mono text-[8px] text-zinc-400">
              RE-SYNC
          </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-4 !bg-zinc-700 !border-0 !h-1 !rounded-none" />
    </div>
  );
});
KnowledgeNode.displayName = 'KnowledgeNode';
