import { cn } from '../lib/utils';
import React from 'react';
import { motion } from 'framer-motion';
import { TerminalSquare, Key, Database, Cpu, ShieldCheck, Share2, Eye, EyeOff } from 'lucide-react';

export const Settings = () => {
  const [showSecrets, setShowSecrets] = React.useState(false);

  return (
    <div className="p-8 max-w-5xl max-h-full overflow-y-auto bg-zinc-950">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">System Config</h2>
          <p className="text-zinc-500 text-sm">Fine-tune the neural fabric and external integrations.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-zinc-800 rounded-lg text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-200 transition-colors">Export .env</button>
           <button className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20">Apply Changes</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            Neural Secrets (.env Context)
          </h3>
          <div className="space-y-3">
             <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 relative overflow-hidden group">
               <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Global Secret Keys</div>
                  <button 
                    onClick={() => setShowSecrets(!showSecrets)}
                    className="text-zinc-500 hover:text-zinc-200"
                  >
                    {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
               </div>

               <div className="space-y-3 font-mono text-[11px]">
                  {[
                    { key: 'OPENAI_API_KEY', val: 'sk-proj-4f9k...9sL' },
                    { key: 'ANTHROPIC_API_KEY', val: 'sk-ant-api03...91Z' },
                    { key: 'GOOGLE_API_KEY', val: 'g-ai-studio-...xt1' },
                    { key: 'QDRANT_HOST', val: 'https://qdrant.arkitekt.internal' },
                  ].map(secret => (
                    <div key={secret.key} className="flex flex-col gap-1 border-b border-zinc-800/50 pb-2">
                      <span className="text-zinc-500">{secret.key}</span>
                      <span className={cn(
                        "transition-all duration-300",
                        showSecrets ? "text-blue-400" : "text-zinc-800 blur-[2px] select-none"
                      )}>
                        {showSecrets ? secret.val : '•••••••••••••••••••••••••••••'}
                      </span>
                    </div>
                  ))}
               </div>
               
               <p className="text-[10px] text-zinc-600 bg-black/50 p-2 rounded border border-zinc-800/50 leading-relaxed italic">
                 Note: These keys are shared across all compute nodes in the Arkitekt cluster and automatically synchronized with the host .env on save.
               </p>
             </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
            <Share2 className="w-4 h-4 text-blue-500" />
            MCP Connection Mesh
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Memory_MCP', type: 'Local', status: 'Connected', port: '3001' },
              { name: 'Browser_MCP', type: 'Container', status: 'Connected', port: '3002' },
              { name: 'Files_MCP', type: 'Host', status: 'Standby', port: '3003' },
              { name: 'Github_MCP', type: 'Bridge', status: 'Connected', port: '4444' },
            ].map(mcp => (
              <div key={mcp.name} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4">
                   <div className={cn(
                     "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs",
                     mcp.status === 'Connected' ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "bg-zinc-800 text-zinc-500"
                   )}>
                      {mcp.name.charAt(0)}
                   </div>
                   <div>
                      <div className="font-bold text-sm text-zinc-200">{mcp.name}</div>
                      <div className="text-[10px] text-zinc-500 font-mono tracking-tighter uppercase">{mcp.type} • PORT {mcp.port}</div>
                   </div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 rounded-full text-zinc-500">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", mcp.status === 'Connected' ? "bg-green-500" : "bg-zinc-700")} />
                    {mcp.status}
                </div>
              </div>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-600 text-xs font-bold uppercase tracking-[0.2em] hover:text-blue-400 hover:border-blue-500/30 transition-all">
              + Connect New Protocol
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
            <Cpu className="w-4 h-4 text-green-500" />
            Infrastructure Engine
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
             <div className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-300">File Server Indexer</h4>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                   <motion.div animate={{ width: '65%' }} className="h-full bg-green-500" />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>65,432 files indexed</span>
                  <span>65% Complete</span>
                </div>
             </div>
             <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
               <div>
                 <div className="text-xs font-bold text-zinc-300">OpenRouter Routing</div>
                 <div className="text-[10px] text-zinc-600 font-mono italic">Smart fallback: GPT-4o &rarr; Claude 3.5 Sonnet</div>
               </div>
               <button className="px-3 py-1 bg-zinc-800 text-[10px] font-bold rounded-lg border border-zinc-700">EDIT FLOW</button>
             </div>
          </div>
        </section>
        
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-zinc-500 border-b border-zinc-900 pb-2">
            <Database className="w-4 h-4 text-orange-500" />
            Persistence Layer
          </h3>
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
               <Database className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <div className="font-bold text-zinc-200">Database Visualization</div>
               <p className="text-[10px] text-zinc-500 leading-tight">Enhanced DB visualization engine (Amazing Mode: ON)</p>
            </div>
            <button className="px-4 py-2 bg-orange-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-orange-900/20">VISUALIZE</button>
          </div>
        </section>
      </div>
    </div>
  );
};
