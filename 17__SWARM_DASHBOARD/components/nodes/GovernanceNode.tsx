"use client";
import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../../lib/utils';
import { ShieldAlert, DollarSign, Fingerprint, Gavel, Eye } from 'lucide-react';

export const GovernanceNode = memo(({ data }: { data: any }) => {
  return (
    <div className="group relative bg-zinc-950 border-2 border-red-950/30 p-3 shadow-2xl w-52 flex flex-col gap-2 rounded-none">
      <Handle type="target" position={Position.Top} className="!bg-red-900 !h-1" />
      <div className="flex items-center gap-2 border-b border-red-900/20 pb-2 mb-1">
          <Gavel className="w-4 h-4 text-red-500" />
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-red-100 uppercase tracking-tighter">{data.label || 'APPROVAL_GATE'}</span>
              <span className="text-[7px] text-red-900 uppercase font-black tracking-widest">GOVERNANCE_PROTOCOL</span>
          </div>
      </div>
      <div className="space-y-2 py-1">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 opacity-60">
                 <DollarSign className="w-2.5 h-2.5 text-zinc-400" />
                 <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Budget Cap</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-300">${data.budget || '1.00'}</span>
          </div>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 opacity-60">
                 <ShieldAlert className="w-2.5 h-2.5 text-zinc-400" />
                 <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Risk Level</span>
              </div>
              <span className={cn("text-[9px] font-bold px-1 uppercase", data.risk === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400')}>
                 {data.risk || 'Low'}
              </span>
          </div>
      </div>
      <div className="mt-1 flex gap-1">
           <button className="flex-1 h-7 bg-red-950/20 border border-red-900/40 text-[9px] font-black text-red-500 uppercase hover:bg-red-900/20 transition-all">Reject</button>
           <button className="flex-1 h-7 bg-green-950/20 border border-green-900/40 text-[9px] font-black text-green-500 uppercase hover:bg-green-900/20 transition-all">Approve</button>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-red-900 !h-1" />
    </div>
  );
});
GovernanceNode.displayName = 'GovernanceNode';
