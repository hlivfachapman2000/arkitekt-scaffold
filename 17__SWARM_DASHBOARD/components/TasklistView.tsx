"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KanbanBoard } from './KanbanBoard';
import { INITIAL_TASKS, INITIAL_AGENTS } from '../store';
import { LayoutGrid, List, FileText, Lock, ChevronRight, Activity } from 'lucide-react';
import { cn } from '../lib/utils';
import Markdown from 'react-markdown';

const MOCK_TASKLIST_MD = `
# 🏗️ ARKITEKT MAIN TASKLIST

## [ACTIVE_SWARM_GOALS]
- [ ] Implement live traffic sniffer on React Flow edges
- [/] Build dynamic Swarm Kanban Board view (IN_PROGRESS: a4)
- [ ] Connect OpenViking context layer for L0/L1/L2 loading
- [ ] Integrate Karpatchy Autoresearch loop state in UI

## [CURRENT_RESOURCES]
- **Primary Harnesses**: Claude Code (90% health), Codex (75% health)
- **Memory**: Qdrant Vector DB (154k records)
- **Token Budget**: $124.50 / $500.00 (June 2026)

## [ARCHITECTURE_DECISIONS]
- Use \`framer-motion\` for all agent transitions.
- All inter-agent comms must be logged to \`05__AGENTS/_COMMUNICATION_LOGS/\`.
- No simulated infrastructure: pull real logs from memory bridge.
`;

export const TasklistView = () => {
  const [view, setView] = useState<'kanban' | 'markdown'>('kanban');

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="h-14 border-b border-zinc-800/50 px-6 flex items-center justify-between bg-zinc-900/10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setView('kanban')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
              view === 'kanban' ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Swarm_Kanban
          </button>
          <button 
            onClick={() => setView('markdown')}
            className={cn(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors",
              view === 'markdown' ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            TASKLIST.md
          </button>
        </div>

        <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none text-[9px] font-mono text-zinc-500">
                <Lock className="w-3 h-3 text-red-900" />
                AUTO_LOCKED_BY_ORCHESTRATOR
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-none text-[9px] font-mono text-green-500">
                <Activity className="w-3 h-3 animate-pulse" />
                SYNC_ONLINE
             </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {view === 'kanban' ? (
          <div className="p-6 h-full overflow-hidden flex flex-col">
            <KanbanBoard tasks={INITIAL_TASKS} agents={INITIAL_AGENTS} />
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-12 bg-zinc-900/20">
            <div className="max-w-3xl mx-auto prose prose-invert prose-zinc prose-sm">
                <div className="bg-zinc-950 border border-zinc-800 p-8 shadow-2xl font-mono text-xs leading-relaxed">
                    <Markdown>{MOCK_TASKLIST_MD}</Markdown>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
