// types/nodes/task-node.ts

export type KanbanColumn = 'backlog' | 'ready' | 'in-progress' | 'review' | 'done' | 'archive';

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'icebox';

export type TaskAssignee = {
  type: 'agent' | 'human';
  id: string;
  name: string;
};

export interface TaskComment {
  id: string;
  author: TaskAssignee;
  content: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  column: KanbanColumn;
  priority: TaskPriority;
  assignee?: TaskAssignee;
  tags: string[];
  sniCode?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  blockedBy?: string[];
  comments: TaskComment[];
  agentOutputs: Array<{
    agentId: string;
    output: string;
    timestamp: string;
  }>;
}

export interface TasklistNodeData {
  type: 'tasklist';
  tasklistId: string;
  name: string;
  sourceFile: string;
  columns: KanbanColumn[];
  wipLimits: Record<KanbanColumn, number>;
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  avgCycleTimeMinutes?: number;
  connectedAgents: string[];
  autoArchiveAfterHours: number;
  requireHumanApprovalFor: KanbanColumn[];
}

export interface TasklistNodeConfig {
  maxWipPerAgent: 3;
  enableAutoArchive: boolean;
  enableBurnDownChart: boolean;
  syncIntervalMs: number;
}