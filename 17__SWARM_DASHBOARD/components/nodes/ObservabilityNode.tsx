"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../../lib/utils';
import { Radio, Activity, BarChart3, Search, Share2 } from 'lucide-react';

export const ObservabilityNode = memo(({ data }: { data: any }) => {
  return (
    <div className="group relative bg-zinc-950 border border-zinc-800 p-3 shadow-2xl w-60 flex flex-col gap-3 rounded-none">
      <Handle type="target" position={Position.Top} className="!w-full !bg-zinc-800 !h-0.5 !border-0 !top-0" />
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-[0.2em]">{data.label || 'TRAFFIC_SNIFFER'}</span>
          </div>
          <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <div className="w-1 h-1 rounded-full bg-blue-500/50" />
          </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1 p-1.5 bg-zinc-900 border border-zinc-800">
               <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1">
                   <Activity className="w-2.5 h-2.5" /> Latency
               </span>
               <span className="text-xs font-mono text-zinc-300">{data.latency || '24ms'}</span>
          </div>
          <div className="flex flex-col gap-1 p-1.5 bg-zinc-900 border border-zinc-800">
               <span className="text-[7px] text-zinc-500 uppercase font-black tracking-widest flex items-center gap-1">
                   <BarChart3 className="w-2.5 h-2.5" /> Tokens/s
               </span>
               <span className="text-xs font-mono text-zinc-300">{data.tokenRate || '412'}</span>
          </div>
      </div>

      <div className="h-10 bg-black/40 border border-zinc-800 relative overflow-hidden flex items-end">
          {/* Faux graph bars */}
          {[1,2,3,4,5,6,10,8,7,9,4,6,8,5,10,12].map((h, i) => (
              <div 
                  key={i} 
                  className="flex-1 bg-blue-500/30 border-t border-blue-500/50" 
                  style={{ height: `${h * 6}%`, transition: 'height 1s ease' }} 
              />
          ))}
          <div className="absolute top-1 left-2 text-[7px] text-zinc-600 font-mono">FLOW_METRICS</div>
      </div>

      <div className="flex items-center gap-2 border-t border-zinc-900 pt-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          <Share2 className="w-3 h-3 text-zinc-500" />
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Active Trace: 0x8a...4b1</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-full !bg-zinc-800 !h-0.5 !border-0 !bottom-0" />
    </div>
  );
});
ObservabilityNode.displayName = 'ObservabilityNode';
