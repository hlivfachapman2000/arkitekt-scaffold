export type AgentRole = 'orchestrator' | 'critic' | 'memory_keeper' | 'worker';
export type AgentStatus = 'idle' | 'working' | 'reviewing' | 'offline';

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  currentTask?: string;
  tokensUsed: number;
  description: string;
}

export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'review' | 'done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  assigneeId?: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  fromAgentId: string;
  toAgentId?: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'action';
}
