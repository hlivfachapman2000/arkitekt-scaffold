import React from 'react';
import { Agent } from '../types';
import { cn } from '../lib/utils';
import { Activity, Brain, ShieldAlert, Cpu } from 'lucide-react';

export const AgentCard = ({ agent }: { agent: Agent }) => {
  const isWorking = agent.status === 'working';
  
  return (
    <div className={cn(
      "p-4 rounded-xl border bg-zinc-900/50 backdrop-blur-sm transition-all relative overflow-hidden",
      isWorking ? "border-green-500/30" : "border-zinc-800",
      agent.status === 'offline' && "opacity-50 grayscale"
    )}>
      {isWorking && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse" />}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {agent.role === 'orchestrator' && <Brain className="w-5 h-5 text-purple-400" />}
          {agent.role === 'critic' && <ShieldAlert className="w-5 h-5 text-red-400" />}
          {agent.role === 'memory_keeper' && <Activity className="w-5 h-5 text-blue-400" />}
          {agent.role === 'worker' && <Cpu className="w-5 h-5 text-zinc-400" />}
          <h3 className="font-mono text-sm font-semibold tracking-tight">{agent.name}</h3>
        </div>
        
        <div className={cn(
          "px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full",
          isWorking ? "bg-green-500/10 text-green-400" :
          agent.status === 'idle' ? "bg-blue-500/10 text-blue-400" :
          "bg-zinc-800 text-zinc-500"
        )}>
          {agent.status}
        </div>
      </div>
      
      <p className="text-xs text-zinc-400 mb-4 h-8">{agent.description}</p>
      
      <div className="flex justify-between items-center text-xs font-mono">
        <div className="text-zinc-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-zinc-700" />
          {agent.tokensUsed.toLocaleString()} tkns
        </div>
        {agent.currentTask && (
          <div className="text-zinc-300 truncate max-w-[120px] ml-2" title={`Task: ${agent.currentTask}`}>
            {agent.currentTask}
          </div>
        )}
      </div>
    </div>
  );
};
