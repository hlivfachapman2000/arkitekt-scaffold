import React from 'react';
import { Database, Search, BookOpen, Cpu, Shield, History, Network } from 'lucide-react';
import { motion } from 'framer-motion';

import { CanvasText } from './ui/canvas-text';

export const MemoryView = () => {
  return (
    <div className="p-8 h-full overflow-hidden bg-zinc-950 flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Database className="w-8 h-8 text-blue-500" />
            <CanvasText 
              text="MEMORY_SYSTEMS" 
              backgroundClassName="bg-zinc-950" 
              colors={["#3b82f6", "#60a5fa", "#2563eb"]} 
              lineGap={4}
            />
          </h2>
          <p className="text-zinc-500 mt-2">Hybrid vector/relational storage with Karpachy-Neural-Wiki integration.</p>
        </div>
        <div className="flex gap-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3">
            <Cpu className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Vector Load</p>
              <p className="font-mono text-zinc-200">1.2ms Avg</p>
            </div>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Storage Health</p>
              <p className="font-mono text-zinc-200">99.9%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-4 gap-6 overflow-hidden">
        {/* Memory Browser / Wiki Sidebar */}
        <div className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4">
           <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input 
                type="text" 
                placeholder="Search Memory..." 
                className="w-full bg-black border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none"
              />
           </div>
           
           <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pt-2">Relational (SQLite)</p>
             <div className="space-y-1">
               {['Agents_Core', 'Tasks_Archive', 'System_Configs'].map(db => (
                 <button key={db} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2">
                   <Database className="w-3 h-3 opacity-50" /> {db}
                 </button>
               ))}
             </div>
             
             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pt-4">Vector (Qdrant)</p>
             <div className="space-y-1">
               {['User_Preferences', 'Code_Context_V2', 'Doc_Embeddings'].map(db => (
                 <button key={db} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2">
                   <Network className="w-3 h-3 opacity-50" /> {db}
                 </button>
               ))}
             </div>

             <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pt-4">Neural Wiki</p>
             <div className="space-y-1">
               {['Core Protocols', 'Architecture Docs', 'Research Notes'].map(db => (
                 <button key={db} className="w-full text-left px-3 py-2 rounded-lg hover:bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-2">
                   <History className="w-3 h-3 opacity-50" /> {db}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Wikipedia Style Content Area */}
        <div className="col-span-3 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-y-auto p-12 relative shadow-inner">
           <div className="max-w-3xl mx-auto space-y-8">
              <header className="border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2 font-mono">
                  <span>ROOT</span> / <span>NEURAL_WIKI</span> / <span className="text-blue-500">CORE_PROTOCOLS</span>
                </div>
                <h1 className="text-4xl font-serif text-white italic">The Arkitekt Core Protocol v3.1</h1>
              </header>

              <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed space-y-6">
                <p>
                  The <span className="text-zinc-100 font-semibold">Arkitekt Core Protocol</span> defines the fundamental interaction paradigm 
                  between the Orchestrator node and the subordinate agent swarm. It utilizes an 
                  <span className="text-blue-400"> asynchronous, event-driven architecture</span> designed for high-concurrency code generation 
                  and automated research.
                </p>

                <div className="bg-zinc-900 border-l-4 border-blue-500 p-4 italic text-zinc-300">
                  "Efficiency is not just about speed, but about the reduction of wasted intellectual cycles between nodes." — Neural Genesis Docs
                </div>

                <h3 className="text-xl font-bold text-zinc-200">Sub-system: Qdrant Vector Search</h3>
                <p>
                  By offloading contextual retrieval to a high-performance vector database, we achieve near-instantaneous 
                  long-term memory recall. This system leverages 
                  <span className="text-zinc-100 italic"> multilingual embeddings </span> 
                  to ensure cross-language capability when managing heterogeneous codebases.
                </p>

                <h3 className="text-xl font-bold text-zinc-200">Sub-system: SQLite Persistence</h3>
                <p>
                  Relational data remains the "spine" of the Arkitekt. SQLite handles session state, agent IDs, and 
                  the task DAG (Directed Acyclic Graph), ensuring that if the swarm reboots, the mission context 
                  is preserved with <span className="text-zinc-100">ACID compliance</span>.
                </p>

                <div className="grid grid-cols-2 gap-4 not-prose mt-12">
                   <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Internal Links</h4>
                      <ul className="text-xs space-y-1 text-blue-400 italic">
                        <li className="hover:underline cursor-pointer">Agent Handshake Protocol</li>
                        <li className="hover:underline cursor-pointer">Memory Sync Faults</li>
                        <li className="hover:underline cursor-pointer">Openviking Integration</li>
                      </ul>
                   </div>
                   <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Linked Metadata</h4>
                      <div className="text-[10px] font-mono text-zinc-600 space-y-1">
                        <p>ID: M_CORE_001</p>
                        <p>HASH: 0x98f2..a31c</p>
                        <p>NODES: 12 Active</p>
                      </div>
                   </div>
                </div>
              </div>
           </div>

           {/* Floating Action Menu */}
           <div className="fixed bottom-12 right-12 flex flex-col gap-2">
             <button className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
               <BookOpen className="w-5 h-5" />
             </button>
             <button className="w-12 h-12 bg-zinc-800 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-zinc-700 transition-colors">
               <History className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
