/**
 * AgentCreator — adapted from SITK.DEV-AGENTIC-FOUNDATION
 * Spawns new agents via /api/agents → INIT_AGENT.sh
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Shield, Code2, Brain, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface Template {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  role: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'General-purpose task execution',
    icon: Cpu,
    color: '#a78bfa',
    role: 'General Purpose Agent',
  },
  {
    id: 'sniper',
    label: 'Sniper',
    description: 'High-precision, specific targets',
    icon: Shield,
    color: '#ef4444',
    role: 'Precision Task Specialist',
  },
  {
    id: 'researcher',
    label: 'Researcher',
    description: 'Deep knowledge retrieval',
    icon: Brain,
    color: '#60a5fa',
    role: 'Research and Knowledge Agent',
  },
  {
    id: 'coder',
    label: 'Coder',
    description: 'Architecture and implementation',
    icon: Code2,
    color: '#34d399',
    role: 'Senior Full-Stack Developer',
  },
];

export function AgentCreator() {
  const [name, setName]         = useState('');
  const [role, setRole]         = useState('');
  const [template, setTemplate] = useState<string>('standard');
  const [spawning, setSpawning] = useState(false);
  const [result, setResult]     = useState<{ ok: boolean; msg: string } | null>(null);
  const [output, setOutput]     = useState('');

  const selectedTemplate = TEMPLATES.find(t => t.id === template)!;

  const handleSpawn = async () => {
    if (!name.trim()) return;
    setSpawning(true);
    setResult(null);
    setOutput('');

    const effectiveRole = role.trim() || selectedTemplate.role;

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role: effectiveRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult({ ok: true, msg: 'Neural Handshake Established' });
        setOutput(data.output ?? '');
        setName('');
        setRole('');
      } else {
        setResult({ ok: false, msg: data.error ?? 'Spawn failed' });
      }
    } catch {
      setResult({ ok: false, msg: 'Cannot reach server' });
    } finally {
      setSpawning(false);
    }
  };

  return (
    <div className="h-full overflow-auto p-6 flex justify-center">
      <div className="w-full max-w-2xl space-y-5">
        <div>
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-[#555]">Laboratory</h2>
          <p className="text-xs text-[#444] mt-1">Synthesize a new agent into the swarm</p>
        </div>

        {/* Template selector */}
        <div className="grid grid-cols-2 gap-3">
          {TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                template === t.id
                  ? 'border-[#333] bg-[#111]'
                  : 'border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2a2a2a]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <t.icon className="w-4 h-4" style={{ color: template === t.id ? t.color : '#444' }} />
                <span className="text-[11px] font-mono font-medium" style={{ color: template === t.id ? t.color : '#666' }}>
                  {t.label}
                </span>
              </div>
              <p className="text-[9px] text-[#444]">{t.description}</p>
            </button>
          ))}
        </div>

        {/* Identity fields */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 space-y-4">
          <div>
            <label className="text-[9px] font-mono uppercase text-[#444] block mb-1.5">
              Agent Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value.replace(/[^A-Za-z0-9_]/g, ''))}
              placeholder="e.g. CODER, ANALYST, SCOUT"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs font-mono text-[#ccc] placeholder:text-[#333] focus:outline-none focus:border-[#444] transition-colors uppercase"
            />
            <p className="text-[9px] text-[#333] mt-1">alphanumeric + underscore only — will be uppercased</p>
          </div>

          <div>
            <label className="text-[9px] font-mono uppercase text-[#444] block mb-1.5">
              Role Override
              <span className="ml-2 text-[#333]">(optional — defaults to template role)</span>
            </label>
            <input
              value={role}
              onChange={e => setRole(e.target.value)}
              placeholder={selectedTemplate.role}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-xs font-mono text-[#ccc] placeholder:text-[#333] focus:outline-none focus:border-[#444] transition-colors"
            />
          </div>
        </div>

        {/* Spawn button */}
        <button
          onClick={handleSpawn}
          disabled={!name.trim() || spawning}
          className={`w-full py-3 rounded-xl font-mono text-sm font-medium transition-all ${
            result?.ok
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-white text-black hover:bg-[#e0e0e0] disabled:bg-[#1a1a1a] disabled:text-[#444] disabled:cursor-not-allowed'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {result?.ok ? (
              <><CheckCircle className="w-4 h-4" />{result.msg}</>
            ) : spawning ? (
              <><Zap className="w-4 h-4 animate-pulse" />Synthesizing Agent…</>
            ) : (
              <><Zap className="w-4 h-4" />Spawn Agent</>
            )}
          </div>
        </button>

        {/* Error */}
        <AnimatePresence>
          {result && !result.ok && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-[11px] font-mono text-[#ef4444] bg-[#ef444410] border border-[#ef444430] rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {result.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shell output */}
        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#050505] border border-[#1a1a1a] rounded-xl p-4"
            >
              <h4 className="text-[9px] font-mono uppercase text-[#444] mb-2">Shell Output</h4>
              <pre className="text-[10px] font-mono text-[#666] leading-relaxed whitespace-pre-wrap overflow-auto max-h-56">
                {output}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
