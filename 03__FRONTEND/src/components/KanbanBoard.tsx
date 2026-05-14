/**
 * KanbanBoard — adapted from SITK.DEV-AGENTIC-FOUNDATION
 * Reads real task data from agent KANBAN.md files via /api/kanban
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  agent: string;
  status: 'backlog' | 'doing' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
}

const COLUMNS: { id: Task['status']; label: string; accent: string }[] = [
  { id: 'backlog', label: 'Backlog',    accent: '#444' },
  { id: 'doing',   label: 'Processing', accent: '#f59e0b' },
  { id: 'review',  label: 'Validation', accent: '#60a5fa' },
  { id: 'done',    label: 'Archived',   accent: '#22c55e' },
];

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#3b82f6',
};

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-3 hover:border-[#2a2a2a] transition-colors cursor-grab active:cursor-grabbing"
    >
      <p className="text-[11px] text-[#ccc] leading-snug mb-2">{task.title}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-[8px] font-mono text-[#666]">
            {task.agent.charAt(0)}
          </div>
          <span className="text-[9px] font-mono text-[#444] truncate max-w-[80px]">{task.agent}</span>
        </div>
        <span
          className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded"
          style={{ color: PRIORITY_COLOR[task.priority], background: `${PRIORITY_COLOR[task.priority]}15` }}
        >
          {task.priority}
        </span>
      </div>
    </motion.div>
  );
}

export function KanbanBoard() {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/kanban')
      .then(r => r.json())
      .then(d => setTasks(d.tasks ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="h-full flex flex-col p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#555]">
          Active Flows — Agent Kanban
        </h2>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-[9px] font-mono text-[#555] hover:text-[#888] transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="flex flex-col min-h-0">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: col.accent }} />
                  <span className="text-[10px] font-mono uppercase text-[#555]">{col.label}</span>
                </div>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a]"
                  style={{ color: col.accent }}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {colTasks.map(task => <TaskCard key={task.id} task={task} />)}
                {colTasks.length === 0 && !loading && (
                  <div className="text-[9px] font-mono text-[#2a2a2a] text-center pt-6">
                    — empty —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
