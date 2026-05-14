/**
 * DashboardHome — adapted from SITK.DEV-AGENTIC-FOUNDATION
 * Reads live agent data from /api/agents and /api/stats
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Cpu, Shield, Clock, Zap } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

interface Agent {
  name: string;
  status: string;
  role: string;
  harness: string;
  core: boolean;
}

interface Stats {
  totalAgents: number;
  healthyAgents: number;
  uptime: number;
  harnesses: number;
}

const DUMMY_TRAFFIC = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  tokens: Math.floor(Math.random() * 4000 + 500),
}));

const STATUS_COLOR: Record<string, string> = {
  healthy: '#22c55e',
  idle:    '#f59e0b',
  unknown: '#6b7280',
  error:   '#ef4444',
};

export function DashboardHome() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats]   = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/agents')
      .then(r => r.json())
      .then(d => setAgents(d.agents ?? []))
      .catch(() => {});

    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const core   = agents.filter(a => a.core);
  const custom = agents.filter(a => !a.core);

  const statCards = [
    {
      label: 'Active Agents',
      value: stats?.totalAgents ?? agents.length,
      icon: Cpu,
      glow: '#a78bfa',
    },
    {
      label: 'Healthy',
      value: stats?.healthyAgents ?? core.length,
      icon: Shield,
      glow: '#22c55e',
    },
    {
      label: 'CLI Harnesses',
      value: stats?.harnesses ?? 6,
      icon: Zap,
      glow: '#60a5fa',
    },
    {
      label: 'Uptime (s)',
      value: stats?.uptime ?? '—',
      icon: Clock,
      glow: '#f59e0b',
    },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase text-[#555]">{card.label}</span>
              <card.icon className="w-4 h-4" style={{ color: card.glow }} />
            </div>
            <div
              className="text-3xl font-bold font-mono"
              style={{ textShadow: `0 0 20px ${card.glow}55` }}
            >
              {card.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Neural traffic chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#555]">
              Token Traffic — 24h
            </h3>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#a78bfa]" />
              <span className="text-[9px] font-mono text-[#555]">Inference Frequency</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DUMMY_TRAFFIC} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="tokenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fill: '#333', fontSize: 9, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fill: '#333', fontSize: 9, fontFamily: 'monospace' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: '#a78bfa' }}
                labelStyle={{ color: '#555' }}
              />
              <Area
                type="monotone"
                dataKey="tokens"
                stroke="#a78bfa"
                strokeWidth={1.5}
                fill="url(#tokenGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Agent roster */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 flex flex-col"
        >
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#555] mb-4">
            Agent Roster
          </h3>
          <div className="space-y-2 flex-1 overflow-auto">
            {[...core, ...custom].map(agent => (
              <div
                key={agent.name}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-[#111] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-colors"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: STATUS_COLOR[agent.status] ?? '#6b7280',
                    boxShadow: `0 0 6px ${STATUS_COLOR[agent.status] ?? '#6b7280'}`,
                  }}
                />
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-[#ccc] truncate">
                    {agent.name.replace(/^_/, '')}
                    {agent.core && (
                      <span className="ml-1.5 text-[8px] text-[#555] uppercase">core</span>
                    )}
                  </div>
                  {agent.role && (
                    <div className="text-[9px] text-[#444] truncate">{agent.role}</div>
                  )}
                </div>
              </div>
            ))}
            {agents.length === 0 && (
              <div className="text-[10px] text-[#444] font-mono text-center py-8">
                Loading agents…
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
