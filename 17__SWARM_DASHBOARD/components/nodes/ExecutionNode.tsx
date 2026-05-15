"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../../lib/utils';
import { Play, Pause, RotateCcw, FastForward, Terminal } from 'lucide-react';

export const ExecutionNode = memo(({ data }: { data: any }) => {
  return (
    <div className="group relative bg-zinc-900 border border-zinc-700 p-3 shadow-2xl w-48 flex flex-col gap-2 rounded-none">
      <Handle type="target" position={Position.Top} className="!w-full !bg-zinc-800 !h-0.5 !border-0 !top-0" />
      <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-bold text-zinc-200 uppercase tracking-widest">{data.label || 'LOOP_CTL'}</span>
      </div>
      <div className="flex gap-1">
          <button className="flex-1 h-6 bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <Play className="w-2.5 h-2.5 fill-current" />
          </button>
          <button className="flex-1 h-6 bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <Pause className="w-2.5 h-2.5" />
          </button>
          <button className="flex-1 h-6 bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors">
              <RotateCcw className="w-2.5 h-2.5" />
          </button>
      </div>
      <div className="mt-1 p-1.5 bg-black/40 border border-zinc-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase">
              <span>Concurrency</span>
              <span>x{data.concurrency || 1}</span>
          </div>
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase">
              <span>Dry Run</span>
              <span className={data.dryRun ? 'text-blue-400' : 'text-zinc-700'}>{data.dryRun ? 'ENABLED' : 'OFF'}</span>
          </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-full !bg-zinc-800 !h-0.5 !border-0 !bottom-0" />
    </div>
  );
});
ExecutionNode.displayName = 'ExecutionNode';
