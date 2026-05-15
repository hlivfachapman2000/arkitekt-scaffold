"use client";
import React from "react";
import { motion } from "framer-motion";
import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft, Shield, Zap, CircleDollarSign, Activity, Wallet, History } from "lucide-react";
import { cn } from "../lib/utils";
import { DitherShader } from "./ui/dither-shader";
import { CanvasText } from "./ui/canvas-text";

const TRANSACTIONS = [
  { id: '1', agent: 'NEURAL_LINK_01', type: 'COMPUTE_BURN', amount: -1450, status: 'CONFIRMED', date: '2026-05-14 20:44' },
  { id: '2', agent: 'SWARM_GOV', type: 'TREASURY_MINT', amount: 50000, status: 'CONFIRMED', date: '2026-05-14 18:22' },
  { id: '3', agent: 'CLI_OVERRIDE', type: 'API_STAKE', amount: -250, status: 'PENDING', date: '2026-05-14 15:10' },
  { id: '4', agent: 'OSINT_KALI', type: 'REWARD', amount: 1200, status: 'CONFIRMED', date: '2026-05-14 12:05' },
];

export const TokensView = () => {
  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col font-mono selection:bg-yellow-500/30 overflow-hidden">
        {/* Top Header Section */}
        <div className="h-1/2 p-8 flex gap-8 relative overflow-hidden shrink-0">
            {/* Background Dither Guy - Cryptic Trader */}
            <div className="absolute top-0 right-0 w-1/2 h-full z-0 opacity-20 pointer-events-none grayscale">
                 <DitherShader 
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop" 
                    gridSize={4}
                    ditherMode="halftone"
                    colorMode="duotone"
                    primaryColor="#000000"
                    secondaryColor="#eab308"
                    animated
                 />
            </div>

            <div className="flex-1 flex flex-col justify-between relative z-10">
                <div className="space-y-4">
                    <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3 text-white">
                        <Coins className="w-8 h-8 text-yellow-500" />
                        <CanvasText text="TOKEN_ECONOMY" backgroundClassName="bg-zinc-950" colors={["#eab308", "#facc15"]} />
                    </h2>
                    <p className="text-zinc-500 text-xs uppercase tracking-[0.2em] font-bold max-w-sm">
                        Arkitekt Swarm algorithmic credit system. Real-time compute valuation balancing.
                    </p>
                </div>

                <div className="flex gap-12">
                     <div className="space-y-1">
                        <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Global Balance</div>
                        <div className="text-5xl font-black italic tracking-tighter text-white">4,281,092 <span className="text-lg text-yellow-500 font-mono not-italic uppercase tracking-normal">ARK</span></div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">24h Volume</div>
                        <div className="text-2xl font-black italic tracking-tighter text-white">+12.4%</div>
                        <div className="text-[9px] text-green-500 flex items-center gap-1 font-bold"><TrendingUp className="w-3 h-3" /> Bullish Stance</div>
                     </div>
                </div>
            </div>

            <div className="w-80 flex flex-col gap-4 relative z-10">
                 <div className="flex-1 bg-yellow-500/5 border border-yellow-500/20 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <Wallet className="w-5 h-5 text-yellow-500" />
                        <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Linked Wallet</span>
                    </div>
                    <div className="space-y-2">
                        <div className="text-2xl font-black text-white italic tracking-tighter">0x4F...E821</div>
                        <div className="text-[9px] text-zinc-600 font-mono break-all italic uppercase">[AUTHENTICATED_VIA_NEURAL_SIGNATURE]</div>
                    </div>
                 </div>
                 <button className="h-16 bg-zinc-100 text-zinc-950 rounded-3xl font-black italic tracking-tighter uppercase text-sm hover:bg-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
                    Withdrawal_Request
                 </button>
            </div>
        </div>

        {/* Bottom Section - Transactions & Stats */}
        <div className="flex-1 p-8 grid grid-cols-3 gap-8 overflow-hidden">
             <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
                <div className="flex items-center justify-between px-2">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <History className="w-3 h-3 text-zinc-500" /> Recent Ledgers
                    </h4>
                    <span className="text-[9px] text-zinc-700 font-mono">Last updated: 32s ago</span>
                </div>
                <div className="flex-1 bg-zinc-900/30 border border-zinc-900 rounded-3xl overflow-hidden flex flex-col">
                    <div className="grid grid-cols-4 p-4 border-b border-zinc-900 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                        <span>Initiator</span>
                        <span>Request Type</span>
                        <span className="text-right">Value</span>
                        <span className="text-right">Status</span>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {TRANSACTIONS.map((tx, i) => (
                            <div key={tx.id} className="grid grid-cols-4 p-4 border-b border-zinc-900/50 hover:bg-white/5 transition-colors cursor-crosshair">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 shrink-0">
                                        <CircleDollarSign className={cn("w-4 h-4", tx.amount > 0 ? "text-green-500" : "text-red-500")} />
                                    </div>
                                    <span className="text-[10px] font-bold text-zinc-300 tracking-tighter">{tx.agent}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="text-[10px] text-zinc-500 font-mono">{tx.type}</span>
                                </div>
                                <div className="flex items-center justify-end">
                                    <span className={cn(
                                        "text-xs font-black italic tracking-tighter",
                                        tx.amount > 0 ? "text-green-400" : "text-zinc-200"
                                    )}>
                                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center justify-end gap-2">
                                     <span className={cn(
                                         "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded border",
                                         tx.status === 'CONFIRMED' ? "text-green-500 border-green-500/20" : "text-yellow-500 border-yellow-500/20 animate-pulse"
                                     )}>{tx.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>

             <div className="flex flex-col gap-6">
                 <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col gap-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 text-yellow-500" /> Compute Marketplace
                    </h4>
                    <div className="space-y-3">
                        {[
                            { label: 'CPU_CORE_H', price: '42 ARK', delta: '+2%' },
                            { label: 'GPU_VRAM_GB', price: '128 ARK', delta: '-1%' },
                            { label: 'V_DB_QUERY', price: '0.5 ARK', delta: '0%' },
                        ].map(item => (
                            <div key={item.label} className="flex items-center justify-between p-3 bg-black/40 border border-zinc-900 rounded-xl">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase">{item.label}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-white">{item.price}</span>
                                    <span className={cn("text-[8px] font-bold", item.delta.startsWith('+') ? 'text-green-500' : 'text-red-500')}>{item.delta}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>

                 <div className="flex-1 bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl flex flex-col justify-between group overflow-hidden relative">
                    {/* Tiny Dither Overlay for intensity */}
                    <div className="absolute inset-0 z-0 opacity-10 grayscale hover:opacity-20 transition-opacity">
                        <DitherShader 
                            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2664&auto=format&fit=crop" 
                            gridSize={2}
                            ditherMode="noise"
                            colorMode="duotone"
                            primaryColor="#000000"
                            secondaryColor="#fbbf24"
                        />
                    </div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3 h-3 text-zinc-500" /> Economic Guard
                        </h4>
                        <div className="space-y-4">
                            <div className="text-3xl font-black italic tracking-tighter text-white uppercase break-all">Anti_Inflationary_Lock</div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-mono italic">
                                Swarm tokens are dynamically burnt during high-frequency compute cycles to maintain value stability...
                            </p>
                        </div>
                        <button className="mt-4 px-4 py-2 bg-zinc-800 text-[10px] text-zinc-300 font-black uppercase tracking-widest rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-all">
                            View_Audit_Log
                        </button>
                    </div>
                 </div>
             </div>
        </div>
    </div>
  );
};
