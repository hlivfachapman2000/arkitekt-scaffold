// components/flow/nodes/LogicNode.tsx

'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { OrchestratorNodeData, LogicNodeType } from '@/types/nodes/orchestrator-node';
import { useFlowStore } from '@/stores/flow-store';

const LOGIC_TYPES: Record<LogicNodeType, string> = {
  orchestrator: 'orchestrator',
  'karpatchy-loop': 'loop',
  'human-gate': 'gate',
  router: 'router',
  'parallel-split': 'split',
  'parallel-merge': 'merge',
  'cron-trigger': 'cron',
  'webhook-trigger': 'webhook',
};

interface LogicNodeProps { data: any; selected?: boolean; id?: string; }
function LogicNodeComponent({ data, selected, id }: LogicNodeProps) {
  const logicData = data as unknown as OrchestratorNodeData;
  const approveHumanGate = useFlowStore((s) => s.approveHumanGate);
  const rejectHumanGate = useFlowStore((s) => s.rejectHumanGate);
  const isWaitingGate = logicData.logicType === 'human-gate' && logicData.gateState === 'waiting';

  return (
    <div
      className={`w-56 border border-white bg-black ${selected ? 'border-2' : ''} ${isWaitingGate ? 'animate-pulse-border' : ''}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-white px-3 py-2`}>
        <span className={`text-xs font-medium text-white`}>
          {LOGIC_TYPES[logicData.logicType] || logicData.logicType}
        </span>
        {logicData.processing && (
          <div className={`h-2 w-2 border border-white bg-white animate-pulse`} />
        )}
      </div>

      {/* Orchestrator */}
      {logicData.logicType === 'orchestrator' && logicData.managedAgents && (
        <div className={`border-b border-white px-3 py-1`}>
          <span className={`text-xs text-gray-500`}>AGENTS: {logicData.managedAgents.length}</span>
        </div>
      )}

      {/* Loop */}
      {logicData.logicType === 'karpatchy-loop' && logicData.loopConfig && (
        <div className={`border-b border-white px-3 py-1`}>
          <div className={`flex items-center justify-between text-xs`}>
            <span className={`text-gray-500`}>ITER</span>
            <span className={`text-white`}>
              {logicData.loopConfig.currentIteration}/{logicData.loopConfig.maxIterations}
            </span>
          </div>
          <div className={`h-1 w-full bg-gray-900`}>
            <div
              className={`h-full bg-white`}
              style={{ width: `${(logicData.loopConfig.currentIteration / logicData.loopConfig.maxIterations) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Human Gate */}
      {logicData.logicType === 'human-gate' && (
        <div className={`border-b border-white px-3 py-1`}>
          <div className={`mb-1 text-xs text-gray-500`}>
            {logicData.gateInstructions || 'AWAITING APPROVAL'}
          </div>
          <div className={`mb-1 flex items-center justify-between text-xs`}>
            <span className={`text-gray-500`}>STATE</span>
            <span className={`border border-white px-1 text-white`}>
              {logicData.gateState || 'waiting'}
            </span>
          </div>
          {logicData.gateState === 'waiting' && (
            <div className={`flex gap-1`}>
              <button
                onClick={() => approveHumanGate(id!)}
                className={`btn-brutal flex-1 text-xs`}
              >
                OK
              </button>
              <button
                onClick={() => rejectHumanGate(id!, 'Rejected')}
                className={`btn-brutal flex-1 text-xs`}
              >
                NO
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cron */}
      {logicData.trigger?.type === 'cron' && (
        <div className={`border-b border-white px-3 py-1`}>
          <div className={`text-xs text-white font-mono`}>{logicData.trigger.expression}</div>
        </div>
      )}

      {/* Queue stats */}
      <div className={`flex items-center justify-between px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>
          IN:{logicData.inputQueue.length} OUT:{logicData.outputQueue.length}
        </span>
        {logicData.triggerEnabled !== undefined && (
          <span className={`text-xs ${logicData.triggerEnabled ? 'text-white' : 'text-gray-600'}`}>
            {logicData.triggerEnabled ? 'ON' : 'OFF'}
          </span>
        )}
      </div>

      {/* Handles */}
      <Handle type={`target`} position={Position.Top} className={`!bg-white`} />
      <Handle type={`source`} position={Position.Bottom} className={`!bg-white`} />
      <Handle type={`target`} position={Position.Left} id={`input`} className={`!bg-gray-500`} />
      <Handle type={`source`} position={Position.Right} id={`output`} className={`!bg-gray-500`} />
    </div>
  );
}

export const LogicNode = memo(LogicNodeComponent);