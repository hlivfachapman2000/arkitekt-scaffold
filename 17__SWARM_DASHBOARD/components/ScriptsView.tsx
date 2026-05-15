"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Play, Terminal, Shield, Lock, Zap, Cpu, Search, Fingerprint, Bug } from "lucide-react";
import { cn } from "../lib/utils";
import { DitherShader } from "./ui/dither-shader";
import { CanvasText } from "./ui/canvas-text";

const SCRIPTS = [
  { id: '1', name: 'NEURAL_SCALPEL', type: 'Buffer_Overflow', threat: 'CRITICAL', status: 'READY', desc: 'Direct memory injection into remote swarm nodes.' },
  { id: '2', name: 'GHOST_CRAWLER', type: 'Stealth_Scan', threat: 'LOW', status: 'ACTIVE', desc: 'Passive metadata harvesting via TOR bridge.' },
  { id: '3', name: 'SYNAPSE_BREACH', type: 'Brute_Force', threat: 'HIGH', status: 'LOCKED', desc: 'Multi-threaded dictionary attack on auth relays.' },
  { id: '4', name: 'PULSE_JAMMER', type: 'DoS', threat: 'MEDIUM', status: 'READY', desc: 'High-frequency packet flooding for localized denial.' },
  { id: '5', name: 'VOID_PROTOCOL', type: 'Obfuscation', threat: 'LOW', status: 'ACTIVE', desc: 'Polymorphic wrapper for outbound communications.' },
];

