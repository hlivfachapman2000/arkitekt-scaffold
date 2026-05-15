// components/tasklist/TasklistPanel.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useFlowStore } from '@/stores/flow-store';
import type { Task } from '@/types/nodes/task-node';

interface TasklistPanelProps {
  onClose: () => void;
}

export function TasklistPanel({ onClose }: TasklistPanelProps) {
  const tasks = useFlowStore((s) => s.tasks);
  const addTask = useFlowStore((s) => s.addTask);
  const updateTask = useFlowStore((s) => s.updateTask);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Get top 3 urgent tasks
  const urgentTasks = tasks
    .filter((t) => t.column !== 'done' && t.column !== 'archive')
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, icebox: 4 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 3);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: '',
      column: 'backlog',
      priority: 'medium',
      tags: [],
      createdBy: 'human',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      agentOutputs: [],
    };
    
    addTask(task);
    setNewTaskTitle('');
  };

  return (
    <div className={`flex h-full flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-neutral-700 px-4 py-3`}>
        <div className={`flex items-center gap-2`}>
          <span className={`text-lg`}>📋</span>
          <span className={`font-semibold text-white`}>TASKLIST.md</span>
          <span className={`rounded bg-green-900 px-2 py-0.5 text-xs text-green-300`}>SOURCE OF TRUTH</span>
        </div>
        <button onClick={onClose} className={`text-neutral-500 hover:text-white`}>✕</button>
      </div>

      {/* Add new task */}
      <div className={`border-b border-neutral-700 p-3`}>
        <div className={`flex gap-2`}>
          <input
            type={`text`}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder={`Add new task...`}
            className={`flex-1 rounded bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500`}
          />
          <button
            onClick={handleAddTask}
            className={`rounded bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600`}
          >
            +
          </button>
        </div>
      </div>

      {/* Top tasks from TASKLIST.md */}
      <div className={`flex-1 overflow-auto p-3`}>
        <div className={`mb-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
          Top Tasks from TASKLIST.md
        </div>
        
        {urgentTasks.length === 0 ? (
          <div className={`text-center text-sm text-neutral-600`}>
            No active tasks. All agents are idle.
          </div>
        ) : (
          <div className={`space-y-2`}>
            {urgentTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded border border-neutral-700 bg-neutral-800 p-3 ${
                  task.priority === 'critical' ? 'border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className={`flex items-start justify-between`}>
                  <div className={`flex-1`}>
                    <div className={`text-sm font-medium text-white`}>{task.title}</div>
                    {task.assignee && (
                      <div className={`mt-1 text-xs text-neutral-500`}>
                        Assigned to: {task.assignee.name}
                      </div>
                    )}
                  </div>
                  <select
                    value={task.column}
                    onChange={(e) => updateTask(task.id, { column: e.target.value as any })}
                    className={`rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-400`}
                  >
                    <option value={`backlog`}>Backlog</option>
                    <option value={`ready`}>Ready</option>
                    <option value={`in-progress`}>In Progress</option>
                    <option value={`review`}>Review</option>
                    <option value={`done`}>Done</option>
                  </select>
                </div>
                <div className={`mt-2 flex items-center gap-2`}>
                  <span className={`rounded px-2 py-0.5 text-xs ${
                    task.priority === 'critical' ? 'bg-red-900 text-red-300' :
                    task.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                    'bg-neutral-700 text-neutral-400'
                  }`}>
                    {task.priority}
                  </span>
                  {task.blockedBy && task.blockedBy.length > 0 && (
                    <span className={`text-xs text-red-400`}>🔒 Blocked</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className={`border-t border-neutral-700 p-3`}>
        <div className={`flex items-center justify-between text-xs text-neutral-500`}>
          <span>Total: {tasks.length}</span>
          <span>Completed: {tasks.filter((t) => t.column === 'done').length}</span>
        </div>
      </div>
    </div>
  );
}