"use client";
import React from "react";
import { motion } from "framer-motion";
import { History, Archive, Search, Terminal, Activity, FileText, Database, Shield, Zap, ChevronRight, HardDrive } from "lucide-react";
import { cn } from "../lib/utils";
import { DitherShader } from "./ui/dither-shader";
import { CanvasText } from "./ui/canvas-text";

const RUNS = [
  { id: 'R-721', name: 'SWARM_CONVERGENCE', date: '2026-05-14', time: '22:10', tokens: '1.2M', status: 'ARCHIVED', threat: 'NOMINAL' },
  { id: 'R-720', name: 'NEURAL_CRACK', date: '2026-05-14', time: '18:15', tokens: '450K', status: 'FAULT', threat: 'ELEVATED' },
  { id: 'R-719', name: 'DEEP_DIVE_X', date: '2026-05-13', time: '04:22', tokens: '8.1M', status: 'ARCHIVED', threat: 'NOMINAL' },
  { id: 'R-718', name: 'OSINT_PRIMARY', date: '2026-05-12', time: '14:30', tokens: '2.4M', status: 'ARCHIVED', threat: 'NOMINAL' },
  { id: 'R-717', name: 'GHOST_RUN_01', date: '2026-05-12', time: '11:05', tokens: '12K', status: 'DELETED', threat: 'SECRET' },
];

export const HistoryView = () => {
  return (
    <div className="h-full w-full bg-zinc-950 flex font-mono selection:bg-green-500/30 overflow-hidden">
        {/* Left Archive Browser */}
        <div className="w-96 border-r border-zinc-900 flex flex-col shrink-0 bg-zinc-950/20 backdrop-blur-md">
            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                        <History className="w-6 h-6 text-green-500" />
                        <CanvasText text="RUN_ARCHIVE" backgroundClassName="bg-zinc-950" colors={["#22c55e", "#10b981"]} />
                    </h2>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest leading-relaxed">
                        Persistent log of neural swarm execution cycles. Verified by Arkitekt-Chain.
                    </p>
                </div>

                <div className="relative">
                    <input 
                        type="text"
                        placeholder="SEARCH_LOGS..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-700" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {RUNS.map((run, i) => (
                    <motion.button
                        key={run.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="w-full bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 p-4 rounded-2xl text-left group transition-all"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-zinc-500 group-hover:text-zinc-300 transition-colors">{run.id}</span>
                            <span className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                run.status === 'ARCHIVED' ? "text-green-500 bg-green-500/5 border border-green-500/10" :
                                run.status === 'FAULT' ? "text-red-500 bg-red-500/5 border border-red-500/10" :
                                "text-zinc-500 bg-zinc-500/5 border border-zinc-500/10"
                            )}>{run.status}</span>
                        </div>
                        <div className="text-sm font-black text-white italic tracking-tighter mb-1 uppercase truncate">{run.name}</div>
                        <div className="flex items-center gap-4 text-[9px] text-zinc-600 font-mono">
                            <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> {run.tokens} tokens</span>
                            <span className="flex items-center gap-1 uppercase">{run.date} {run.time}</span>
                        </div>
                    </motion.button>
                 ))}
            </div>

            <div className="p-6 bg-black/20 border-t border-zinc-900">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-green-500">
                         <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Storage Status</div>
                        <div className="text-[10px] text-zinc-600">842.1 GB / 2.0 TB [42%]</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Preview Section */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-black">
             {/* Background Dither Guy - The Archivist */}
             <div className="absolute inset-0 z-0 opacity-15 pointer-events-none grayscale">
                 <DitherShader 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop" 
                    gridSize={6}
                    ditherMode="crosshatch"
                    colorMode="duotone"
                    primaryColor="#000000"
                    secondaryColor="#22c55e"
                    animated
                 />
            </div>

            <div className="flex-1 relative z-10 p-12 flex flex-col">
                <div className="flex-1 border border-zinc-900 rounded-[32px] bg-zinc-950/80 backdrop-blur-2xl p-12 flex flex-col gap-8 shadow-2xl">
                     <div className="flex items-start justify-between">
                         <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                    Archive_Session_V1
                                </span>
                                <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                            </div>
                            <h1 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
                                SYSTEM_RECAP_<span className="text-green-500">721</span>
                            </h1>
                         </div>

                         <div className="w-48 aspect-square relative group">
                            <div className="absolute inset-0 border border-zinc-800 rounded-3xl scale-90 group-hover:scale-100 transition-transform rotate-12" />
                            <div className="absolute inset-0 border border-zinc-800 rounded-3xl scale-90 group-hover:scale-100 transition-transform -rotate-6" />
                            <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col items-center justify-center gap-2 group-hover:bg-zinc-800 transition-colors">
                                 <FileText className="w-8 h-8 text-zinc-600" />
                                 <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Manifest.txt</span>
                            </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 flex-1">
                          <div className="flex flex-col gap-6">
                               <div className="p-6 border border-zinc-900 bg-black/40 rounded-3xl space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <Terminal className="w-3 h-3 text-green-500" /> Console Extract
                                    </h4>
                                    <div className="space-y-2 font-mono text-[11px] text-zinc-500">
                                        <p className="border-l border-zinc-800 pl-4">[22:10:04] Initializing swarm node convergence...</p>
                                        <p className="border-l border-green-500/20 pl-4 py-1.5 bg-green-500/5 text-green-500/80">[22:10:12] SUCCESS: Handshake established with 12 remote relays.</p>
                                        <p className="border-l border-zinc-800 pl-4">[22:11:45] Data stream stabilized at 4.2 GB/s.</p>
                                        <p className="border-l border-zinc-800 pl-4">[22:15:33] Beginning memory consolidation to Qdrant...</p>
                                    </div>
                               </div>

                               <div className="p-6 border border-zinc-900 bg-black/40 rounded-3xl flex-1 flex flex-col gap-4">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <Database className="w-3 h-3 text-blue-500" /> Memory Impact
                                    </h4>
                                    <div className="flex-1 flex items-center justify-center p-8 bg-zinc-900/20 rounded-2xl border border-zinc-900/50 border-dashed">
                                         <div className="text-center">
                                            <div className="text-4xl font-black italic tracking-tighter text-zinc-300">12,482</div>
                                            <div className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">New Vectors Indexed</div>
                                         </div>
                                    </div>
                               </div>
                          </div>

                          <div className="flex flex-col gap-6">
                               <div className="p-6 border border-zinc-900 bg-black/40 rounded-3xl space-y-4">
                                    <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-purple-500" /> Security Audit
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { label: 'INTEL_LEAK', status: 'NOT_DETECTED' },
                                            { label: 'NODE_POISONING', status: 'NOT_DETECTED' },
                                            { label: 'SIGNATURE_VALID', status: 'CONFIRMED' },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between py-2 border-b border-zinc-900/50">
                                                <span className="text-[10px] text-zinc-600 font-bold">{item.label}</span>
                                                <span className="text-[9px] text-green-500 font-mono italic">{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                               </div>

                               <div className="flex-1 bg-green-600 text-white rounded-3xl p-8 flex flex-col justify-between group overflow-hidden relative cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                    <motion.div 
                                        animate={{ x: [0, 10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute top-0 right-0 p-8"
                                    >
                                        <Archive className="w-12 h-12 opacity-20" />
                                    </motion.div>
                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className="text-sm font-black italic tracking-tighter uppercase uppercase leading-tight">View Full Swarm Telemetry</div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                            Download_Bundle <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                               </div>
                          </div>
                     </div>
                </div>
            </div>
        </div>
    </div>
  );
};
