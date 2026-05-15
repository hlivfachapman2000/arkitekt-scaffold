import React from 'react';
import { LogEntry, Agent } from '../types';
import { cn } from '../lib/utils';
import { Terminal } from 'lucide-react';

export const CommunicationLog = ({ logs, agents }: { logs: LogEntry[], agents: Agent[] }) => {
  return (
    <div className="flex flex-col gap-3 font-mono text-xs overflow-y-auto pr-2 pb-4 h-full">
      <div className="sticky top-0 bg-zinc-950 pb-2 z-10 flex items-center gap-2 text-zinc-400 uppercase tracking-widest text-[10px] font-sans font-bold pt-1 border-b border-zinc-800/50 mb-2">
        <Terminal className="w-3 h-3" /> System Log (CLAW3D Stream)
      </div>
      <div className="flex flex-col gap-2 relative">
         {/* Vertical line indicator */}
         <div className="absolute left-1.5 top-2 bottom-2 w-px bg-zinc-800/50 -z-10" />
         
         {logs.map(log => {
          const fromName = agents.find(a => a.id === log.fromAgentId)?.name.replace('AGENT__', '') || log.fromAgentId;
          const toName = log.toAgentId ? (agents.find(a => a.id === log.toAgentId)?.name.replace('AGENT__', '') || log.toAgentId) : null;
          
          return (
            <div key={log.id} className="flex flex-col pl-4 py-1 hover:bg-zinc-900/30 rounded-none transition-colors group relative">
              <div className="absolute left-1 top-2.5 w-1.5 h-1.5 rounded-none bg-zinc-700 group-hover:bg-zinc-500 transition-colors" />
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-zinc-500 shrink-0">{log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <span className={cn(
                  "font-bold",
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-green-400' :
                  fromName === '_ORCHESTRATOR' ? 'text-purple-400' : 'text-blue-400'
                )}>
                  {fromName}
                </span>
                {toName && (
                  <>
                    <span className="text-zinc-600">→</span>
                    <span className="text-zinc-400 font-bold">{toName}</span>
                  </>
                )}
              </div>
              <p className="text-zinc-300 leading-relaxed break-words whitespace-pre-wrap ml-[68px]">
                {log.message}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  );
};
