// components/flow/AgentsSidebar.tsx

'use client';

import React from 'react';
import { useFlowStore } from '@/stores/flow-store';

export function AgentsSidebar() {
  const nodes = useFlowStore((s) => s.nodes);
  const selectNode = useFlowStore((s) => s.selectNode);
  const agents = nodes.filter((n) => n.type === 'agent');

  return (
    <div className={`flex h-full flex-col p-1`}>
      <div className={`mb-2 text-center text-xs text-gray-500 tracking-widest border-b border-white pb-1`}>
        AGENTS
      </div>
      
      <div className={`flex-1 space-y-1 overflow-auto`}>
        {agents.map((agent) => {
          const data = agent.data as any;
          return (
            <button
              key={agent.id}
              onClick={() => selectNode(agent.id)}
              className={`group flex w-full flex-col items-center border border-white p-1 text-xs transition-colors hover:bg-white hover:text-black`}
              title={data.name || agent.id}
            >
              <div className={`h-2 w-2 ${data.status === 'running' ? 'bg-white' : 'bg-gray-600'}`} />
              <div className={`mt-0.5 truncate text-gray-400 group-hover:text-black`}>
                {data.name?.slice(0, 8) || agent.id.slice(0, 8)}
              </div>
            </button>
          );
        })}

        {agents.length === 0 && (
          <div className={`text-center text-xs text-gray-600 p-2`}>
            empty
          </div>
        )}
      </div>

      <div className={`mt-auto border-t border-white pt-1 text-center text-xs text-gray-600`}>
        [{agents.length}]
      </div>
    </div>
  );
}