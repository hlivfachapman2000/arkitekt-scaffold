'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface TasklistNodeProps {
  data: any;
  selected?: boolean;
}

const TasklistNode = memo(({ data, selected }: TasklistNodeProps) => {
  const tasklistData = data as any;
  const totalTasks = tasklistData.totalTasks || 0;
  const completedTasks = tasklistData.completedTasks || 0;
  const columns = tasklistData.columns || [];
  const tasks = tasklistData.tasks || [];

  return (
    <div
      className={`
        relative w-56 border border-white bg-black p-3
        ${selected ? 'ring-1 ring-white' : ''}
      `}
    >
      <Handle type='target' position={Position.Left} className='!border-white !bg-black' />
      
      {/* Header */}
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-xs font-mono uppercase tracking-widest'>TASKLIST</span>
        <span className='text-xs font-mono text-gray-500'>
          {completedTasks}/{totalTasks}
        </span>
      </div>

      {/* Name */}
      <div className='mb-2 border-b border-white/20 pb-2'>
        <span className='text-xs font-mono'>
          {tasklistData.name || 'Tasklist'}
        </span>
      </div>

      {/* Columns */}
      <div className='mb-2 space-y-1'>
        <span className='text-xs font-mono text-gray-500'>COLUMNS</span>
        <div className='flex flex-wrap gap-1'>
          {columns.map((col: string) => (
            <span key={col} className='text-xs font-mono text-gray-400'>
              [{col}]
            </span>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className='space-y-1 text-xs font-mono'>
        <div className='flex justify-between'>
          <span className='text-gray-500'>TASKS</span>
          <span>{tasks.length}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>DONE</span>
          <span>{completedTasks}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>PROGRESS</span>
          <span>
            {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
          </span>
        </div>
      </div>

      <Handle type='source' position={Position.Right} className='!border-white !bg-black' />
    </div>
  );
});

export { TasklistNode };
export default TasklistNode;