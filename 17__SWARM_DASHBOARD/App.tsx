import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SwarmDashboard } from './components/SwarmDashboard';
import { CliHarnessView } from './components/CliHarnessView';
import { KanbanBoard } from './components/KanbanBoard';
import { CommunicationLog } from './components/CommunicationLog';
import { Settings } from './components/Settings';
import { VaultView } from './components/VaultView';
import { MemoryView } from './components/MemoryView';
import { ResearchView } from './components/ResearchView';
import { ScriptsView } from './components/ScriptsView';
import { TokensView } from './components/TokensView';
import { HistoryView } from './components/HistoryView';
import { TasklistView } from './components/TasklistView';
import PixelatedCanvasDemo from './components/pixelated-canvas-demo';
import DitherShaderInteractive from './components/dither-shader-interactive';
import { GridBackground } from './components/ui/GridBackground';
import { INITIAL_AGENTS, INITIAL_TASKS, INITIAL_LOGS } from './store';
import { Activity, ShieldAlert, Cpu, LayoutPanelLeft, MessageSquareText, Beaker, History as HistoryIcon, Code2, Coins } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'settings') {
      setIsSidebarExpanded(true);
    }
  }, [activeTab]);

  const [showPanels, setShowPanels] = useState(false);
  const [agents] = useState(INITIAL_AGENTS);
  const [tasks] = useState(INITIAL_TASKS);
  const [logs] = useState(INITIAL_LOGS);

  const totalTokens = agents.reduce((acc, a) => acc + a.tokensUsed, 0);

  return (
    <div className="h-[100dvh] w-screen bg-zinc-950 text-zinc-100 flex overflow-hidden font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-zinc-200 uppercase tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" /> 
              {activeTab === 'cli' ? 'CLI_HARNESSES' : activeTab.replace('-', '_').toUpperCase()}
            </h2>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-mono text-zinc-400">
            {activeTab === 'dashboard' && (
              <button 
                onClick={() => setShowPanels(!showPanels)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 rounded border transition-all text-[10px] font-bold uppercase tracking-wider",
                  showPanels ? "border-zinc-700 text-zinc-300 bg-zinc-800" : "border-zinc-800 text-zinc-500"
                )}
              >
                <LayoutPanelLeft className="w-3 h-3" />
                HUD Panels
              </button>
            )}
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4" />
              Swarm Total: <span className="text-zinc-200">{totalTokens.toLocaleString()}</span>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="hidden sm:inline">Operational</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <GridBackground>
            <AnimatePresence mode="wait">
            {activeTab === 'dashboard' ? (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full relative flex"
              >
                <div className="flex-1 relative overflow-hidden">
                  <SwarmDashboard />
                </div>

                {/* Overlying Panels for Dashboard */}
                <AnimatePresence>
                  {showPanels && (
                    <motion.div
                      initial={{ opacity: 0, x: 300 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 300 }}
                      className="absolute right-4 top-4 bottom-4 w-96 flex flex-col gap-4 z-40 pointer-events-none"
                    >
                      <div className="flex-1 bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 overflow-hidden pointer-events-auto shadow-2xl flex flex-col">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <LayoutPanelLeft className="w-3 h-3 text-blue-400" /> Swarm Kanban
                        </h4>
                        <div className="flex-1 overflow-hidden">
                           <KanbanBoard tasks={tasks} agents={agents} />
                        </div>
                      </div>

                      <div className="h-1/3 bg-zinc-950/90 border border-zinc-800/80 backdrop-blur-xl rounded-2xl p-4 overflow-hidden pointer-events-auto shadow-2xl flex flex-col">
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <MessageSquareText className="w-3 h-3 text-purple-400" /> Comms Stream
                        </h4>
                        <div className="flex-1 overflow-hidden">
                          <CommunicationLog logs={logs} agents={agents} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : activeTab === 'tasks' ? (
              <motion.div
                key="tasks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <TasklistView />
              </motion.div>
            ) : activeTab === 'cli' ? (
              <motion.div
                key="cli"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full"
              >
                <CliHarnessView />
              </motion.div>
            ) : activeTab === 'vault' ? (
              <motion.div
                key="vault"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <VaultView />
              </motion.div>
            ) : activeTab === 'memory' ? (
              <motion.div
                key="memory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <MemoryView />
              </motion.div>
            ) : activeTab === 'research' ? (
              <motion.div
                key="research"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ResearchView />
              </motion.div>
            ) : activeTab === 'scripts' ? (
              <motion.div
                key="scripts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <ScriptsView />
              </motion.div>
            ) : activeTab === 'tokens' ? (
              <motion.div
                key="tokens"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <TokensView />
              </motion.div>
            ) : activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <HistoryView />
              </motion.div>
            ) : activeTab === 'visuals' ? (
              <motion.div
                key="visuals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-y-auto p-8"
              >
                <div className="max-w-4xl mx-auto space-y-12">
                   <section>
                      <h2 className="text-xl font-black italic tracking-tighter mb-6 uppercase">Pixelated Canvas Engine</h2>
                      <PixelatedCanvasDemo />
                   </section>
                   <div className="h-px bg-zinc-900" />
                   <section>
                      <h2 className="text-xl font-black italic tracking-tighter mb-6 uppercase">Dither Shader Lab</h2>
                      <DitherShaderInteractive />
                   </section>
                </div>
              </motion.div>
            ) : activeTab === 'settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <Settings />
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex items-center justify-center flex-col text-zinc-500 gap-6 bg-zinc-950"
              >
                <ShieldAlert className="w-16 h-16 opacity-20" />
                
                <div className="text-center">
                  <h3 className="text-zinc-200 font-bold text-lg uppercase tracking-widest">
                    Module '{activeTab.replace('-', ' ')}'
                  </h3>
                  <p className="text-sm mt-2 text-zinc-600 font-mono">Initializing neural handshake... [WAITING]</p>
                </div>

                <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                   <motion.div 
                    animate={{ x: [-192, 192] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-1/2 h-full bg-gradient-to-r from-transparent via-zinc-600 to-transparent"
                   />
                </div>

                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="px-6 py-2 mt-4 text-[10px] font-bold uppercase tracking-widest border border-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-900 transition-all hover:text-zinc-200"
                >
                  Return to Command Center
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          </GridBackground>
        </div>
      </main>
    </div>
  );
}

