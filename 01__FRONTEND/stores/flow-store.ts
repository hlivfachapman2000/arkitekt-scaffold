// stores/flow-store.ts - Fixed version

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { applyNodeChanges, applyEdgeChanges, Connection } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import type { TwistedNode, TwistedEdge, TwistedNodeData, FlowState } from '@/types/flow-common';
import type { Task, KanbanColumn } from '@/types/nodes/task-node';

interface FlowStore extends FlowState {
  // Node operations
  addNode: (node: TwistedNode) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, data: Partial<TwistedNodeData>) => void;
  selectNode: (nodeId: string | null) => void;
  
  // Edge operations  
  addConnection: (connection: Connection) => void;
  removeEdge: (edgeId: string) => void;
  updateEdgeData: (edgeId: string, data: Partial<TwistedEdge>) => void;
  
  // React Flow internal state
  onNodesChange: (changes: any[]) => void;
  onEdgesChange: (changes: any[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Execution control
  startFlow: () => void;
  pauseFlow: () => void;
  stopFlow: () => void;
  resumeFlow: () => void;
  setAutopilotMode: (enabled: boolean) => void;
  
  // Human gates
  approveHumanGate: (nodeId: string) => void;
  rejectHumanGate: (nodeId: string, reason: string) => void;
  
  // Tasklist/Kanban
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  moveTask: (taskId: string, toColumn: KanbanColumn) => void;
  assignTask: (taskId: string, agentId: string) => void;
  
  // Traffic monitoring
  addTrafficPacket: (packet: any) => void;
  
  // Token burn tracking
  addTokenBurn: (entry: any) => void;
  
  // Error tracking
  addError: (error: any) => void;
  
  // Audit log
  addAuditEntry: (entry: any) => void;
  
  // View modes
  currentView: 'system' | 'execution' | 'task' | 'memory' | 'infra';
  setView: (view: 'system' | 'execution' | 'task' | 'memory' | 'infra') => void;
  
  // Layout operations
  lockLayout: boolean;
  toggleLayoutLock: () => void;
  autoLayout: () => void;
  
  // Save/Load
  saveFlow: () => Promise<void>;
  loadFlow: () => Promise<void>;
  exportFlow: () => string;
  importFlow: (json: string) => void;
}

// Helper to add edge properly
const addEdgeConnection = (connection: Connection, edges: TwistedEdge[]): TwistedEdge[] => {
  const newEdge: TwistedEdge = {      id: `e-${connection.source}-${connection.target}-${Date.now()}` as string,
    source: connection.source,
    target: connection.target,
    sourceHandle: connection.sourceHandle,
    targetHandle: connection.targetHandle,
    type: 'smoothstep',
    data: {
      edgeType: 'sync',
      active: false,
      packetCount: 0,
      latencyMs: 0,
      tokenCount: 0,
      color: '#22c55e',
      animated: false,
      thickness: 1,
    },
  };
  return [...edges, newEdge];
};

export const useFlowStore = create<FlowStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    selectedNodeId: null,
    running: false,
    autopilotMode: false,
    humanGatesPending: 0,
    totalTokenBurnUsd: 0,
    activeAgentCount: 0,
    crashedAgentCount: 0,
    lastSaved: new Date().toISOString(),
    version: '1.0.0',
    
    tasks: [],
    currentView: 'system',
    lockLayout: false,
    
    // Node operations
    addNode: (node) => set((state) => ({
      nodes: [...state.nodes, node],
    })),
    
    removeNode: (nodeId) => set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    })),
    
    updateNode: (nodeId, data) => set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } as TwistedNodeData } : n
      ),
    })),
    
    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
    
    // Edge operations - renamed to avoid conflict with import
    addConnection: (connection) => set((state) => ({
      edges: addEdgeConnection(connection, state.edges),
    })),
    
    removeEdge: (edgeId) => set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    })),
    
    updateEdgeData: (edgeId, edgeData) => set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, ...edgeData } as typeof e.data } : e
      ),
    })),
    
    // React Flow handlers - proper typing
    onNodesChange: (changes) => set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes as Node<TwistedNodeData>[]) as TwistedNode[],
    })),
    
    onEdgesChange: (changes) => set((state) => ({
      edges: applyEdgeChanges(changes, state.edges as Edge<TwistedEdge>[]) as TwistedEdge[],
    })),
    
    onConnect: (connection) => set((state) => ({
      edges: addEdgeConnection(connection, state.edges),
    })),
    
    // Execution control
    startFlow: () => set({ running: true }),
    pauseFlow: () => set({ running: false }),
    stopFlow: () => set({ running: false, autopilotMode: false }),
    resumeFlow: () => set({ running: true }),
    setAutopilotMode: (enabled) => set({ autopilotMode: enabled }),
    
    // Human gates
    approveHumanGate: (nodeId) => set((state) => ({
      humanGatesPending: Math.max(0, state.humanGatesPending - 1),
      nodes: state.nodes.map((n) =>
        n.id === nodeId && (n.data as any).logicType === 'human-gate'
          ? { ...n, data: { ...n.data, gateState: 'approved' } }
          : n
      ),
    })),
    
    rejectHumanGate: (nodeId, reason) => set((state) => ({
      humanGatesPending: Math.max(0, state.humanGatesPending - 1),
      nodes: state.nodes.map((n) =>
        n.id === nodeId && (n.data as any).logicType === 'human-gate'
          ? { ...n, data: { ...n.data, gateState: 'rejected', gateInstructions: reason } }
          : n
      ),
    })),
    
    // Tasklist/Kanban
    addTask: (task) => set((state) => ({
      tasks: [...state.tasks, task],
    })),
    
    updateTask: (taskId, updates) => set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),
    
    moveTask: (taskId, toColumn) => set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              column: toColumn,
              updatedAt: new Date().toISOString(),
              ...(toColumn === 'in-progress' && !t.startedAt ? { startedAt: new Date().toISOString() } : {}),
              ...(toColumn === 'done' && !t.completedAt ? { completedAt: new Date().toISOString() } : {}),
            }
          : t
      ),
    })),
    
    assignTask: (taskId, agentId) => set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, assignee: { type: 'agent' as const, id: agentId, name: agentId }, updatedAt: new Date().toISOString() }
          : t
      ),
    })),
    
    // Traffic monitoring
    addTrafficPacket: (packet) => set((state) => {
      const monitorNode = state.nodes.find((n) => n.type === 'monitor');
      if (!monitorNode) return state;
      return {
        nodes: state.nodes.map((n) =>
          n.id === monitorNode.id
            ? { ...n, data: { ...n.data, trafficPackets: [packet, ...((n.data as any).trafficPackets || [])].slice(0, 1000) } }
            : n
        ),
      };
    }),
    
    // Token burn tracking
    addTokenBurn: (entry) => set((state) => ({
      totalTokenBurnUsd: state.totalTokenBurnUsd + (entry.costUsd || 0),
      nodes: state.nodes.map((n) =>
        n.type === 'monitor'
          ? { ...n, data: { ...n.data, tokenBurnEntries: [entry, ...((n.data as any).tokenBurnEntries || [])].slice(0, 10000) } }
          : n
      ),
    })),
    
    // Error tracking
    addError: (error) => set((state) => ({
      crashedAgentCount: error.errorType === 'crash' ? state.crashedAgentCount + 1 : state.crashedAgentCount,
      nodes: state.nodes.map((n) =>
        n.type === 'monitor'
          ? {
              ...n,
              data: {
                ...n.data,
                errors: [error, ...((n.data as any).errors || [])].slice(0, 500),
                errorCountLastHour: ((n.data as any).errorCountLastHour || 0) + 1,
              },
            }
          : n
      ),
    })),
    
    // Audit log
    addAuditEntry: (entry) => set((state) => ({
      nodes: state.nodes.map((n) =>
        n.type === 'monitor'
          ? { ...n, data: { ...n.data, auditEntries: [entry, ...((n.data as any).auditEntries || [])].slice(0, 10000) } }
          : n
      ),
    })),
    
    // View modes
    setView: (view) => set({ currentView: view }),
    
    // Layout operations
    toggleLayoutLock: () => set((state) => ({ lockLayout: !state.lockLayout })),
    autoLayout: () => {
      // TODO: Implement dagre or elkjs auto-layout
      console.log('Auto-layout not implemented yet');
    },
    
    // Save/Load
    saveFlow: async () => {
      const state = get();
      const flowState = {
        nodes: state.nodes,
        edges: state.edges,
        tasks: state.tasks,
        version: state.version,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem('arkitekt-flow', JSON.stringify(flowState));
      set({ lastSaved: new Date().toISOString() });
    },
    
    loadFlow: async () => {
      const saved = localStorage.getItem('arkitekt-flow');
      if (saved) {
        const flowState = JSON.parse(saved);
        set({
          nodes: flowState.nodes || [],
          edges: flowState.edges || [],
          tasks: flowState.tasks || [],
          lastSaved: flowState.savedAt || new Date().toISOString(),
        });
      }
    },
    
    exportFlow: () => {
      const state = get();
      return JSON.stringify({
        nodes: state.nodes,
        edges: state.edges,
        tasks: state.tasks,
        version: state.version,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    },
    
    importFlow: (json) => {
      try {
        const flowState = JSON.parse(json);
        set({
          nodes: flowState.nodes || [],
          edges: flowState.edges || [],
          tasks: flowState.tasks || [],
        });
      } catch (e) {
        console.error('Failed to import flow:', e);
      }
    },
  }))
);

// Selectors
export const selectNodesByType = (type: string) => (state: FlowStore) =>
  state.nodes.filter((n) => n.type === type);

export const selectActiveAgents = (state: FlowStore) =>
  state.nodes.filter((n) => n.type === 'agent' && (n.data as any).status === 'running');

export const selectTasksByColumn = (column: KanbanColumn) => (state: FlowStore) =>
  state.tasks.filter((t) => t.column === column);

export const selectHumanGatesPending = (state: FlowStore) =>
  state.humanGatesPending;