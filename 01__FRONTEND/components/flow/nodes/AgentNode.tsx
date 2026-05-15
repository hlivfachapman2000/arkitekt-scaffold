// components/flow/nodes/AgentNode.tsx

'use client';

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useFlowStore } from '@/stores/flow-store';
import type { AgentNodeData, AgentStatus, AgentPersona } from '@/types/nodes/agent-node';

const STATUS_STYLES: Record<AgentStatus, string> = {
  running: 'bg-white',
  idle: 'bg-gray-600',
  crashed: 'bg-red-500',
  frozen: 'bg-cyan-500',
  spawning: 'bg-blue-500',
};

function AgentNodeComponent({ data, selected }: NodeProps) {
  const agentData = data as unknown as AgentNodeData;
  const [showInspector, setShowInspector] = useState(false);
  const updateNode = useFlowStore((s) => s.updateNode);

  const isThinking = agentData.status === 'running' && agentData.currentTask;
  const isCrashed = agentData.status === 'crashed';
  const lastToolUsed = (agentData as any).lastToolUsed || null;

  const reactionClass = isCrashed
    ? 'animate-shake'
    : isThinking
    ? 'animate-pulse-border'
    : '';

  return (
    <div
      className={`relative w-56 border border-white bg-black ${selected ? 'border-2' : ''} ${reactionClass}`}
      onDoubleClick={() => setShowInspector(!showInspector)}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-white px-3 py-2`}>
        <div className={`flex items-center gap-2`}>
          <div className={`h-2 w-2 ${STATUS_STYLES[agentData.status] || 'bg-gray'}`} />
          <span className={`text-xs font-medium text-white`}>{agentData.name}</span>
        </div>
        <select
          value={agentData.status}
          onChange={(e) => updateNode(agentData.agentId, { status: e.target.value as AgentStatus } as never)}
          className={`bg-black border border-white px-1 py-0.5 text-xs text-white`}
        >
          <option value={agentData.status}>{agentData.status}</option>
        </select>
      </div>

      {/* Persona */}
      <div className={`flex items-center border-b border-white px-3 py-1`}>
        <span className={`text-xs text-gray-500 mr-2`}>P:</span>
        <select
          value={agentData.persona}
          onChange={(e) => updateNode(agentData.agentId, { persona: e.target.value as AgentPersona } as never)}
          className={`bg-black border border-white px-1 py-0.5 text-xs text-white flex-1`}
        >
          {(['sloth-brain', 'deep-researcher', 'ok-computer', 'sniper', 'critic', 'orchestrator', 'builder'] as AgentPersona[]).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Context bar */}
      <div className={`border-b border-white px-3 py-1`}>
        <div className={`flex items-center justify-between text-xs`}>
          <span className={`text-gray-500`}>CTX</span>
          <span className={`text-white`}>
            {Math.round((agentData.contextWindow.currentTokens / agentData.contextWindow.maxTokens) * 100)}%
          </span>
        </div>
        <div className={`h-1 w-full bg-gray-900`}>
          <div
            className={`h-full bg-white`}
            style={{ width: `${(agentData.contextWindow.currentTokens / agentData.contextWindow.maxTokens) * 100}%` }}
          />
        </div>
      </div>

      {/* Module count */}
      <div className={`border-b border-white px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>MODULES: {agentData.modules.length}/4</span>
      </div>

      {/* Current task */}
      {agentData.currentTask && (
        <div className={`border-b border-white px-3 py-1`}>
          <span className={`text-xs text-gray-500`}>TASK</span>
          <div className={`mt-0.5 truncate text-xs text-white`}>{agentData.currentTask}</div>
        </div>
      )}

      {/* Tool use */}
      {lastToolUsed && (
        <div className={`border-t border-white px-3 py-1 bg-gray-900`}>
          <span className={`text-xs text-white`}>{lastToolUsed}</span>
        </div>
      )}

      {/* Stats */}
      <div className={`flex items-center justify-between px-3 py-1`}>
        <span className={`text-xs text-gray-500`}>${agentData.tokenBurnTotal.toFixed(0)}</span>
        <span className={`text-xs text-gray-500`}>{agentData.model}</span>
      </div>

      {/* Handles */}
      <Handle type={`target`} position={Position.Top} className={`!bg-white !border-white`} />
      <Handle type={`source`} position={Position.Bottom} className={`!bg-white !border-white`} />
      <Handle type={`target`} position={Position.Left} id={`memory`} className={`!bg-gray-500 !border-white`} />
      <Handle type={`source`} position={Position.Right} id={`output`} className={`!bg-gray-500 !border-white`} />

      {/* Inspector */}
      {showInspector && (
        <div className={`absolute -right-64 top-0 z-50 w-60 border border-white bg-black p-2`}>
          <div className={`mb-2 flex items-center justify-between border-b border-white pb-2`}>
            <span className={`text-xs text-white`}>INSPECTOR</span>
            <button onClick={() => setShowInspector(false)} className={`text-xs text-gray-500`}>X</button>
          </div>
          <div className={`space-y-2 text-xs`}>
            <div className={`text-gray-500`}>IDENTITY</div>
            <pre className={`overflow-auto bg-black border border-white p-1 text-gray-400 max-h-16`}>
              {agentData.identityMd || '# empty'}
            </pre>
            <div className={`text-gray-500`}>SOUL</div>
            <pre className={`overflow-auto bg-black border border-white p-1 text-gray-400 max-h-16`}>
              {agentData.soulMd || '# empty'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export const AgentNode = memo(AgentNodeComponent);