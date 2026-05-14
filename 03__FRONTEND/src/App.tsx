/**
 * @license Apache-2.0
 * Layout adapted from SITK.DEV-AGENTIC-FOUNDATION (finasteos/SITK.DEV-AGENTIC-FOUNDATION)
 */
import React, { useState } from 'react';
import {
  Network, Terminal, LayoutDashboard, ClipboardList,
  Activity, Cpu, ChevronRight, Database, Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DashboardHome } from './components/DashboardHome';
import { TerminalView } from './components/TerminalView';
import { KanbanBoard } from './components/KanbanBoard';
import { TelemetryView } from './components/TelemetryView';
import { AgentCreator } from './components/AgentCreator';

export type View = 'dashboard' | 'terminal' | 'kanban' | 'telemetry' | 'creator';

const NAV: { id: View; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard',  label: 'Monitor',      icon: LayoutDashboard },
  { id: 'terminal',   label: 'Terminals',    icon: Terminal },
  { id: 'kanban',     label: 'Active Flows', icon: ClipboardList },
  { id: 'telemetry',  label: 'Telemetry',    icon: Activity },
  { id: 'creator',    label: 'Laboratory',   icon: Cpu },
];

export default function App() {
  const [view, setView]     = useState<View>('dashboard');
  const [open, setOpen]     = useState(true);
  const [clock, setClock]   = useState(() => new Date().toISOString().slice(11, 19));

  React.useEffect(() => {
    const id = setInterval(() => setClock(new Date().toISOString().slice(11, 19)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-screen bg-[#050505] text-[#e0e0e0] overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: open ? 240 : 72 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="border-r border-[#1a1a1a] bg-[#0a0a0a] flex flex-col z-50 shrink-0"
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3 border-b border-[#1a1a1a]">
          <div className="w-9 h-9 bg-white flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.35)] shrink-0">
            <Cpu className="w-5 h-5 text-black" />
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="font-mono font-bold text-base tracking-tighter whitespace-nowrap"
              >
                SITK.<span className="text-[#555]">FS</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-5 px-2 space-y-1">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                view === item.id
                  ? 'bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.12)]'
                  : 'text-[#777] hover:bg-[#1a1a1a] hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-medium tracking-wide whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-[#1a1a1a]">
          <button
            onClick={() => setOpen(v => !v)}
            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-[#1a1a1a] text-[#444] transition-colors"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </motion.aside>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_0%,_#111_0%,_#050505_100%)]">
        {/* Header */}
        <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#0a0a0a]/60 backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#555]">
              {NAV.find(n => n.id === view)?.label}
            </h2>
            <div className="flex items-center gap-1.5 bg-[#111] px-2.5 py-1 rounded-full border border-[#2a2a2a]">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_#22c55e]" />
              <span className="text-[9px] font-mono text-[#888] uppercase">System Nominal</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-[#444] uppercase">
            UTC {clock}
          </div>
        </header>

        {/* View */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              {view === 'dashboard'  && <DashboardHome />}
              {view === 'terminal'   && <TerminalView />}
              {view === 'kanban'     && <KanbanBoard />}
              {view === 'telemetry'  && <TelemetryView />}
              {view === 'creator'    && <AgentCreator />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Status bar */}
        <footer className="h-7 border-t border-[#1a1a1a] bg-[#0a0a0a] flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-5 text-[9px] font-mono text-[#3a3a3a] uppercase">
            <div className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              <span>SITK_FS Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Network className="w-3 h-3" />
              <span>6 Harnesses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3 h-3" />
              <span>WS Bridge Active</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-[#3a3a3a] uppercase">
            agentic foundation v0.1
          </div>
        </footer>
      </main>
    </div>
  );
}
