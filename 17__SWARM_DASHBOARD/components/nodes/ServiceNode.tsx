"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../../lib/utils';
import { Database, Link2, ShieldCheck, Zap, Activity } from 'lucide-react';

export const ServiceNode = memo(({ data }: { data: any }) => {
  return (
    <div 
      className={cn(
        "group relative bg-zinc-950 border border-zinc-800 p-3 shadow-2xl transition-all w-56 flex flex-col gap-2 rounded-none",
        data.status === 'error' ? "border-red-900 shadow-red-900/10" : ""
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-4 !bg-zinc-700 !border-0 !h-1 !rounded-none" />
      
      <div className="flex items-center gap-2">
          <div className="p-1.5 bg-zinc-900 border border-zinc-800">
             <Link2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex flex-col">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-200 truncate">
                  {data.label || 'INTEGRATION'}
              </span>
              <span className="text-[7px] text-zinc-600 uppercase font-bold tracking-tighter">
                  SERVICE_REGISTRY
              </span>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-1 mt-1">
          <div className="bg-zinc-900/50 border border-zinc-800 p-1 flex items-center justify-between">
              <ShieldCheck className="w-2.5 h-2.5 text-zinc-600" />
              <span className="text-[8px] font-mono text-zinc-400">AUTH: OK</span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-1 flex items-center justify-between">
              <Zap className="w-2.5 h-2.5 text-zinc-600" />
              <span className="text-[8px] font-mono text-zinc-400">LAT: 12ms</span>
          </div>
      </div>

      <div className="border-t border-zinc-900 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
              <div className={cn("w-1.5 h-1.5 rounded-full", data.status === 'online' ? 'bg-green-500' : 'bg-red-500')} />
              <span className="text-[8px] font-bold text-zinc-500 uppercase">{data.status || 'OFFLINE'}</span>
          </div>
          <Activity className="w-2.5 h-2.5 text-zinc-800" />
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-4 !bg-zinc-700 !border-0 !h-1 !rounded-none" />
    </div>
  );
});

ServiceNode.displayName = 'ServiceNode';
