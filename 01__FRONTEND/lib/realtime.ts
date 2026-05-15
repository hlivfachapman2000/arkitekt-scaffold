// lib/realtime.ts - WebSocket/SSE handler for real-time updates

import { useFlowStore } from '@/stores/flow-store';
import type { AgentStatus } from '@/types/nodes/agent-node';
import type { TrafficPacket } from '@/types/nodes/monitor-node';
import type { TokenBurnEntry } from '@/types/nodes/monitor-node';
import type { ErrorEntry } from '@/types/nodes/monitor-node';
import type { AuditEntry } from '@/types/nodes/monitor-node';

type RealtimeEventType = 
  | 'agent:status'
  | 'agent:heartbeat'
  | 'agent:output'
  | 'traffic:packet'
  | 'token:burn'
  | 'error:new'
  | 'audit:entry'
  | 'task:update'
  | 'gate:pending'
  | 'gate:resolved';

interface RealtimeEvent {
  type: RealtimeEventType;
  payload: unknown;
  timestamp: string;
  sourceNodeId?: string;
  targetNodeId?: string;
}

type EventHandler = (event: RealtimeEvent) => void;

class RealtimeHandler {
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventHandlers: Map<string, Set<EventHandler>> = new Map();

  connect(url?: string) {
    const wsUrl = url || 'ws://localhost:8080/realtime';
    // Don't try to connect in demo mode (no backend available)
    if (typeof window !== 'undefined') {
      console.log('[Realtime] Demo mode - no backend connection');
      console.log('[Realtime] To enable real-time updates, start the backend server on port 8080');
      this.connected = false;
      // Don't attempt WebSocket connection - we're in demo mode
      return;
    }
  }

  private connected = false;

  // Demo mode - simulate events for UI testing
  startDemoMode() {
    if (this.connected) return;
    this.connected = true;
    console.log('[Realtime] Starting demo mode with simulated events');
    
    const statuses: AgentStatus[] = ['running', 'idle', 'spawning', 'crashed', 'frozen'];
    const tools = ['file_read', 'bash_execute', 'code_search', 'web_search', 'git_commit', 'api_call', 'db_query'];
    
    // Simulate agent heartbeats and tool use on ACTUAL agents in the store
    setInterval(() => {
      const store = useFlowStore.getState();
      const agentNodes = store.nodes.filter((n) => n.type === 'agent');
      
      if (agentNodes.length === 0) return;
      
      // Pick a random agent
      const target = agentNodes[Math.floor(Math.random() * agentNodes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      this.simulateAgentHeartbeat(target.id, status);
      
      // When running, simulate tool use with flash effect and set a task
      if (status === 'running') {
        const tool = tools[Math.floor(Math.random() * tools.length)];
        this.simulateToolUse(target.id, tool);
        
        // Also set a current task to trigger thinking animation
        const tasks = ['Analyzing codebase...', 'Writing function...', 'Searching files...', 'Running tests...', 'Processing data...'];
        const task = tasks[Math.floor(Math.random() * tasks.length)];
        store.updateNode(target.id, { currentTask: task } as never);
      } else {
        // Clear task when not running
        store.updateNode(target.id, { currentTask: null } as never);
      }
    }, 3000);

    // Simulate traffic packets between actual agents
    setInterval(() => {
      const store = useFlowStore.getState();
      const agentNodes = store.nodes.filter((n) => n.type === 'agent');
      
      if (agentNodes.length < 2) return;
      
      const from = agentNodes[Math.floor(Math.random() * agentNodes.length)];
      const to = agentNodes[Math.floor(Math.random() * agentNodes.length)];
      if (from.id !== to.id) {
        this.simulateTrafficPacket(from.id, to.id);
      }
    }, 5000);
  }

  private setupWsHandlers() {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[Realtime] Connected via WebSocket');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;
        this.handleEvent(data);
      } catch (e) {
        console.error('[Realtime] Failed to parse message:', e);
      }
    };

    this.ws.onclose = () => {
      console.log('[Realtime] WebSocket closed');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('[Realtime] WebSocket error:', error);
    };
  }

