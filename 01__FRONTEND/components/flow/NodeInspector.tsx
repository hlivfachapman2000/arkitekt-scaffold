// components/flow/NodeInspector.tsx

'use client';

import React from 'react';
import { Node } from '@xyflow/react';
import { useFlowStore } from '@/stores/flow-store';
import { TwistedNodeData } from '@/types/flow-common';

interface NodeInspectorProps {
  node: Node<TwistedNodeData>;
  onClose: () => void;
}

export function NodeInspector({ node, onClose }: NodeInspectorProps) {
  const updateNode = useFlowStore((s) => s.updateNode);
  const removeNode = useFlowStore((s) => s.removeNode);
  const data = node.data as any;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'agent': return '🤖';
      case 'service': return '🔌';
      case 'memory': return '🧠';
      case 'logic': return '🎛️';
      case 'tasklist': return '📋';
      case 'monitor': return '📡';
      default: return '📦';
    }
  };

  return (
    <div className={`flex h-full flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-neutral-700 px-4 py-3`}>
        <div className={`flex items-center gap-2`}>
          <span className={`text-lg`}>{getNodeIcon(node.type || 'unknown')}</span>
          <span className={`font-semibold text-white`}>
            {data.name || data.agentId || data.serviceId || node.id.slice(0, 8)}
          </span>
          <span className={`rounded bg-neutral-700 px-2 py-0.5 text-xs text-neutral-400`}>
            {node.type}
          </span>
        </div>
        <button onClick={onClose} className={`text-neutral-500 hover:text-white`}>✕</button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto p-4`}>
        {/* Agent specifics */}
        {node.type === 'agent' && (
          <>
            <div className={`mb-4`}>
              <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
                Identity
              </div>
              <textarea
                value={data.identityMd || ''}
                onChange={(e) => updateNode(node.id, { identityMd: e.target.value } as never)}
                className={`w-full rounded bg-neutral-800 p-2 text-xs text-neutral-300`}
                rows={4}
                placeholder={`# Agent Identity...`}
              />
            </div>

            <div className={`mb-4`}>
              <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
                Soul
              </div>
              <textarea
                value={data.soulMd || ''}
                onChange={(e) => updateNode(node.id, { soulMd: e.target.value } as never)}
                className={`w-full rounded bg-neutral-800 p-2 text-xs text-neutral-300`}
                rows={4}
                placeholder={`# Agent Soul...`}
              />
            </div>

            <div className={`mb-4`}>
              <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
                System Prompt
              </div>
              <textarea
                value={data.customSystemPrompt || ''}
                onChange={(e) => updateNode(node.id, { customSystemPrompt: e.target.value } as never)}
                className={`w-full rounded bg-neutral-800 p-2 text-xs text-neutral-300`}
                rows={6}
                placeholder={`Custom system prompt...`}
              />
            </div>

            <div className={`mb-4`}>
              <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
                Configuration
              </div>
              <div className={`space-y-2`}>
                <div className={`flex items-center justify-between`}>
                  <span className={`text-xs text-neutral-400`}>Persona</span>
                  <select
                    value={data.persona}
                    onChange={(e) => updateNode(node.id, { persona: e.target.value } as never)}
                    className={`rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300`}
                  >
                    <option value={`sniper`}>Sniper</option>
                    <option value={`deep-researcher`}>Deep Researcher</option>
                    <option value={`builder`}>Builder</option>
                    <option value={`critic`}>Critic</option>
                    <option value={`orchestrator`}>Orchestrator</option>
                  </select>
                </div>
                <div className={`flex items-center justify-between`}>
                  <span className={`text-xs text-neutral-400`}>Model</span>
                  <select
                    value={data.model}
                    onChange={(e) => updateNode(node.id, { model: e.target.value } as never)}
                    className={`rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300`}
                  >
                    <option value={`gpt-4o`}>GPT-4o</option>
                    <option value={`claude-sonnet-4`}>Claude Sonnet 4</option>
                    <option value={`gemini-2.5-pro`}>Gemini 2.5 Pro</option>
                    <option value={`grok-3`}>Grok 3</option>
                  </select>
                </div>
                <div className={`flex items-center justify-between`}>
                  <span className={`text-xs text-neutral-400`}>Temperature</span>
                  <input
                    type={`number`}
                    value={data.temperature}
                    onChange={(e) => updateNode(node.id, { temperature: parseFloat(e.target.value) } as never)}
                    className={`w-20 rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-300`}
                    step={0.1}
                    min={0}
                    max={2}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Service specifics */}
        {node.type === 'service' && (
          <div className={`mb-4`}>
            <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
              Service Configuration
            </div>
            <div className={`space-y-2`}>
              <div className={`flex items-center justify-between`}>
                <span className={`text-xs text-neutral-400`}>Health</span>
                <span className={`rounded px-2 py-0.5 text-xs ${
                  data.health === 'healthy' ? 'bg-green-900 text-green-300' :
                  data.health === 'down' ? 'bg-red-900 text-red-300' :
                  'bg-yellow-900 text-yellow-300'
                }`}>
                  {data.health}
                </span>
              </div>
              <div className={`flex items-center justify-between`}>
                <span className={`text-xs text-neutral-400`}>Auto-failover</span>
                <input
                  type={`checkbox`}
                  checked={data.autoFailover}
                  onChange={(e) => updateNode(node.id, { autoFailover: e.target.checked } as never)}
                  className={`rounded`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Memory specifics */}
        {node.type === 'memory' && (
          <div className={`mb-4`}>
            <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
              Memory Stats
            </div>
            <div className={`space-y-2 text-xs text-neutral-400`}>
              <div>Documents: {data.totalDocuments?.toLocaleString()}</div>
              <div>Vectors: {data.totalVectors?.toLocaleString()}</div>
              <div>Storage: {(data.storageUsedBytes / 1024 / 1024).toFixed(2)} MB</div>
              <div>Last query: {data.lastQuery || 'None'}</div>
            </div>
          </div>
        )}

        {/* Logic specifics */}
        {node.type === 'logic' && (
          <div className={`mb-4`}>
            <div className={`mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider`}>
              Logic Node Config
            </div>
            <div className={`space-y-2 text-xs text-neutral-400`}>
              <div>Type: {data.logicType}</div>
              <div>Processing: {data.processing ? 'Yes' : 'No'}</div>
              <div>Input queue: {data.inputQueue?.length || 0}</div>
              <div>Output queue: {data.outputQueue?.length || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className={`border-t border-neutral-700 p-4`}>
        <button
          onClick={() => {
            if (confirm('Delete this node?')) {
              removeNode(node.id);
              onClose();
            }
          }}
          className={`w-full rounded bg-red-700 px-4 py-2 text-sm text-white hover:bg-red-600`}
        >
          🗑️ Delete Node
        </button>
      </div>
    </div>
  );
}