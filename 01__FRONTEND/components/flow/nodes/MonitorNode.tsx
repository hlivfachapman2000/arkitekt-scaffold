'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface MonitorNodeProps {
  data: any;
  selected?: boolean;
}

const MonitorNode = memo(({ data, selected }: MonitorNodeProps) => {
  const monitorData = data as any;
  const totalBurnUsd = monitorData.totalBurnUsd || 0;
  const burnRate = monitorData.burnRateUsdPerHour || 0;
  const errors = monitorData.errors || [];
  const errorCount = monitorData.errorCountLastHour || 0;
  const packets = monitorData.trafficPackets || [];
  const healthHistory = monitorData.healthHistory || [];

  // Brutalist: health from history
  const lastHealth = healthHistory.length > 0 
    ? healthHistory[healthHistory.length - 1] 
    : null;
  const healthColor = lastHealth === 'healthy' ? 'text-white' : 'text-gray-500';

  return (
    <div
      className={`
        relative w-52 border border-white bg-black p-3
        ${selected ? 'ring-1 ring-white' : ''}
      `}
    >
      <Handle type='target' position={Position.Left} className='!border-white !bg-black' />
      
      {/* Header */}
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-xs font-mono uppercase tracking-widest'>MONITOR</span>
        <span className='text-xs font-mono text-gray-500'>[{packets.length}]</span>
      </div>

      {/* Name */}
      <div className='mb-2 border-b border-white/20 pb-2'>
        <span className='text-xs font-mono'>
          {monitorData.name || 'Monitor'}
        </span>
      </div>

      {/* Stats */}
      <div className='space-y-1 text-xs font-mono'>
        <div className='flex justify-between'>
          <span className='text-gray-500'>BURN</span>
          <span>${totalBurnUsd.toFixed(4)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>RATE</span>
          <span>${burnRate.toFixed(2)}/h</span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>ERRORS</span>
          <span className={errorCount > 0 ? 'text-gray-400' : 'text-gray-500'}>
            {errorCount}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='text-gray-500'>PKTS</span>
          <span>{packets.length}</span>
        </div>
      </div>

      {/* Last health */}
      {lastHealth && (
        <div className='mt-2 border-t border-white/20 pt-2'>
          <span className='text-xs font-mono text-gray-500'>
            {lastHealth.toUpperCase()}
          </span>
        </div>
      )}

      <Handle type='source' position={Position.Right} className='!border-white !bg-black' />
    </div>
  );
});

export { MonitorNode };
export default MonitorNode;