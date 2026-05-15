// types/flow-config.ts

export const NODE_TYPE_COMPONENTS = {
  agent: 'AgentNode',
  service: 'ServiceNode',
  memory: 'MemoryNode',
  logic: 'LogicNode',
  tasklist: 'TasklistNode',
  monitor: 'MonitorNode',
} as const;

export const EDGE_STYLES = {
  sync: { stroke: '#22c55e', animated: false },
  async: { stroke: '#3b82f6', animated: true },
  stream: { stroke: '#a855f7', animated: true },
  feedback: { stroke: '#f59e0b', animated: false },
} as const;

export const STATUS_COLORS = {
  healthy: '#22c55e',
  running: '#22c55e',
  idle: '#6b7280',
  crashed: '#ef4444',
  frozen: '#06b6d4',
  spawning: '#3b82f6',
  degraded: '#f59e0b',
  down: '#ef4444',
  'rate-limited': '#f97316',
  unknown: '#9ca3af',
} as const;

export const EDGE_TYPE_LABELS = {
  command: 'command',
  context: 'context',
  result: 'result',
  memory: 'memory',
  approval: 'approval',
  error: 'error',
} as const;