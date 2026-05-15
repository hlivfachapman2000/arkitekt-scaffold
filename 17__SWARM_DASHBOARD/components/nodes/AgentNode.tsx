import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '../../lib/utils';
import { Brain, Cpu, ShieldAlert, Activity, ChevronDown, Monitor, Box, Beaker, Code2 } from 'lucide-react';

export const AgentNode = memo(({ data }: { data: any }) => {
  const Icon = data.role === 'orchestrator' ? Brain : 
               data.role === 'critic' ? ShieldAlert :
               data.role === 'memory_keeper' ? Activity : Cpu;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-green-500';
      case 'idle': return 'bg-zinc-500';
      case 'crashed': return 'bg-red-500';
      case 'frozen': return 'bg-blue-400';
      default: return 'bg-zinc-700';
    }
  };

  return (
    <div 
      className={cn(
        "group relative bg-zinc-900 border-2 border-zinc-700 p-3 shadow-2xl transition-all w-56 flex flex-col gap-2 rounded-none",
        data.status === 'working' ? "border-zinc-500 shadow-green-500/10" : "border-zinc-800"
      )}
    >
      {/* State Badge */}
      <div className="absolute -top-2.5 -right-2.5 z-10 flex items-center gap-1.5 bg-zinc-950 border border-zinc-700 px-2 py-0.5 shadow-xl">
        <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", getStatusColor(data.status))} />
        <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{data.status}</span>
      </div>

      <Handle type="target" position={Position.Top} className="w-20 !bg-zinc-600 !border-0 !h-1 !rounded-none" />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-zinc-400" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-tighter text-zinc-200">
                {data.name}
            </span>
        </div>
        <div className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded-sm text-[8px] font-mono text-zinc-500">
            {data.model || "GEMINI_2.0"}
        </div>
      </div>

      {/* Context visualizer - simple bar for now */}
      <div className="space-y-1">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500">
              <span>CONTEXT_MINING</span>
              <span>{data.tokensUsed ? (data.tokensUsed / 128000 * 100).toFixed(1) : 0}%</span>
          </div>
          <div className="h-1 bg-zinc-950 w-full rounded-none overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000" 
                style={{ width: `${(data.tokensUsed / 128000 * 100) || 0}%` }} 
              />
          </div>
      </div>

      {/* Persona Switcher Dropdown Placeholder */}
      <div className="mt-1 flex items-center justify-between bg-black/40 border border-zinc-800 p-1.5 hover:bg-black/60 cursor-pointer transition-colors group/persona">
          <div className="flex items-center gap-2">
              <Monitor className="w-3 h-3 text-zinc-600 group-hover/persona:text-zinc-400" />
              <span className="text-[9px] font-bold uppercase tracking-tighter text-zinc-500 group-hover/persona:text-zinc-300">
                 {data.persona || "Deep-Researcher"}
              </span>
          </div>
          <ChevronDown className="w-2.5 h-2.5 text-zinc-700" />
      </div>

      <div className="border-t border-dashed border-zinc-800 mt-1 pt-2">
        <div className="text-[9px] font-mono flex items-center justify-between text-zinc-600 uppercase">
          Current Activity 
        </div>
        <div className="text-[9px] mt-1 line-clamp-2 italic text-zinc-400 leading-tight">
           &gt; {data.currentTask || "Idle cluster awaiting instructions..."}
        </div>
      </div>

      {/* Module Slots */}
      <div className="flex items-center gap-1 mt-2">
        {[1, 2, 3, 4].map(slot => (
            <div 
                key={slot} 
                className="w-4 h-4 border border-zinc-800 bg-black/20 flex items-center justify-center group/slot"
                title={`Module Slot ${slot}`}
            >
                {slot === 1 && data.modules?.includes('code') ? <Code2 className="w-2.5 h-2.5 text-blue-500" /> : 
                 slot === 2 && data.modules?.includes('search') ? <Beaker className="w-2.5 h-2.5 text-green-500" /> :
                 <Box className="w-2.5 h-2.5 text-zinc-800 group-hover/slot:text-zinc-600" />}
            </div>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-20 !bg-zinc-600 !border-0 !h-1 !rounded-none" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
