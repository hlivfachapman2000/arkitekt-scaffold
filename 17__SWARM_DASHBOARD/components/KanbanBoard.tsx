import React from 'react';
import { Task, Agent } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { User, Activity, Circle, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const COLUMN_CONFIG = {
  backlog: { icon: Circle, color: 'text-zinc-600' },
  todo: { icon: Clock, color: 'text-zinc-500' },
  doing: { icon: Activity, color: 'text-blue-500' },
  review: { icon: AlertCircle, color: 'text-yellow-500' },
  done: { icon: CheckCircle2, color: 'text-green-500' },
};

export const KanbanBoard = ({ tasks, agents }: { tasks: Task[], agents: Agent[] }) => {
  const columns = ['backlog', 'todo', 'doing', 'review', 'done'] as const;

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4 scrollbar-hide">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col);
        const config = COLUMN_CONFIG[col];
        const Icon = config.icon;

        return (
          <div key={col} className="w-80 shrink-0 flex flex-col gap-3 bg-zinc-950/20 border border-zinc-900 rounded-none overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-zinc-900 bg-zinc-900/10">
              <div className="flex items-center gap-2">
                <Icon className={cn("w-3.5 h-3.5", config.color)} />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  {col}
                </h3>
              </div>
              <span className="text-[9px] font-mono bg-zinc-900 text-zinc-500 px-2 py-0.5 border border-zinc-800">
                {colTasks.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3 p-3 flex-1 overflow-y-auto min-h-0">
              <AnimatePresence mode="popLayout">
                {colTasks.map(task => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={task.id} 
                    className="bg-zinc-900/40 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors group relative"
                  >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[7px] font-black border border-zinc-800 px-1 text-zinc-600 uppercase">
                            UID::{task.id}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-zinc-600 transition-colors" />
                    </div>

                    <h4 className="text-xs font-medium text-zinc-200 mb-4 leading-relaxed italic border-l-2 border-zinc-800 pl-3">
                        {task.title}
                    </h4>

                    {task.assigneeId && (
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                                <User className="w-3 h-3 text-zinc-500" />
                            </div>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-tighter">
                                {agents.find(a => a.id === task.assigneeId)?.name || 'UNKNOWN'}
                            </span>
                        </div>
                        <span className="text-[7px] font-mono text-zinc-700">T::{new Date().toLocaleDateString()}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
};
