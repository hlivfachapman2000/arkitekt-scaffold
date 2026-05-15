// components/logs/LogsPanel.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useFlowStore } from '@/stores/flow-store';

interface LogsPanelProps {
  onClose: () => void;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  nodeId?: string;
}

// Mock logs for demo
const generateMockLogs = (): LogEntry[] => [
  { id: '1', timestamp: new Date().toISOString(), level: 'info', source: 'Orchestrator', message: 'Starting flow execution' },
  { id: '2', timestamp: new Date(Date.now() - 5000).toISOString(), level: 'info', source: 'Sniper-Agent', message: 'Processing task: Review PR #234' },
  { id: '3', timestamp: new Date(Date.now() - 10000).toISOString(), level: 'warn', source: 'Memory-Node', message: 'Cache miss rate increasing: 23%' },
  { id: '4', timestamp: new Date(Date.now() - 15000).toISOString(), level: 'error', source: 'Research-Agent', message: 'API timeout after 30s' },
  { id: '5', timestamp: new Date(Date.now() - 20000).toISOString(), level: 'info', source: 'Critic-Agent', message: 'Review complete: 3 issues found' },
];

export function LogsPanel({ onClose }: LogsPanelProps) {
  const nodes = useFlowStore((s) => s.nodes);
  const [logs, setLogs] = useState<LogEntry[]>(generateMockLogs());
  const [filter, setFilter] = useState<'all' | 'info' | 'warn' | 'error'>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-refresh logs
  useEffect(() => {
    const interval = setInterval(() => {
      // In real app, this would come from WebSocket/SSE
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false;
    return true;
  });

  const agents = nodes.filter((n) => n.type === 'agent');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400 bg-red-900/30';
      case 'warn': return 'text-yellow-400 bg-yellow-900/30';
      case 'info': return 'text-blue-400 bg-blue-900/30';
      case 'debug': return 'text-neutral-400 bg-neutral-900/30';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className={`flex h-full flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-neutral-700 px-4 py-3`}>
        <div className={`flex items-center gap-2`}>
          <span className={`text-lg`}>📜</span>
          <span className={`font-semibold text-white`}>Live Logs</span>
          <span className={`h-2 w-2 animate-pulse rounded-full bg-green-500`} />
        </div>
        <button onClick={onClose} className={`text-neutral-500 hover:text-white`}>✕</button>
      </div>

      {/* Filters */}
      <div className={`flex items-center gap-2 border-b border-neutral-700 p-2`}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className={`rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-400`}
        >
          <option value={`all`}>All Levels</option>
          <option value={`info`}>Info</option>
          <option value={`warn`}>Warnings</option>
          <option value={`error`}>Errors</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className={`flex-1 rounded bg-neutral-800 px-2 py-1 text-xs text-neutral-400`}
        >
          <option value={`all`}>All Sources</option>
          {agents.map((agent) => (
            <option key={agent.id} value={(agent.data as any).name || agent.id}>
              {(agent.data as any).name || agent.id.slice(0, 8)}
            </option>
          ))}
        </select>
        <label className={`flex items-center gap-1 text-xs text-neutral-500`}>
          <input
            type={`checkbox`}
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          Auto-scroll
        </label>
      </div>

      {/* Log entries */}
      <div className={`flex-1 overflow-auto font-mono text-xs`}>
        {filteredLogs.length === 0 ? (
          <div className={`p-4 text-center text-neutral-600`}>No logs matching filter</div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`mb-1 border-b border-neutral-800 px-3 py-2 ${getLevelColor(log.level)}`}
            >
              <div className={`flex items-center gap-2`}>
                <span className={`text-neutral-600`}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`rounded px-1.5 py-0.5 uppercase`}>{log.level}</span>
                <span className={`text-neutral-400`}>{log.source}</span>
              </div>
              <div className={`mt-1 text-neutral-300`}>{log.message}</div>
              {log.nodeId && (
                <div className={`mt-1 text-neutral-600`}>Node: {log.nodeId.slice(0, 8)}</div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className={`flex items-center justify-between border-t border-neutral-700 px-3 py-2`}>
        <span className={`text-xs text-neutral-500`}>
          {filteredLogs.length} entries
        </span>
        <button
          onClick={() => setLogs([])}
          className={`text-xs text-red-400 hover:text-red-300`}
        >
          Clear logs
        </button>
      </div>
    </div>
  );
}