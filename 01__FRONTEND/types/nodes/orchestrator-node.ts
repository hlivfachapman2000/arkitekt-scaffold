// types/nodes/orchestrator-node.ts

export type LogicNodeType = 'orchestrator' | 'karpatchy-loop' | 'human-gate' | 'router' | 'parallel-split' | 'parallel-merge' | 'cron-trigger' | 'webhook-trigger';

export type RouterCondition = {
  id: string;
  label: string;
  expression: string;
  targetNodeId: string;
};

export type LoopIteration = {
  iteration: number;
  agentOutput: unknown;
  criticScore: number;
  approved: boolean;
  timestamp: string;
};

export type HumanGateState = 'waiting' | 'approved' | 'rejected' | 'timeout';

export interface CronSchedule {
  type: 'cron';
  expression: string;
  timezone: string;
  nextRun: string;
}

export interface WebhookTrigger {
  type: 'webhook';
  path: string;
  method: 'POST' | 'GET';
  secretHeader?: string;
}

export interface OrchestratorNodeData {
  type: 'logic';
  logicType: LogicNodeType;
  
  // Orchestrator-specifikt
  managedAgents?: string[];
  distributionStrategy?: 'round-robin' | 'load-balanced' | 'capability-matched';
  
  // Karpatchy Loop-specifikt
  loopConfig?: {
    maxIterations: number;
    criticAgentId: string;
    builderAgentId: string;
    approvalThreshold: number;
    iterations: LoopIteration[];
    currentIteration: number;
  };
  
  // Human Gate-specifikt
  gateState?: HumanGateState;
  gateTimeoutMinutes?: number;
  gateApprovedBy?: string;
  gateInstructions?: string;
  
  // Router-specifikt
  routerConditions?: RouterCondition[];
  defaultTargetNodeId?: string;
  
  // Parallel-specifikt
  parallelBranches?: string[];
  mergeStrategy?: 'all' | 'any' | 'majority-vote';
  branchResults?: Record<string, unknown>;
  
  // Trigger-specifikt
  trigger?: CronSchedule | WebhookTrigger;
  triggerEnabled: boolean;
  triggerLastFired?: string;
  triggerFireCount: number;
  
  // Gemensamt
  inputQueue: unknown[];
  outputQueue: unknown[];
  processing: boolean;
  lastProcessedAt?: string;
}

export interface OrchestratorNodeConfig {
  maxLoopIterations: 10;
  defaultGateTimeoutMinutes: 30;
  maxParallelBranches: 5;
  enableAutoRetry: boolean;
}