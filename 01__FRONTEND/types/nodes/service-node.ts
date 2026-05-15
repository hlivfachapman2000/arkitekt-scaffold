// types/nodes/service-node.ts

export type ServiceType = 
  | 'bolagsverket' 
  | 'nordea' 
  | 'github' 
  | 'slack' 
  | 'discord' 
  | 'lm-studio' 
  | 'grok-api' 
  | 'kimi-api' 
  | 'openai-api' 
  | 'postgres' 
  | 'sqlite' 
  | 'redis' 
  | 'custom-api';

export type ServiceHealth = 'healthy' | 'degraded' | 'down' | 'unknown' | 'rate-limited';

export interface RateLimitState {
  remaining: number;
  limit: number;
  resetAt: string;
  window: 'minute' | 'hour' | 'day';
}

export interface ServiceCredential {
  vaultKey: string; // Referens till .secrets, aldrig värdet
  lastRotated: string;
  expiresAt?: string;
}

export interface ServiceEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  health: ServiceHealth;
  latencyMs: number;
  lastUsed: string;
  failoverTo?: string;
}

export interface ServiceNodeData {
  type: 'service';
  serviceId: string;
  name: string;
  serviceType: ServiceType;
  health: ServiceHealth;
  endpoints: ServiceEndpoint[];
  credentials: ServiceCredential[];
  rateLimit?: RateLimitState;
  autoFailover: boolean;
  fallbackServiceId?: string;
  requestCount: number;
  errorCount: number;
  avgLatencyMs: number;
  connectedAgents: string[];
  customHeaders?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    timeoutMs: number;
  };
}

export interface ServiceNodeConfig {
  healthCheckIntervalMs: number;
  rateLimitWarningThreshold: number;
  requireCredentialRotationDays: number;
}