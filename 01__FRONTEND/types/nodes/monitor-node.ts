// types/nodes/monitor-node.ts

export type MonitorType = 'traffic-monitor' | 'token-burn' | 'error-stream' | 'audit-log' | 'system-health';

export type TrafficDirection = 'in' | 'out' | 'internal';

export interface TrafficPacket {
  id: string;
  timestamp: string;
  fromNodeId: string;
  toNodeId: string;
  direction: TrafficDirection;
  payloadSizeBytes: number;
  payloadType: 'text' | 'json' | 'file' | 'stream';
  latencyMs: number;
  status: 'success' | 'error' | 'timeout' | 'pending';
  tokenCount?: number;
  modelUsed?: string;
}

export interface TokenBurnEntry {
  timestamp: string;
  agentId: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  cached: boolean;
}

export interface ErrorEntry {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeType: string;
  errorType: 'crash' | 'timeout' | 'rate-limit' | 'validation' | 'unknown';
  message: string;
  stackTrace?: string;
  recovered: boolean;
  recoveryAttempts: number;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: {
    type: 'agent' | 'human' | 'system';
    id: string;
    name: string;
  };
  action: 'created' | 'modified' | 'deleted' | 'executed' | 'approved' | 'rejected';
  targetType: 'node' | 'edge' | 'task' | 'file' | 'config';
  targetId: string;
  changes: Record<string, { from: unknown; to: unknown }>;
  signature: string;
}

export interface SystemHealthMetrics {
  cpuPercent: number;
  memoryPercent: number;
  gpuPercent?: number;
  diskUsagePercent: number;
  activeProcesses: number;
  networkLatencyMs: number;
}

export interface MonitorNodeData {
  type: 'monitor';
  monitorType: MonitorType;
  name: string;
  
  // Traffic Monitor
  trafficFilter?: {
    fromNodeIds?: string[];
    toNodeIds?: string[];
    payloadTypes?: string[];
    minLatencyMs?: number;
  };
  trafficPackets: TrafficPacket[];
  trafficPacketLimit: number;
  
  // Token Burn
  tokenBurnWindow: 'minute' | 'hour' | 'day' | 'month';
  tokenBurnEntries: TokenBurnEntry[];
  totalBurnUsd: number;
  burnRateUsdPerHour: number;
  burnBudgetUsd?: number;
  budgetAlertThreshold: number;
  
  // Error Stream
  errorFilter?: {
    nodeIds?: string[];
    errorTypes?: string[];
    unrecoveredOnly?: boolean;
  };
  errors: ErrorEntry[];
  errorCountLastHour: number;
  autoPauseOnError: boolean;
  
  // Audit Log
  auditEntries: AuditEntry[];
  auditFilter?: {
    actorTypes?: string[];
    actions?: string[];
    since?: string;
  };
  auditExportFormat: 'json' | 'csv' | 'markdown';
  
  // System Health
  healthMetrics?: SystemHealthMetrics;
  healthHistory: Array<SystemHealthMetrics & { timestamp: string }>;
  alertThresholds: {
    cpuPercent: number;
    memoryPercent: number;
    diskPercent: number;
  };
}

export interface MonitorNodeConfig {
  maxTrafficPackets: 1000;
  maxAuditEntries: 10000;
  maxErrorHistory: 500;
  healthCheckIntervalMs: 5000;
  enableRealTimeAlerts: boolean;
}