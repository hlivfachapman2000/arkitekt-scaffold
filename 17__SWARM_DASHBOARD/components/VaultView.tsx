import React from 'react';
import { ShieldCheck, Lock, Globe, Zap, Database, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const VAULT_ITEMS = [
  { id: '1', title: 'Swarm Governance Protocol', type: 'Rules', date: '2026-05-12', size: '124kb', status: 'Locked' },
  { id: '2', title: 'Karpachy Wiki - Neural Maps', type: 'Knowledge', date: '2026-05-14', size: '2.4MB', status: 'Active' },
  { id: '3', title: 'Arkitekt v4 Blueprint', type: 'Design', date: '2026-05-14', size: '890kb', status: 'Draft' },
  { id: '4', title: 'Cross-Agent Sync Logic', type: 'Code', date: '2026-05-10', size: '45kb', status: 'Locked' },
];

export const VaultView = () => {
  return (
    <div className="p-8 h-full overflow-y-auto bg-transparent">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b-2 border-dashed border-purple-500/30 pb-6">
          <div>
            <h2 className="text-3xl font-mono font-black italic flex items-center gap-3 text-white uppercase tracking-tighter">
              <ShieldCheck className="w-8 h-8 text-purple-500" />
              KNOWLEDGE_VAULT
            </h2>
            <p className="text-zinc-500 mt-2 font-mono text-xs uppercase tracking-widest">[ACCESS_LEVEL: COMPLEMENTARY_OVERRIDE]</p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-purple-400 transition-colors" />
              <input 
                type="text" 
                placeholder="SEARCH_VAULT..." 
                className="bg-black border border-zinc-800 rounded-none pl-10 pr-4 py-2 text-[10px] font-mono focus:outline-none focus:border-purple-500/50 w-64 transition-all"
              />
            </div>
            <button className="px-6 py-2 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/50 rounded-none text-[10px] font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(168,85,247,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              INDEX_NEW_DATA
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-black border border-zinc-800 rounded-none overflow-hidden hover:border-zinc-700 transition-colors">
              <table className="w-full text-left font-mono">
                <thead className="bg-zinc-900/50 text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-black border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-5">ASSET_IDENTIFIER</th>
                    <th className="px-6 py-5">CLASS</th>
                    <th className="px-6 py-5">TIMESTAMP</th>
                    <th className="px-6 py-5 text-right">ENCRYPTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {VAULT_ITEMS.map((item, idx) => (
                    <motion.tr 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-purple-500/5 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                           <div className="w-8 h-8 flex items-center justify-center bg-zinc-900 border border-zinc-800 group-hover:border-purple-500/50 transition-colors">
                            <Globe className="w-4 h-4 text-zinc-600 group-hover:text-purple-400" />
                           </div>
                           <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight">{item.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] text-zinc-500 border border-zinc-800 px-2 py-0.5 bg-zinc-950">{item.type}</span>
                      </td>
                      <td className="px-6 py-5 text-[10px] text-zinc-600">{item.date} <span className="opacity-30">[{item.size}]</span></td>
                      <td className="px-6 py-5 text-right">
                        <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter text-zinc-500 group-hover:text-green-500 transition-colors">
                          <Lock className="w-3 h-3" />
                          {item.status}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 border border-dashed border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div>
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Assets Indexed</h4>
                  <p className="text-2xl font-mono font-black text-white">42,069</p>
                </div>
                <Database className="w-8 h-8 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
              </div>
              <div className="p-6 border border-dashed border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition-colors">
                <div>
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Swarm Sync Health</h4>
                  <p className="text-2xl font-mono font-black text-green-500">OPTIMAL</p>
                </div>
                <Zap className="w-8 h-8 text-zinc-800 group-hover:text-green-900 transition-colors" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-black border border-purple-500/20 rounded-none p-6 space-y-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-t-2 border-t-purple-500">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400 flex items-center gap-2">
                <Zap className="w-4 h-4" /> SYNC_PROTO_V4
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-500 tracking-widest">
                    <span>INDEXING_BUFFER</span>
                    <span className="text-purple-400">94.82%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-900 rounded-none overflow-hidden flex p-[1px] border border-zinc-800">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '94%' }}
                      className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>HOST_01</span>
                    <span className="text-green-500">[SECURE]</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span>NODE_ALPHA</span>
                    <span className="text-green-500">[SECURE]</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-700">
                    <span>COLD_SYNC</span>
                    <span>[STANDBY]</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-800 rounded-none p-6 text-center space-y-6 border-b-2 border-b-blue-500">
               <div className="w-16 h-16 bg-black border border-zinc-800 mx-auto flex items-center justify-center">
                <Database className="w-8 h-8 text-zinc-700" />
               </div>
               <div className="space-y-2">
                 <h4 className="font-black text-zinc-300 text-xs uppercase tracking-widest">REMOTE_BURST_SYNC</h4>
                 <p className="text-[9px] text-zinc-500 leading-relaxed font-mono">ENCRYPTED_TUNNEL: IPFS // AWS_S3_E2EE</p>
               </div>
               <button className="w-full py-3 bg-transparent border border-zinc-800 hover:border-blue-500 hover:text-blue-400 text-zinc-500 rounded-none text-[9px] font-black uppercase tracking-[0.2em] transition-all">
                 INIT_EXTERNAL_SYNC
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
