import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType,
  Connection,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { AgentNode } from './nodes/AgentNode';
import { ServiceNode } from './nodes/ServiceNode';
import { ExecutionNode } from './nodes/ExecutionNode';
import { GovernanceNode } from './nodes/GovernanceNode';
import { ObservabilityNode } from './nodes/ObservabilityNode';
import { KnowledgeNode } from './nodes/KnowledgeNode';
import { CustomTrafficEdge } from './edges/CustomTrafficEdge';
import { INITIAL_AGENTS, INITIAL_TASKS, INITIAL_LOGS } from '../store';
import { ShieldAlert, Zap, SlidersHorizontal, Activity, MessageSquareText, Terminal, ChevronDown, ChevronUp, Plus, ShoppingCart, Cpu, Network, Package, Box, Search, Layers, Beaker, Code2, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CommunicationLog } from './CommunicationLog';

const nodeTypes = {
  agent: AgentNode,
  service: ServiceNode,
  execution: ExecutionNode,
  governance: GovernanceNode,
  observability: ObservabilityNode,
  knowledge: KnowledgeNode,
};

const edgeTypes = {
  traffic: CustomTrafficEdge,
};

const defaultViewport = { x: 100, y: 100, zoom: 1.2 };

export const SwarmDashboard = () => {
  const [criticHardcore, setCriticHardcore] = useState(50);
  const [activeAgents, setActiveAgents] = useState(['a1', 'a4']);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(false);
  const [showModuleMarket, setShowModuleMarket] = useState(false);
  
  const initialNodes = useMemo(() => {
    const nodes = [
      ...INITIAL_AGENTS.filter(a => activeAgents.includes(a.id)).map((agent, index) => ({
        id: agent.id,
        type: 'agent',
        data: { ...agent },
        position: { x: index * 300, y: 100 },
      })),
      {
        id: 's1',
        type: 'service',
        data: { label: 'G_SEARCH_API', status: 'online' },
        position: { x: 150, y: -100 },
      },
      {
        id: 'e1',
        type: 'execution',
        data: { label: 'MAIN_LOOP', dryRun: true, concurrency: 4 },
        position: { x: 450, y: -100 },
      },
      {
        id: 'g1',
        type: 'governance',
        data: { label: 'RISK_ADVISOR', risk: 'high', budget: '12.50' },
        position: { x: 750, y: 100 },
      },
      {
        id: 'o1',
        type: 'observability',
        data: { label: 'SWARM_SNIFFER', latency: '42ms', tokenRate: '1.2k' },
        position: { x: 300, y: 400 },
      },
      {
        id: 'k1',
        type: 'knowledge',
        data: { label: 'VEC_MINERS', knowledgeType: 'vector', recordCount: '154k' },
        position: { x: 0, y: 200 },
      }
    ];
    return nodes;
  }, [activeAgents]);

  const initialEdges = useMemo(() => {
    const edges: Edge[] = [
      { id: 'e-s1-a1', source: 's1', target: 'a1', type: 'traffic', data: { label: 'QUERY_PIPE', traffic: 0.4, tokens: '142' }, style: { stroke: '#3b82f6' } },
      { id: 'e-e1-a4', source: 'e1', target: 'a4', type: 'traffic', data: { label: 'EXEC_FLOW', traffic: 0.8, tokens: '3.2k' }, style: { stroke: '#a855f7' } },
      { id: 'e-a4-g1', source: 'a4', target: 'g1', type: 'traffic', data: { label: 'AUTH_GATE', traffic: 0.1 }, style: { stroke: '#ef4444' } },
      { id: 'e-a1-o1', source: 'a1', target: 'o1', type: 'traffic', data: { label: 'TRACE_DUMP', traffic: 0.9, tokens: '1.5k' }, style: { stroke: '#3b82f6' } },
      { id: 'e-k1-a1', source: 'k1', target: 'a1', type: 'traffic', data: { label: 'MEM_FETCH', traffic: 0.6, tokens: '890' }, style: { stroke: '#10b981' } },
    ];
    return edges;
  }, [activeAgents]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges as any);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const simulateSwarmExpansion = () => {
    if (!activeAgents.includes('a4')) {
      setActiveAgents(prev => [...prev, 'a4']);
    } else if (!activeAgents.includes('a2')) {
      setActiveAgents(prev => [...prev, 'a2', 'a3']);
    } else if (!activeAgents.includes('a5')) {
      setActiveAgents(prev => [...prev, 'a5']);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-black/20">
      {/* Top Control Bar */}
      <div className="p-4 border-b border-zinc-800/50 bg-zinc-950/50 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-black italic tracking-tighter flex items-center gap-2 text-zinc-100 uppercase">
              ARKITEKT_SWARM
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Activity className="w-3 h-3 text-green-500" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-500">INTEGRITY_SHIELD: 98% / NOMINAL</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 border-l border-zinc-800 pl-8">
             <div className="flex flex-col gap-1">
                <div 
                  className="flex items-center justify-between"
                  id="dashboard-metrics-container"
                >
                  <label className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-1">
                    <ShieldAlert 
                      className="w-3 h-3" 
                      style={{ backgroundColor: '#1c1f14' }}
                    /> CRITIC HARDCORE LEVEL
                  </label>
                  <span className="text-[10px] font-mono text-zinc-500 font-bold">{criticHardcore}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={criticHardcore} 
                  onChange={(e) => setCriticHardcore(parseInt(e.target.value))}
                  className="w-48 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-red-500 border border-zinc-700"
                />
             </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowModuleMarket(!showModuleMarket)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 border rounded-none text-[10px] font-bold uppercase tracking-widest transition-all",
              showModuleMarket ? "bg-zinc-800 border-zinc-600 text-zinc-100" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
            )}
          >
            <Package className="w-3 h-3" />
            Module Market
          </button>
          <button 
            onClick={simulateSwarmExpansion}
            style={{
              backgroundColor: '#223542',
              borderColor: '#deb0b0',
              color: '#723a3a'
            }}
            className="flex items-center gap-2 px-3 py-1.5 border rounded-none text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            <Zap className="w-3 h-3" />
            Stimulate Deployment
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultViewport={defaultViewport}
          minZoom={0.5}
          maxZoom={4}
          className="bg-dot-grid"
        >
          <Background color="#18181b" gap={20} />
          <Controls className="!bg-zinc-900 !border-zinc-800 !fill-zinc-400 shadow-xl" />
          <MiniMap 
            nodeColor={(n) => {
              if (n.id === 'a1') return '#a855f7';
              if (n.id === 'a2') return '#ef4444';
              return '#3f3f46';
            }} 
            className="!bg-zinc-950 !border-zinc-800"
            maskColor="rgba(0,0,0,0.5)"
          />
        </ReactFlow>

        {/* Dynamic Legend / State HUD - Now Movable and Edgy */}
        <AnimatePresence>
          {showModuleMarket && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className="absolute top-20 left-6 bottom-20 w-80 bg-zinc-950/95 border border-zinc-800 backdrop-blur-2xl shadow-2xl z-[60] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-zinc-400" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-200">Module_Marketplace</h3>
                  </div>
                  <button onClick={() => setShowModuleMarket(false)} className="text-zinc-600 hover:text-zinc-400">
                      <Plus className="w-4 h-4 rotate-45" />
                  </button>
              </div>

              <div className="p-3">
                  <div className="relative mb-4">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
                      <input 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-none pl-9 pr-4 py-2 text-[10px] font-mono text-zinc-400 placeholder:text-zinc-700 outline-none focus:border-zinc-600 transition-colors"
                        placeholder="SEARCH_FOR_CORE_EXTENSIONS..."
                      />
                  </div>

                  <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)] pr-1 custom-scrollbar">
                      {[
                        { name: 'ResearchModule', icon: Beaker, desc: 'Enables deep web search loops.', cost: '120k' },
                        { name: 'CodeHarness', icon: Code2, desc: 'Direct execution on local filesystem.', cost: 'FREE' },
                        { name: 'VisionBridge', icon: Layers, desc: 'Image-to-code OCR and analysis.', cost: '250k' },
                        { name: 'MemoryPulse', icon: Database, desc: 'Long-term vector database persistence.', cost: '50k' },
                        { name: 'GovernanceGate', icon: ShieldAlert, desc: 'High-risk action approval system.', cost: 'FREE' },
                      ].map(mod => (
                        <div key={mod.name} className="p-3 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 group transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-zinc-800 border border-zinc-700">
                                        <mod.icon className="w-3 h-3 text-zinc-400" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tight text-zinc-200">{mod.name}</span>
                                </div>
                                <span className="text-[8px] font-mono text-zinc-600">{mod.cost}</span>
                            </div>
                            <p className="text-[8px] text-zinc-500 italic leading-snug">{mod.desc}</p>
                            <button className="w-full mt-3 py-1.5 bg-zinc-800 border border-zinc-700 text-[8px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200 transition-all opacity-0 group-hover:opacity-100">
                                Install Extension
                            </button>
                        </div>
                      ))}
                  </div>
              </div>

              <div className="mt-auto p-4 border-t border-zinc-800 bg-zinc-900/20">
                  <div className="flex items-center justify-between text-[8px] font-mono mb-2">
                      <span className="text-zinc-600 uppercase">Swarm Compatibility</span>
                      <span className="text-green-500">OPTIMAL</span>
                  </div>
                  <div className="h-1 bg-zinc-800 w-full">
                      <div className="h-full bg-green-500 w-full" />
                  </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          drag
          dragMomentum={false}
          className="absolute top-20 right-6 p-4 rounded-none bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl shadow-2xl z-50 w-64 cursor-move"
        >
           <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
             <SlidersHorizontal className="w-3 h-3" /> Deployment Metrics
           </h4>
           <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Active Nodes</span>
                <span className="text-zinc-100 font-mono">{activeAgents.length}/5</span>
              </div>
              <div className="w-full bg-zinc-900 h-1 rounded-none overflow-hidden border border-zinc-800">
                 <div className="bg-purple-500 h-full transition-all duration-700" style={{ width: `${(activeAgents.length/5)*100}%` }} />
              </div>
              <div className="mt-4 p-2 bg-zinc-900/50 rounded-none border border-zinc-800/50">
                 <p className="text-[9px] text-zinc-500 leading-tight uppercase font-bold tracking-tighter">
                    {activeAgents.length < 5 
                      ? "SYSTEM_SCALING: IN_PROGRESS" 
                      : "SYSTEM_OPTIMIZED: PEAK_CAPACITY"}
                 </p>
              </div>
           </div>
        </motion.div>

        {/* Floating Command Console & Trace - Edgy Design */}
        <motion.div 
          drag
          dragMomentum={false}
          initial={false}
          animate={{ 
            height: isConsoleExpanded ? '300px' : '40px',
            width: isConsoleExpanded ? '600px' : '220px'
          }}
          className="absolute bottom-6 left-6 bg-zinc-950/90 border border-zinc-800 backdrop-blur-xl rounded-none overflow-hidden shadow-2xl z-50 flex flex-col cursor-move"
        >
          <div className="h-10 px-4 flex items-center justify-between border-b border-zinc-800 shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Arktkt_Shell_v3.1</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsConsoleExpanded(!isConsoleExpanded);
              }}
              className="p-1 hover:bg-white/10 transition-colors"
            >
              {isConsoleExpanded ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronUp className="w-3 h-3 text-zinc-600" />}
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-zinc-800/50">
             <div className="flex flex-col p-4 overflow-hidden">
                <h5 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MessageSquareText className="w-2.5 h-2.5 text-blue-400" /> Live Trace
                </h5>
                <div className="flex-1 overflow-hidden">
                   <CommunicationLog logs={INITIAL_LOGS} agents={INITIAL_AGENTS} />
                </div>
             </div>
             <div className="p-4 bg-black/40 font-mono text-[10px] space-y-2 overflow-y-auto custom-scrollbar">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500">orchestrator:</span>
                  <span className="text-zinc-300">Evaluating swarm expansion requirements...</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-500">orchestrator:</span>
                  <span className="text-zinc-300">Stimulating development agent nodes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-500">system:</span>
                  <span className="text-zinc-500 italic">Nodes a2, a3, a4 connected to cluster.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-500">orchestrator:</span>
                  <span className="text-zinc-100 animate-pulse">_</span>
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
