/**
 * TelemetryView — adapted from SITK.DEV-AGENTIC-FOUNDATION
 * Reads live heartbeat data from /api/heartbeat every 5s
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart, Wifi, WifiOff, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Node {
  name: string;
  status: string;
  lastActive: string;
  load: string;
  sessions: number;
}

interface LogEntry {
  ts: string;
  msg: string;
  type: 'info' | 'warn' | 'ok';
}

const STATUS_DOT: Record<string, string> = {
  healthy: '#22c55e',
  idle:    '#f59e0b',
  unknown: '#6b7280',
  error:   '#ef4444',
};

const LOAD_COLORS: Record<string, string> = {
  idle:   '#3a3a3a',
  low:    '#22c55e',
  medium: '#f59e0b',
  high:   '#ef4444',
};

export function TelemetryView() {
  const [nodes, setNodes]       = useState<Node[]>([]);
  const [log, setLog]           = useState<LogEntry[]>([]);
  const [lastTs, setLastTs]     = useState('');
  const logRef                  = useRef<HTMLDivElement>(null);

  const pushLog = (nodes: Node[]) => {
    const ts = new Date().toISOString().slice(11, 23);
    const entries: LogEntry[] = nodes.map(n => ({
      ts,
      msg: `Heartbeat from ${n.name.padEnd(16)} — ${n.status.toUpperCase()} | load: ${n.load}`,
      type: n.status === 'healthy' ? 'ok' : n.status === 'error' ? 'warn' : 'info',
    }));
    setLog(prev => [...prev.slice(-60), ...entries]);
    setLastTs(ts);
  };

  const poll = () => {
    fetch('/api/heartbeat')
      .then(r => r.json())
      .then(d => {
        const fetched: Node[] = d.nodes ?? [];
        setNodes(fetched);
        if (fetched.length) pushLog(fetched);
      })
      .catch(() => {
        setLog(prev => [...prev.slice(-60), {
          ts: new Date().toISOString().slice(11, 23),
          msg: 'Server unreachable — retrying…',
          type: 'warn',
        }]);
      });
  };

  useEffect(() => {
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const barData = nodes.map(n => ({
    name: n.name.slice(0, 8),
    sessions: n.sessions,
  }));

  return (
    <div className="h-full overflow-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Node status cards */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-3">
          Agent Heartbeats
        </h3>
        {nodes.map(node => (
          <motion.div
            key={node.name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full shrink-0 animate-pulse"
                  style={{ background: STATUS_DOT[node.status] ?? '#6b7280' }}
                />
                <span className="text-[11px] font-mono text-[#aaa]">{node.name}</span>
              </div>
              <span
                className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded"
                style={{
                  color: STATUS_DOT[node.status] ?? '#6b7280',
                  background: `${STATUS_DOT[node.status] ?? '#6b7280'}15`,
                }}
              >
                {node.status}
              </span>
            </div>

            {/* Load bar */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[8px] font-mono text-[#444] w-8">Load</span>
              <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: node.load === 'idle' ? '5%'
                      : node.load === 'low' ? '30%'
                      : node.load === 'medium' ? '60%' : '90%',
                    background: LOAD_COLORS[node.load] ?? '#3a3a3a',
                  }}
                />
              </div>
              <span className="text-[8px] font-mono text-[#444] w-10 text-right">{node.load}</span>
            </div>
          </motion.div>
        ))}
        {nodes.length === 0 && (
          <div className="text-[10px] font-mono text-[#333] text-center py-10">
            Polling heartbeats…
          </div>
        )}
      </div>

      {/* Chart + log */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Session count bar chart */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
          <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#555] mb-3">
            Session Count per Agent
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fill: '#333', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0a0a0a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 10 }}
                itemStyle={{ color: '#a78bfa' }}
                labelStyle={{ color: '#555' }}
              />
              <Bar dataKey="sessions" fill="#a78bfa" radius={[3, 3, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live log */}
        <div className="flex-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-[#ef4444]" />
              <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#555]">
                Live Heartbeat Log
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#444]">
              {lastTs ? (
                <><Wifi className="w-3 h-3 text-[#22c55e]" />{lastTs}</>
              ) : (
                <><WifiOff className="w-3 h-3 text-[#555]" />waiting</>
              )}
            </div>
          </div>

          <div
            ref={logRef}
            className="flex-1 overflow-y-auto space-y-0.5 font-mono text-[10px] leading-relaxed"
          >
            {log.map((entry, i) => (
              <div
                key={i}
                className="flex gap-3 hover:bg-[#111] px-1 rounded transition-colors"
              >
                <span className="text-[#333] shrink-0 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {entry.ts}
                </span>
                <span
                  style={{
                    color: entry.type === 'ok' ? '#22c55e'
                      : entry.type === 'warn' ? '#f59e0b' : '#555',
                  }}
                >
                  {entry.msg}
                </span>
              </div>
            ))}
            {log.length === 0 && (
              <div className="text-[#333] pt-4">Waiting for first heartbeat poll…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
