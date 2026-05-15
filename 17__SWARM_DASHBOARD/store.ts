import { Agent, Task, LogEntry } from './types';

export const INITIAL_AGENTS: Agent[] = [
  { id: 'a1', name: '_ORCHESTRATOR', role: 'orchestrator', status: 'working', currentTask: 't2', tokensUsed: 125000, description: 'Meta-agent: routes, delegates, monitors.' },
  { id: 'a2', name: '_CRITIC', role: 'critic', status: 'idle', tokensUsed: 42000, description: 'Quality gate: reviews, standards, guardrails.' },
  { id: 'a3', name: '_MEMORY_WRITER', role: 'memory_keeper', status: 'idle', tokensUsed: 15300, description: 'Commits verified long-term facts to vault.' },
  { id: 'a4', name: 'AGENT__CODER', role: 'worker', status: 'working', currentTask: 't2', tokensUsed: 230400, description: 'Executes architecture patterns and TDD cycles.' },
  { id: 'a5', name: 'AGENT__RESEARCHER', role: 'worker', status: 'offline', tokensUsed: 3100, description: 'Runs 09__RESEARCH AutoResearch loops.' }
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Setup Qdrant Memory DB structure and docker compose', status: 'done', assigneeId: 'a4' },
  { id: 't2', title: 'Implement dynamic Swarm Kanban Board view', status: 'doing', assigneeId: 'a4' },
  { id: 't3', title: 'Review PR #45 regarding token budget tracking', status: 'todo' },
  { id: 't4', title: 'Scale worker nodes to 3 for deep research task', status: 'backlog' }
];

export const INITIAL_LOGS: LogEntry[] = [
  { id: 'l1', timestamp: new Date(Date.now() - 600000), fromAgentId: 'a1', toAgentId: 'a4', message: 'Assigned task: "Implement dynamic Swarm Kanban Board view"', type: 'action' },
  { id: 'l2', timestamp: new Date(Date.now() - 300000), fromAgentId: 'a4', message: 'Started working on UI components. Updating SCRATCHPAD.md.', type: 'info' },
  { id: 'l3', timestamp: new Date(Date.now() - 150000), fromAgentId: 'a3', message: 'Synced latest architectural decisions to 06__KNOWLEDGE_VAULT', type: 'success' },
  { id: 'l4', timestamp: new Date(Date.now() - 10000), fromAgentId: 'a1', message: 'Heartbeat check OK. Swarm running nominally at 85% budget.', type: 'info' }
];
