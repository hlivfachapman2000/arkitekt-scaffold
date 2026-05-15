// app/flow/page.tsx - Main React Flow Command Center

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from '@/components/flow/nodes';
import { useFlowStore } from '@/stores/flow-store';
import { realtime } from '@/lib/realtime';

import { KanbanPanel } from '@/components/kanban/KanbanPanel';
import { StatusBar } from '@/components/StatusBar';
import { TwistedNode, TwistedEdge, TwistedNodeData } from '@/types/flow-common';

import { AgentsSidebar } from '@/components/flow/AgentsSidebar';

export default function FlowPage() {
  // Local React Flow state
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState<TwistedNode>([]);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState<TwistedEdge>([]);
  
  // Global store
  const storeNodes = useFlowStore((s) => s.nodes);
  const storeEdges = useFlowStore((s) => s.edges);
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const selectNode = useFlowStore((s) => s.selectNode);
  const running = useFlowStore((s) => s.running);
  const autopilotMode = useFlowStore((s) => s.autopilotMode);
  const humanGatesPending = useFlowStore((s) => s.humanGatesPending);
  const startFlow = useFlowStore((s) => s.startFlow);
  const pauseFlow = useFlowStore((s) => s.pauseFlow);
  const stopFlow = useFlowStore((s) => s.stopFlow);
  const setAutopilotMode = useFlowStore((s) => s.setAutopilotMode);
  const saveFlow = useFlowStore((s) => s.saveFlow);
  const loadFlow = useFlowStore((s) => s.loadFlow);
  const currentView = useFlowStore((s) => s.currentView);
  const setView = useFlowStore((s) => s.setView);
  const totalTokenBurnUsd = useFlowStore((s) => s.totalTokenBurnUsd);
  const activeAgentCount = useFlowStore((s) => s.activeAgentCount);
  const crashedAgentCount = useFlowStore((s) => s.crashedAgentCount);
  
  // UI state
  const [showKanban, setShowKanban] = useState(true);

  // Sync store → local
  useEffect(() => {
    setLocalNodes(storeNodes as TwistedNode[]);
  }, [storeNodes]);

  useEffect(() => {
    setLocalEdges(storeEdges as TwistedEdge[]);
  }, [storeEdges]);

  // Load saved flow on mount
  useEffect(() => {
    loadFlow();
  }, [loadFlow]);

  // Auto-save on changes
  useEffect(() => {
    const interval = setInterval(() => {
      saveFlow();
    }, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [saveFlow]);

  // Connect to realtime on mount
  useEffect(() => {
    realtime.connect();
    // Start demo mode if no backend is available
    realtime.startDemoMode();
    return () => realtime.disconnect();
  }, []);

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: TwistedEdge = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        type: 'smoothstep',
        animated: true,
        data: {
          edgeType: 'sync',
          active: false,
          packetCount: 0,
          latencyMs: 0,
          tokenCount: 0,
          color: '#22c55e',
          animated: true,
          thickness: 1,
        },
      };
      setLocalEdges((eds) => [...eds, newEdge]);
      useFlowStore.getState().addConnection(connection as Connection);
    },
    []
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Handle background click (deselect)
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Add node from floating dock
  const addNode = useCallback((type: string, data: Partial<TwistedNodeData>) => {
    const newNode: TwistedNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: data as TwistedNodeData,
    };
    setLocalNodes((nds) => [...nds, newNode]);
    useFlowStore.getState().addNode(newNode);
  }, []);

  // Get selected node for inspector
  

  // Helper to generate node data for each type
  const getBaseNodeDataForType = (type: string): Record<string, unknown> => {
    const id = `${type}-${Date.now()}`;
    switch (type) {
      case 'agent':
        return { type: 'agent', agentId: id, name: 'New Agent', persona: 'agent', model: 'gpt-4o', status: 'idle', modules: [], contextWindow: { currentTokens: 0, maxTokens: 128000, pressure: 0, lastMessages: [] }, taskQueue: [], currentTask: null, temperature: 0.7, createdAt: new Date().toISOString(), lastActivity: new Date().toISOString(), tokenBurnTotal: 0, errorCount: 0 };
      case 'service':
        return { type: 'service', serviceId: id, name: 'New Service', serviceType: 'http', health: 'unknown', endpoints: [], credentials: [], autoFailover: false, requestCount: 0, errorCount: 0, avgLatencyMs: 0, connectedAgents: [], retryPolicy: { maxRetries: 3, backoffMs: 1000, timeoutMs: 30000 } };
      case 'memory':
        return { type: 'memory', memoryId: id, name: 'New Memory', backend: 'pgvector', embeddingModel: 'text-embedding-3-large', embeddingDimension: 1536, indices: [], fileDropEnabled: true, autoChunkSize: 512, autoChunkOverlap: 50, connectedAgents: [], totalDocuments: 0, totalVectors: 0, storageUsedBytes: 0 };
      case 'logic':
        return { type: 'logic', logicType: 'orchestrator', inputQueue: [], outputQueue: [], processing: false, triggerEnabled: false };
      case 'tasklist':
        return { type: 'tasklist', tasklistId: id, name: 'New Tasklist', sourceFile: 'TASKLIST.md', columns: ['backlog', 'ready', 'in-progress', 'review', 'done'], wipLimits: { 'in-progress': 3, review: 2 }, tasks: [], totalTasks: 0, completedTasks: 0, connectedAgents: [], autoArchiveAfterHours: 72, requireHumanApprovalFor: [] };
      case 'monitor':
        return { type: 'monitor', monitorType: 'traffic-monitor', name: 'New Monitor', trafficPackets: [], trafficPacketLimit: 1000, tokenBurnWindow: 'hour', tokenBurnEntries: [], totalBurnUsd: 0, burnRateUsdPerHour: 0, budgetAlertThreshold: 0.8, errors: [], errorCountLastHour: 0, autoPauseOnError: false, auditEntries: [], auditExportFormat: 'json', healthHistory: [], alertThresholds: { cpuPercent: 80, memoryPercent: 80, diskPercent: 90 } };
      default:
        return {};
    }
  };

  // Generate node spawn items
  const getNodeSpawnItems = () => [
    { title: 'Agent', onClick: () => addNode('agent', getBaseNodeDataForType('agent') as TwistedNodeData) },
    { title: 'Service', onClick: () => addNode('service', getBaseNodeDataForType('service') as TwistedNodeData) },
    { title: 'Memory', onClick: () => addNode('memory', getBaseNodeDataForType('memory') as TwistedNodeData) },
    { title: 'Logic', onClick: () => addNode('logic', getBaseNodeDataForType('logic') as TwistedNodeData) },
    { title: 'Tasklist', onClick: () => addNode('tasklist', getBaseNodeDataForType('tasklist') as TwistedNodeData) },
    { title: 'Monitor', onClick: () => addNode('monitor', getBaseNodeDataForType('monitor') as TwistedNodeData) },
  ];

  return (
    <div className={`flex h-screen w-full flex-col bg-black text-white`}>
      {/* Top Bar */}
      <div className={`flex h-12 items-center justify-between border-b border-white bg-black px-4`}>
        <div className={`flex items-center gap-6`}>
          <span className={`text-sm font-medium tracking-widest`}>ARKITEKT</span>
          <div className={`flex items-center gap-1`}>
            {getNodeSpawnItems().map((item) => (
              <button
                key={item.title}
                onClick={item.onClick}
                className={`btn-brutal`}
              >
                {item.title.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex flex-1 overflow-hidden`}>
        {/* Agent Rail (left sidebar) */}
        <div className={`w-16 flex-shrink-0 border-r border-white bg-black`}>
          <AgentsSidebar />
        </div>

        {/* Center: React Flow Canvas + Right Panels */}
        <div className={`relative flex flex-1 flex-col overflow-hidden`}>
          {/* Canvas */}
          <div className={`flex-1`}>
            <ReactFlow
              nodes={localNodes}
              edges={localEdges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              className={`bg-black`}
            >
              <Background color={`#000`} gap={20} />
              <Controls />
              <MiniMap
                nodeStrokeWidth={1}
                zoomable
                pannable
                className={`border border-white bg-black`}
              />
            </ReactFlow>
          </div>

          {/* Bottom - Kanban (collapsible) */}
          {showKanban && (
            <div className={`h-32 flex-shrink-0 border-t border-white bg-black`}>
              <KanbanPanel onClose={() => setShowKanban(false)} />
            </div>
          )}

          {/* Old FloatingDockMenu removed - now using horizontal navbar dock */}
        </div>
      </div>

      {/* Status Bar */}
      <div className={`h-12 flex-shrink-0 border-t border-white bg-black`}>
        <StatusBar
          running={running}
          autopilotMode={autopilotMode}
          humanGatesPending={humanGatesPending}
          activeAgentCount={activeAgentCount}
          crashedAgentCount={crashedAgentCount}
          totalBurnUsd={totalTokenBurnUsd}
          currentView={currentView}
          onStart={startFlow}
          onPause={pauseFlow}
          onStop={stopFlow}
          onToggleAutopilot={() => setAutopilotMode(!autopilotMode)}
          onViewChange={setView}
        />
      </div>


    </div>
  );
}