import React from 'react';
import { cn } from '../lib/utils';
import { 
  Network, 
  Database, 
  BookOpen, 
  Beaker, 
  Settings, 
  Archive,
  TerminalSquare,
  ChevronRight,
  ChevronLeft,
  ScrollText,
  Code2,
  Coins,
  History,
  Palette,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'dashboard', icon: Network, label: 'Swarm Overview' },
  { id: 'tasks', icon: CheckSquare, label: 'Tasklist / Kanban' },
  { id: 'cli', icon: TerminalSquare, label: 'CLI Harness' },
  { id: 'memory', icon: Database, label: 'Memory (Qdrant/Wiki)' },
  { id: 'research', icon: Beaker, label: 'AutoResearch' },
  { id: 'scripts', icon: Code2, label: 'Global Scripts' },
  { id: 'vault', icon: ShieldCheck, label: 'Knowledge Vault' },
  { id: 'tokens', icon: Coins, label: 'Token Economy' },
  { id: 'visuals', icon: Palette, label: 'Visual Lab' },
  { id: 'history', icon: History, label: 'Run History/Archive' },
];

export const Sidebar = ({ 
  activeTab, 
  setActiveTab,
  isExpanded,
  setIsExpanded
}: { 
  activeTab: string, 
  setActiveTab: (t: string) => void,
  isExpanded: boolean,
  setIsExpanded: (v: boolean) => void
}) => {
  return (
    <motion.aside 
      initial={false}
      animate={{ width: isExpanded ? 240 : 64 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="border-r border-zinc-800/50 bg-zinc-950 flex flex-col h-[100dvh] shrink-0 overflow-hidden relative z-50"
    >
      <div className={cn(
        "flex items-center h-14 border-b border-zinc-800/50 px-4 shrink-0 overflow-hidden",
        !isExpanded && "justify-center px-0"
      )}>
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shrink-0">
           <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        </div>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="ml-3 font-bold text-xs tracking-widest uppercase truncate whitespace-nowrap"
          >
            The Arkitekt
          </motion.div>
        )}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={!isExpanded ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors text-left font-medium group h-10 overflow-hidden",
              activeTab === item.id 
                ? "bg-zinc-800 text-zinc-100" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50",
              !isExpanded && "justify-center px-0"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="truncate whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-800/50 flex flex-col gap-1">
        <button
          onClick={() => setActiveTab('settings')}
          title={!isExpanded ? 'Settings' : undefined}
          className={cn(
            "flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm transition-colors text-left font-medium h-10 overflow-hidden",
            activeTab === 'settings' 
              ? "bg-zinc-800 text-zinc-100" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50",
            !isExpanded && "justify-center px-0"
          )}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="truncate whitespace-nowrap"
            >
              Settings
            </motion.span>
          )}
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm transition-colors text-left font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 h-10 overflow-hidden",
            !isExpanded && "justify-center px-0"
          )}
        >
          {isExpanded ? <ChevronLeft className="w-5 h-5 shrink-0" /> : <ChevronRight className="w-5 h-5 shrink-0" />}
          {isExpanded && <span className="truncate whitespace-nowrap">Collapse</span>}
        </button>
      </div>
    </motion.aside>
  );
};
