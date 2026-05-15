// components/floating-dock/FloatingDockMenu.tsx

'use client';

import React, { useState } from 'react';
import { useFlowStore } from '@/stores/flow-store';
import { TwistedNodeData } from '@/types/flow-common';

// Node templates for quick spawning
const NODE_TEMPLATES = {
  agent: [
    { name: 'Sniper', persona: 'sniper', model: 'gpt-4o' },
    { name: 'Researcher', persona: 'deep-researcher', model: 'gpt-4o' },
    { name: 'Builder', persona: 'builder', model: 'gpt-4o' },
    { name: 'Critic', persona: 'critic', model: 'gpt-4o' },
    { name: 'Orchestrator', persona: 'orchestrator', model: 'gpt-4o' },
  ],
  service: [
    { name: 'GitHub', serviceType: 'github' },
    { name: 'Slack', serviceType: 'slack' },
    { name: 'LM Studio', serviceType: 'lm-studio' },
    { name: 'PostgreSQL', serviceType: 'postgres' },
  ],
  memory: [
    { name: 'Vector Store', backend: 'pgvector' },
    { name: 'SQLite Vec', backend: 'sqlite-vec' },
    { name: 'Chroma', backend: 'chroma' },
  ],
  logic: [
    { name: 'Orchestrator', logicType: 'orchestrator' },
    { name: 'Karpatchy Loop', logicType: 'karpatchy-loop' },
    { name: 'Human Gate', logicType: 'human-gate' },
    { name: 'Router', logicType: 'router' },
    { name: 'Cron Trigger', logicType: 'cron-trigger' },
  ],
  tasklist: [
    { name: 'Main Tasklist', sourceFile: 'TASKLIST.md' },
  ],
  monitor: [
    { name: 'Traffic Monitor', monitorType: 'traffic-monitor' },
    { name: 'Token Burn', monitorType: 'token-burn' },
    { name: 'Error Stream', monitorType: 'error-stream' },
    { name: 'Audit Log', monitorType: 'audit-log' },
  ],
};

const NODE_ICONS: Record<string, string> = {
  agent: '🤖',
  service: '🔌',
  memory: '🧠',
  logic: '🎛️',
  tasklist: '📋',
  monitor: '📡',
};

interface FloatingDockMenuProps {
  onAddNode: (type: string, data: Partial<TwistedNodeData>) => void;
}

export function FloatingDockMenu({ onAddNode }: FloatingDockMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleAddNode = (type: string, template: any) => {
    const baseData = getBaseNodeData(type, template);
    onAddNode(type, baseData as TwistedNodeData);
    setIsOpen(false);
    setActiveTab(null);
  };

  return (
    <>
      {/* Floating Dock Button */}
      <div className={`absolute bottom-20 right-4 z-50`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-all hover:bg-blue-500 hover:scale-110 ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          <span className={`text-2xl`}>+</span>
        </button>

        {/* Dock Menu */}
        {isOpen && (
          <div className={`absolute bottom-16 right-0 w-64 rounded-lg border border-neutral-700 bg-neutral-900 shadow-xl`}>
            {/* Node type tabs */}
            <div className={`flex flex-wrap border-b border-neutral-700 p-2`}>
              {Object.keys(NODE_TEMPLATES).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(activeTab === type ? null : type)}
                  className={`flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors ${
                    activeTab === type
                      ? 'bg-blue-600 text-white'
                      : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                  }`}
                >
                  <span>{NODE_ICONS[type]}</span>
                  <span className={`capitalize`}>{type}</span>
                </button>
              ))}
            </div>

            {/* Templates for selected type */}
            {activeTab && (
              <div className={`max-h-64 overflow-auto p-2`}>
                {(NODE_TEMPLATES as any)[activeTab].map((template: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleAddNode(activeTab, template)}
                    className={`mb-1 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800`}
                  >
                    <span>{NODE_ICONS[activeTab]}</span>
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* No tab selected - show all */}
            {!activeTab && (
              <div className={`p-2 text-xs text-neutral-500`}>
                Select a node type to see templates
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function getBaseNodeData(type: string, template: any): any {
  const id = `${type}-${Date.now()}`;
  
  switch (type) {
    case 'agent':
      return {
        type: 'agent',
        agentId: id,
        name: template.name,
        persona: template.persona,
        model: template.model,
        status: 'idle',
        modules: [],
        contextWindow: {
          currentTokens: 0,
          maxTokens: 128000,
          pressure: 0,
          lastMessages: [],
        },
        taskQueue: [],
        currentTask: null,
        temperature: 0.7,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        tokenBurnTotal: 0,
        errorCount: 0,
      };
    case 'service':
      return {
        type: 'service',
        serviceId: id,
        name: template.name,
        serviceType: template.serviceType,
        health: 'unknown',
        endpoints: [],
        credentials: [],
        autoFailover: false,
        requestCount: 0,
        errorCount: 0,
        avgLatencyMs: 0,
        connectedAgents: [],
        retryPolicy: { maxRetries: 3, backoffMs: 1000, timeoutMs: 30000 },
      };
    case 'memory':
      return {
        type: 'memory',
        memoryId: id,
        name: template.name,
        backend: template.backend,
        embeddingModel: 'text-embedding-3-large',
        embeddingDimension: 1536,
        indices: [],
        fileDropEnabled: true,
        autoChunkSize: 512,
        autoChunkOverlap: 50,
        connectedAgents: [],
        totalDocuments: 0,
        totalVectors: 0,
        storageUsedBytes: 0,
        lastQuery: '',
        lastQueryLatencyMs: 0,
      };
    case 'logic':
      return {
        type: 'logic',
        logicType: template.logicType,
        inputQueue: [],
        outputQueue: [],
        processing: false,
        triggerEnabled: template.logicType === 'cron-trigger',
      };
    case 'tasklist':
      return {
        type: 'tasklist',
        tasklistId: id,
        name: template.name,
        sourceFile: template.sourceFile,
        columns: ['backlog', 'ready', 'in-progress', 'review', 'done'],
        wipLimits: { 'in-progress': 3, review: 2 },
        tasks: [],
        totalTasks: 0,
        completedTasks: 0,
        connectedAgents: [],
        autoArchiveAfterHours: 72,
        requireHumanApprovalFor: [],
      };
    case 'monitor':
      return {
        type: 'monitor',
        monitorType: template.monitorType,
        name: template.name,
        trafficPackets: [],
        trafficPacketLimit: 1000,
        tokenBurnWindow: 'hour',
        tokenBurnEntries: [],
        totalBurnUsd: 0,
        burnRateUsdPerHour: 0,
        budgetAlertThreshold: 0.8,
        errors: [],
        errorCountLastHour: 0,
        autoPauseOnError: false,
        auditEntries: [],
        auditExportFormat: 'json',
        healthHistory: [],
        alertThresholds: { cpuPercent: 80, memoryPercent: 80, diskPercent: 90 },
      };
    default:
      return {};
  }
}