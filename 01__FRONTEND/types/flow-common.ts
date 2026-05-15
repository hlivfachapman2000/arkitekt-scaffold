// types/flow-common.ts

import { Node, Edge } from '@xyflow/react';
import type { AgentNodeData } from './nodes/agent-node';
import type { ServiceNodeData } from './nodes/service-node';
import type { MemoryNodeData } from './nodes/memory-node';
import type { OrchestratorNodeData } from './nodes/orchestrator-node';
import type { TasklistNodeData } from './nodes/task-node';
import type { MonitorNodeData } from './nodes/monitor-node';

// Discriminated union - each type has a unique 'type' field
export type TwistedNodeType = 'agent' | 'service' | 'memory' | 'logic' | 'tasklist' | 'monitor';

// Union type - TypeScript will narrow correctly based on 'type' discriminator
export type TwistedNodeData =
  | ({ type: 'agent' } & Omit<AgentNodeData, 'type'>)
  | ({ type: 'service' } & Omit<ServiceNodeData, 'type'>)
  | ({ type: 'memory' } & Omit<MemoryNodeData, 'type'>)
  | ({ type: 'logic' } & Omit<OrchestratorNodeData, 'type'>)
  | ({ type: 'tasklist' } & Omit<TasklistNodeData, 'type'>)
  | ({ type: 'monitor' } & Omit<MonitorNodeData, 'type'>);

// Wrapper that adds the type discriminator
export type TwistedNode = Node<TwistedNodeData>;

export interface TwistedEdgeData extends Record<string, unknown> {
  edgeType: 'sync' | 'async' | 'stream' | 'feedback';
  label?: string;
  active: boolean;
  packetCount: number;
  lastPacketAt?: string;
  latencyMs: number;
  tokenCount: number;
  color: string;
  animated: boolean;
  thickness: number; // 1-5, based on payload size
}

export type TwistedEdge = Edge<TwistedEdgeData>;

// Global Flow State
export interface FlowState {
  nodes: TwistedNode[];
  edges: TwistedEdge[];
  selectedNodeId: string | null;
  running: boolean;
  autopilotMode: boolean;
  humanGatesPending: number;
  totalTokenBurnUsd: number;
  activeAgentCount: number;
  crashedAgentCount: number;
  lastSaved: string;
  version: string;
}