  private connectSSE(sseUrl: string) {
    this.sse = new EventSource(`${sseUrl}/sse`);
    
    this.sse.onopen = () => {
      console.log('[Realtime] Connected via SSE');
    };

    this.sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RealtimeEvent;
        this.handleEvent(data);
      } catch (e) {
        console.error('[Realtime] Failed to parse SSE message:', e);
      }
    };

    this.sse.onerror = () => {
      console.log('[Realtime] SSE error, attempting reconnect...');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[Realtime] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`[Realtime] Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private handleEvent(event: RealtimeEvent) {
    // Call specific handlers
    const handlers = this.eventHandlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }

    // Call wildcard handlers (pattern matching)
    this.eventHandlers.forEach((handlerSet, pattern) => {
      if (pattern.includes('*') && this.matchWildcard(event.type, pattern)) {
        handlerSet.forEach((handler) => handler(event));
      }
    });

    // Update Zustand store based on event type
    const store = useFlowStore.getState();

    switch (event.type) {
      case 'agent:status': {
        const payload = event.payload as { status: AgentStatus; agentId?: string };
        if (event.sourceNodeId) {
          store.updateNode(event.sourceNodeId, { status: payload.status } as never);
        }
        break;
      }
      case 'traffic:packet':
        store.addTrafficPacket(event.payload as TrafficPacket);
        break;
      case 'token:burn':
        store.addTokenBurn(event.payload as TokenBurnEntry);
        break;
      case 'error:new':
        store.addError(event.payload as ErrorEntry);
        break;
      case 'audit:entry':
        store.addAuditEntry(event.payload as AuditEntry);
        break;
      case 'gate:pending':
        useFlowStore.setState({ humanGatesPending: store.humanGatesPending + 1 });
        break;
      case 'gate:resolved':
        useFlowStore.setState({ humanGatesPending: Math.max(0, store.humanGatesPending - 1) });
        break;
      case 'task:update': {
        const payload = event.payload as { taskId: string; updates: Partial<unknown> };
        if (payload.taskId && payload.updates) {
          store.updateTask(payload.taskId, payload.updates as never);
        }
        break;
      }
    }
  }

  private matchWildcard(type: string, pattern: string): boolean {
    const regex = new RegExp(pattern.replace('*', '.*'));
    return regex.test(type);
  }

  on(eventType: string, handler: EventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
    return () => this.eventHandlers.get(eventType)?.delete(handler);
  }

  off(eventType: string, handler: EventHandler) {
    this.eventHandlers.get(eventType)?.delete(handler);
  }

  send(type: RealtimeEventType, payload: unknown, targetNodeId?: string) {
    const event: RealtimeEvent = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      targetNodeId,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(event));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.sse) {
      this.sse.close();
      this.sse = null;
    }
    this.eventHandlers.clear();
  }

  // Simulate events for demo/testing
  simulateAgentHeartbeat(agentId: string, status: AgentStatus) {
    this.handleEvent({
      type: 'agent:status',
      payload: { status, agentId },
      timestamp: new Date().toISOString(),
      sourceNodeId: agentId,
    });
  }

  simulateToolUse(agentId: string, toolName: string) {
    // Update the agent node with lastToolUsed and toolUsedAt for the flash effect
    const store = useFlowStore.getState();
    const agentNode = store.nodes.find((n) => n.id === agentId || (n.data as any).agentId === agentId);
    if (agentNode) {
      store.updateNode(agentNode.id, {
        lastToolUsed: toolName,
        toolUsedAt: Date.now(),
      } as never);
    }
  }

  simulateTrafficPacket(from: string, to: string, size = 1024) {
    const packet: TrafficPacket = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      fromNodeId: from,
      toNodeId: to,
      direction: 'out',
      payloadSizeBytes: size,
      payloadType: 'json',
      latencyMs: Math.random() * 200 + 10,
      status: 'success',
      tokenCount: Math.floor(size / 4),
    };
    this.handleEvent({
      type: 'traffic:packet',
      payload: packet,
      timestamp: new Date().toISOString(),
      sourceNodeId: from,
      targetNodeId: to,
    });
  }
}

export const realtime = new RealtimeHandler();