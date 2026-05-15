// components/kanban/KanbanPanel.tsx

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '@/stores/flow-store';
import type { KanbanColumn, Task } from '@/types/nodes/task-node';

interface KanbanPanelProps {
  onClose: () => void;
}

const COLUMNS: { id: KanbanColumn; label: string }[] = [
  { id: 'backlog', label: 'BACKLOG' },
  { id: 'ready', label: 'READY' },
  { id: 'in-progress', label: 'IN PROGRESS' },
  { id: 'review', label: 'REVIEW' },
  { id: 'done', label: 'DONE' },
];

export function KanbanPanel({ onClose }: KanbanPanelProps) {
  const tasks = useFlowStore((s) => s.tasks);
  const moveTask = useFlowStore((s) => s.moveTask);
  const assignTask = useFlowStore((s) => s.assignTask);
  const nodes = useFlowStore((s) => s.nodes);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanColumn | null>(null);

  const agents = nodes.filter((n) => n.type === 'agent');

  const getTasksByColumn = (column: KanbanColumn) =>
    tasks.filter((t) => t.column === column);

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent, column: KanbanColumn) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = (column: KanbanColumn) => {
    if (draggedTask) {
      moveTask(draggedTask, column);
      setDraggedTask(null);
      setDragOverColumn(null);
    }
  };

  return (
    <div className={`flex h-full flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-white px-4 py-2`}>
        <div className={`flex items-center gap-3`}>
          <span className={`text-xs font-mono uppercase tracking-widest`}>KANBAN</span>
          <span className={`border border-white/40 px-1 py-0.5 text-xs font-mono text-gray-500`}>
            AUTO-SYNC
          </span>
        </div>
        <button onClick={onClose} className={`text-xs font-mono text-gray-500 hover:text-white`}>
          [X]
        </button>
      </div>

      {/* Kanban board */}
      <div className={`flex-1 overflow-auto p-2`}>
        <div className={`flex gap-2`}>
          {COLUMNS.map((col) => {
            const columnTasks = getTasksByColumn(col.id);
            const isInProgress = col.id === 'in-progress';
            const wipLimit = isInProgress ? 3 : undefined;
            const exceeded = isInProgress && columnTasks.length >= (wipLimit || Infinity);

            return (
              <div
                key={col.id}
                className={`
                  min-w-28 flex-1 border border-white bg-black p-2
                  ${dragOverColumn === col.id ? 'ring-1 ring-white' : ''}
                  ${exceeded ? 'ring-1 ring-white' : ''}
                `}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(col.id)}
              >
                {/* Column header */}
                <div className={`mb-2 flex items-center justify-between border-b border-white/20 pb-2`}>
                  <span className={`text-xs font-mono uppercase tracking-wider text-gray-400`}>
                    {col.label}
                  </span>
                  <span className={`border border-white/20 px-1 py-0.5 text-xs font-mono text-gray-500`}>
                    {columnTasks.length}
                    {wipLimit && `/${wipLimit}`}
                  </span>
                </div>

                {/* WIP limit warning */}
                {exceeded && (
                  <div className={`mb-2 border border-white px-2 py-1 text-xs font-mono text-gray-400`}>
                    WIP LIMIT EXCEEDED
                  </div>
                )}

                {/* Tasks */}
                <div className={`space-y-2`}>
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task.id)}
                      className={`
                        cursor-grab border border-white/20 bg-black p-2
                        ${draggedTask === task.id ? 'opacity-50' : ''}
                        ${task.priority === 'critical' ? 'border-l-2 border-l-white' : ''}
                      `}
                    >
                      <div className={`text-xs font-mono text-white`}>{task.title}</div>

                      {/* Assignee */}
                      {task.assignee ? (
                        <div className={`mt-1 text-xs font-mono text-gray-500`}>
                          {task.assignee.name}
                        </div>
                      ) : (
                        <select
                          value={``}
                          onChange={(e) => {
                            if (e.target.value) {
                              assignTask(task.id, e.target.value);
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-1 w-full border border-white/20 bg-black px-1 py-0.5 text-xs font-mono text-gray-400`}
                        >
                          <option value={``}>ASSIGN...</option>
                          {agents.map((agent) => (
                            <option key={agent.id} value={agent.id}>
                              {(agent.data as any).name || agent.id.slice(0, 8)}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Priority */}
                      {task.priority && (
                        <div className={`mt-1`}>
                          <span className={`
                            border border-white/20 px-1 py-0.5 text-xs font-mono
                            ${task.priority === 'critical' ? 'text-white' : 'text-gray-500'}
                          `}>
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent workload summary */}
      <div className={`border-t border-white p-3`}>
        <div className={`mb-2 text-xs font-mono uppercase tracking-wider text-gray-500`}>
          AGENT WORKLOAD
        </div>
        <div className={`space-y-1`}>
          {agents.slice(0, 4).map((agent) => {
            const agentTasks = tasks.filter(
              (t) => t.assignee?.id === agent.id && t.column === 'in-progress'
            );
            const agentData = agent.data as any;
            return (
              <div key={agent.id} className={`flex items-center justify-between text-xs font-mono`}>
                <span className={`text-gray-400`}>
                  {agentData.name || agent.id.slice(0, 8)}
                </span>
                <span className={agentTasks.length >= 3 ? 'text-white' : 'text-gray-500'}>
                  {agentTasks.length} tasks
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}