// types/nodes/agent-node.ts

export type AgentStatus = 'running' | 'idle' | 'crashed' | 'frozen' | 'spawning';
export type AgentPersona = 'sloth-brain' | 'deep-researcher' | 'ok-computer' | 'sniper' | 'critic' | 'orchestrator' | 'builder';
export type AgentModel = 'gpt-4o' | 'claude-sonnet-4' | 'gemini-2.5-pro' | 'grok-3' | 'gemma-4-9b-q4' | 'gemma-4-27b-q4' | 'custom';

export interface AgentModule {
  id: string;
  type: 'memory' | 'vision' | 'code' | 'research' | 'embed' | 'custom';
  name: string;
  config: Record<string, unknown>;
  status: 'active' | 'error' | 'loading';
}

export interface AgentContextWindow {
  currentTokens: number;
  maxTokens: number;
  pressure: number; // 0-1, rött över 0.85
  lastMessages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
    timestamp: string;
    tokenCount: number;
  }>;
}

export interface AgentNodeData {
  type: 'agent';
  agentId: string;
  name: string;
  persona: AgentPersona;
  model: AgentModel;
  status: AgentStatus;
  modules: AgentModule[];
  contextWindow: AgentContextWindow;
  taskQueue: string[]; // IDs till kanban-kort
  currentTask: string | null;
  spawnTemplate?: string; // Om noden skapades från template
  customSystemPrompt?: string;
  temperature: number;
  createdAt: string;
  lastActivity: string;
  tokenBurnTotal: number;
  errorCount: number;
  // Agent's internal files
  identityMd?: string;
  soulMd?: string;
  skillsMd?: string;
  memoryMd?: string;
  scratchpadMd?: string;
  kanbanMd?: string;
  heartbeatMd?: string;
  cliAssignmentMd?: string;
}

export interface AgentNodeConfig {
  maxModules: 4;
  allowedPersonas: AgentPersona[];
  requireApprovalFor: 'spawn' | 'persona-change' | 'model-switch' | 'never';
}