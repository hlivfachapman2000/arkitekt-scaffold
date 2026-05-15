// components/flow/nodes/index.ts

import { AgentNode } from './AgentNode';
import { ServiceNode } from './ServiceNode';
import { MemoryNode } from './MemoryNode';
import { LogicNode } from './LogicNode';
import { TasklistNode } from './TasklistNode';
import { MonitorNode } from './MonitorNode';
import type { NodeTypes } from '@xyflow/react';

export const nodeTypes: NodeTypes = {
  agent: AgentNode as any,
  service: ServiceNode as any,
  memory: MemoryNode as any,
  logic: LogicNode as any,
  tasklist: TasklistNode as any,
  monitor: MonitorNode as any,
};