export const ScriptsView = () => {
  const [selectedScript, setSelectedScript] = useState(SCRIPTS[0]);
  const [isExecuting, setIsExecuting] = useState(false);

  return (
    <div className="h-full w-full bg-zinc-950 flex font-mono selection:bg-purple-500/30 overflow-hidden">
        {/* Left List */}
        <div className="w-80 border-r border-zinc-900 flex flex-col shrink-0 bg-zinc-950/50 backdrop-blur-md">
            <div className="p-6 border-b border-zinc-900">
                <h2 className="text-xl font-black italic tracking-tighter flex items-center gap-2 text-white">
                    <Code2 className="w-5 h-5 text-purple-500" />
                    <CanvasText text="GLOBAL_SCRIPTS" backgroundClassName="bg-zinc-950" colors={["#a855f7", "#3b82f6"]} />
                </h2>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Encrypted Repository</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {SCRIPTS.map(script => (
                    <button
                        key={script.id}
                        onClick={() => setSelectedScript(script)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-lg transition-all group text-left",
                            selectedScript.id === script.id 
                                ? "bg-zinc-900 border border-zinc-800" 
                                : "hover:bg-zinc-900/40 border border-transparent"
                        )}
                    >
                        <div className={cn(
                            "w-1 h-8 rounded-full transition-all",
                            selectedScript.id === script.id ? "bg-purple-500 scale-y-100" : "bg-zinc-800 scale-y-50 group-hover:scale-y-75"
                        )} />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                    "text-[10px] font-black tracking-tighter uppercase",
                                    selectedScript.id === script.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                                )}>{script.name}</span>
                                <span className={cn(
                                    "text-[8px] px-1 py-0.5 rounded border border-zinc-800 uppercase font-bold tracking-tighter",
                                    script.threat === 'CRITICAL' ? 'text-red-500' : 
                                    script.threat === 'HIGH' ? 'text-orange-500' : 'text-zinc-600'
                                )}>{script.threat}</span>
                            </div>
                            <div className="text-[9px] text-zinc-600 truncate font-mono uppercase tracking-tight">{script.type}</div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-zinc-900 bg-black/20">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">System Entropy</span>
                    <span className="text-[9px] text-zinc-400 font-mono">1.24%</span>
                </div>
                <div className="h-4 flex items-end gap-1 px-1">
                   {[...Array(20)].map((_, i) => (
                       <motion.div 
                        key={i}
                        animate={{ height: [`${Math.random() * 100}%`, `${Math.random() * 100}%`] }}
                        transition={{ duration: 1 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                        className="flex-1 bg-zinc-800 rounded-t-sm"
                       />
                   ))}
                </div>
            </div>
        </div>

        {/* Right Detail */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background Dither Guy */}
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
                 <DitherShader 
                    src="https://images.unsplash.com/photo-1544256718-3bcf237f3974?q=80&w=2671&auto=format&fit=crop" 
                    gridSize={4}
                    ditherMode="bayer"
                    colorMode="duotone"
                    primaryColor="#000000"
                    secondaryColor="#a855f7"
                    animated
                 />
            </div>

            <div className="flex-1 p-12 relative z-10 flex flex-col gap-8">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 max-w-xl">
                         <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
                                Module_ID: {selectedScript.id}
                            </span>
                            <span className="text-zinc-700 font-mono text-[10px] break-all">RELAY_SHA_256: {Math.random().toString(36).substring(7).toUpperCase()}...</span>
                         </div>
                         <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase break-all">
                             {selectedScript.name}
                         </h1>
                         <p className="text-lg text-zinc-400 font-mono uppercase leading-relaxed max-w-lg">
                             {selectedScript.desc}
                         </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl backdrop-blur-xl flex flex-col items-center gap-4 min-w-[200px]">
                            <div className="relative">
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 border border-dashed border-zinc-800 rounded-full"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Fingerprint className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Status</div>
                                <div className="text-xl font-black italic tracking-tighter text-white">{selectedScript.status}</div>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsExecuting(true)}
                            disabled={selectedScript.status === 'LOCKED' || isExecuting}
                            className={cn(
                                "w-full py-6 rounded-3xl font-black italic tracking-tighter uppercase text-lg transition-all relative overflow-hidden",
                                selectedScript.status === 'LOCKED' 
                                    ? "bg-zinc-900 text-zinc-800 cursor-not-allowed border border-zinc-800" 
                                    : "bg-purple-600 text-white hover:bg-purple-500 shadow-[0_20px_40px_rgba(168,85,247,0.2)]"
                            )}
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                {isExecuting ? <Zap className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5" />}
                                {isExecuting ? 'EXECUTING...' : 'INIT_SEQUENCE'}
                            </span>
                            {isExecuting && (
                                <motion.div 
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "0%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="absolute inset-0 bg-white/20 z-0"
                                />
                            )}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 flex-1">
                    {[
                        { icon: Terminal, label: 'CLI_OVERRIDE', active: true },
                        { icon: Shield, label: 'ENCRYPTION_PASS', active: false },
                        { icon: Lock, label: 'ROOT_ACCESS', active: true },
                        { icon: Cpu, label: 'CORE_SYNC', active: true },
                        { icon: Search, label: 'SCAN_PHASE', active: true },
                        { icon: Bug, label: 'DEBUG_MODE', active: false },
                    ].map(feature => (
                        <div 
                            key={feature.label}
                            className={cn(
                                "border rounded-2xl p-6 flex flex-col gap-4 transition-all",
                                feature.active ? "bg-zinc-900/40 border-zinc-800" : "bg-black/40 border-zinc-900/50 opacity-40 grayscale"
                            )}
                        >
                            <feature.icon className={cn("w-5 h-5", feature.active ? "text-purple-400" : "text-zinc-600")} />
                            <div>
                                <h4 className="text-[10px] font-black tracking-widest uppercase text-zinc-300 mb-1">{feature.label}</h4>
                                <p className="text-[9px] text-zinc-600 uppercase font-mono">{feature.active ? 'Module Linked' : 'Module Off-air'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Terminal Bottom HUD */}
            <div className="h-12 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-8 flex items-center justify-between z-20">
                 <div className="flex items-center gap-6 text-[10px] font-mono text-zinc-600 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Relay_1: Online
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Relay_2: Online
                    </span>
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        Relay_3: Calibrating
                    </span>
                 </div>
                 <div className="text-[10px] text-zinc-800 font-mono italic">
                     SWARM_V_4.2.0_STABLE
                 </div>
            </div>
        </div>
    </div>
  );
};
