import React, { useState } from 'react';
import { TerminalSquare, Download, CheckCircle2, Loader2, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const CLIS = [
  { id: 'claude', name: 'Claude Code', version: 'v1.4.2', description: 'Anthropic native developer CLI', installed: true },
  { id: 'codex', name: 'OpenAI Codex', version: 'v2.1.0', description: 'OpenAI background computer use harness', installed: true },
  { id: 'gemini', name: 'Gemini CLI', version: 'v0.9.8', description: 'Google Cloud SDK integrated tools', installed: false },
  { id: 'hermes', name: 'Hermes Agent', version: 'v3.0.1', description: 'Nous Research agentic workflow', installed: true },
  { id: 'kimi', name: 'Kimi Code', version: 'v1.1.0', description: 'Moonshot long-context developer CLI', installed: false },
];

export const CliHarnessView = () => {
  const [installingAll, setInstallingAll] = useState(false);
  const [installedClis, setInstalledClis] = useState(CLIS.map(c => c.installed));

  const handleInstallAll = async () => {
    setInstallingAll(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setInstalledClis(CLIS.map(() => true));
    setInstallingAll(false);
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Top Bar for CLI management */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {CLIS.map((cli, idx) => (
            <div key={cli.id} className="flex items-center gap-2 px-3 py-1.5 rounded bg-zinc-900/80 border border-zinc-800 shrink-0">
              <div className={cn(
                "w-2 h-2 rounded-full",
                installedClis[idx] ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-700"
              )} />
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider">{cli.name}</span>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleInstallAll}
          disabled={installingAll}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded font-bold text-[10px] uppercase tracking-widest transition-all shrink-0 ml-4",
            installingAll 
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
              : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30"
          )}
        >
          {installingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          {installingAll ? 'PROVISIONING' : 'PROVISION ALL'}
        </button>
      </div>

      {/* Massive Main Terminal Area */}
      <div className="flex-1 p-6 font-mono text-sm overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="space-y-1">
            <p className="text-zinc-600">Arkitekt Framework [Version 3.1.22]</p>
            <p className="text-zinc-600">(c) 2026 Arkitekt Corp. All rights reserved.</p>
          </div>

          <div className="space-y-1 pt-4">
            <div className="flex gap-2">
              <span className="text-purple-400">system@arkitekt:</span>
              <span className="text-blue-400">~</span>
              <span className="text-white">$</span>
              <span className="text-zinc-100">arkitekt-swarm --status</span>
            </div>
            <p className="text-zinc-400 pl-4">[ORCH] Cluster initialized on 12 nodes.</p>
            <p className="text-zinc-400 pl-4">[CRIT] Hardcore level set to 50%.</p>
            <p className="text-zinc-400 pl-4">[MEM] Connected to SQLite local-fs and Qdrant cluster.</p>
          </div>

          <div className="space-y-1 pt-2">
             <div className="flex gap-2 text-yellow-500/80">
              <span>[WARNING]</span>
              <span>Memory vault "Karpachy-Wiki" is out of sync. Re-indexing required.</span>
            </div>
          </div>

          <div className="space-y-1 pt-4">
            <div className="flex gap-2">
              <span className="text-purple-400">system@arkitekt:</span>
              <span className="text-blue-400">~</span>
              <span className="text-white">$</span>
              <span className="text-zinc-100">arkitekt provision --all-clis</span>
            </div>
            <p className="text-zinc-500 pl-4">Verifying environment for Python 3.11... <span className="text-green-500">OK</span></p>
            <p className="text-zinc-500 pl-4">Checking Node.js v20.12.0... <span className="text-green-500">OK</span></p>
            <p className="text-zinc-500 pl-4">Provisioning Claude Code native harness... <span className="text-green-500">SUCCESS</span></p>
            <p className="text-zinc-500 pl-4">Connecting OpenAI Codex compute pipeline... <span className="text-green-500">SUCCESS</span></p>
            <p className="text-zinc-500 pl-4">Initializing Hermes workflow... <span className="text-green-500">SUCCESS</span></p>
          </div>

          <div className="space-y-1 pt-4">
            <div className="flex gap-2">
              <span className="text-purple-400">system@arkitekt:</span>
              <span className="text-blue-400">~</span>
              <span className="text-white">$</span>
              <span className="text-zinc-100 underline decoration-purple-500/50 underline-offset-4 animate-pulse">_</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Footer Info */}
      <div className="h-8 border-t border-zinc-900 bg-zinc-950/80 px-4 flex items-center justify-between text-[9px] font-mono text-zinc-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span>LOCAL: 127.0.0.1</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
             <span>VPN: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4 uppercase tracking-tighter">
          <span>UTF-8</span>
          <span>Ln 42, Col 12</span>
          <span className="text-purple-500 font-bold">Arkitekt-Shell</span>
        </div>
      </div>
    </div>
  );
};
