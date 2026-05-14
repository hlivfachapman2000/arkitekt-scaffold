/**
 * TerminalView — xterm.js terminals connected to backend PTY sessions
 * Each tab maps to one of the 12__CLI_HARNESSES; WS bridge in server.ts
 *
 * Multi-tab strategy: all terminal containers stay in the DOM (never
 * unmounted) so xterm.js always has a real element. Inactive tabs are
 * hidden with CSS. FitAddon + ResizeObserver handle sizing.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain, Code2, Zap, Bot, Cpu, Terminal as TermIcon, Plus, X,
  Maximize2, RefreshCw,
} from 'lucide-react';

// ─── Harness catalogue ───────────────────────────────────────────────────────
interface Harness {
  id: string;
  label: string;
  cmd: string;
  icon: React.ElementType;
  color: string;
}

const HARNESSES: Harness[] = [
  { id: 'BASH',         label: 'Shell',     cmd: 'shell',       icon: TermIcon, color: '#94a3b8' },
  { id: 'CLAUDE_CODE',  label: 'Claude',    cmd: 'claude',      icon: Brain,    color: '#a78bfa' },
  { id: 'CODEX',        label: 'Codex',     cmd: 'codex',       icon: Code2,    color: '#34d399' },
  { id: 'GEMINI_CLI',   label: 'Gemini',    cmd: 'gemini',      icon: Zap,      color: '#60a5fa' },
  { id: 'KIMI_CODE',    label: 'Kimi',      cmd: 'kimi-code',   icon: Bot,      color: '#f97316' },
  { id: 'HERMES_AGENT', label: 'Hermes',    cmd: 'hermes',      icon: Cpu,      color: '#f59e0b' },
  { id: 'OPENCODE',     label: 'OpenCode',  cmd: 'opencode',    icon: TermIcon, color: '#e879f9' },
];

// ─── xterm.js theme ──────────────────────────────────────────────────────────
const XTERM_THEME = {
  background:    '#080808',
  foreground:    '#d4d4d4',
  black:         '#1a1a1a',
  red:           '#ef4444',
  green:         '#22c55e',
  yellow:        '#f59e0b',
  blue:          '#3b82f6',
  magenta:       '#a78bfa',
  cyan:          '#06b6d4',
  white:         '#d4d4d4',
  brightBlack:   '#404040',
  brightRed:     '#f87171',
  brightGreen:   '#4ade80',
  brightYellow:  '#fbbf24',
  brightBlue:    '#60a5fa',
  brightMagenta: '#c4b5fd',
  brightCyan:    '#22d3ee',
  brightWhite:   '#f5f5f5',
  cursor:        '#ffffff',
  cursorAccent:  '#000000',
  selectionBackground: '#ffffff22',
};

// ─── Session ─────────────────────────────────────────────────────────────────
interface Session {
  id: string;          // unique per tab instance
  harness: Harness;
  terminal: XTerm;
  fitAddon: FitAddon;
  ws: WebSocket | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  connected: boolean;
}

let sessionSeq = 0;
const makeSessionId = () => `sess-${++sessionSeq}`;

function buildWsUrl(harness: Harness, cols: number, rows: number): string {
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host  = window.location.host;
  return `${proto}://${host}/ws/terminal?harness=${harness.id}&cols=${cols}&rows=${rows}`;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function TerminalView() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const sessionsRef             = useRef<Session[]>([]);

  sessionsRef.current = sessions;

  // ── Open a new terminal tab ───────────────────────────────────────────────
  const openTab = useCallback((harness: Harness) => {
    const id  = makeSessionId();
    const ctr = React.createRef<HTMLDivElement | null>();

    const term = new XTerm({
      theme: XTERM_THEME,
      fontFamily: '"IBM Plex Mono", "Fira Code", monospace',
      fontSize: 13,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      scrollback: 5000,
      allowTransparency: false,
      convertEol: true,
    });

    const fit   = new FitAddon();
    const links = new WebLinksAddon();
    term.loadAddon(fit);
    term.loadAddon(links);

    const sess: Session = {
      id, harness, terminal: term, fitAddon: fit,
      ws: null, containerRef: ctr, connected: false,
    };

    setSessions(prev => [...prev, sess]);
    setActiveId(id);

    return id;
  }, []);

  // ── Connect WS once the container div is in the DOM ──────────────────────
  const connectSession = useCallback((sess: Session) => {
    if (!sess.containerRef.current || sess.connected) return;

    sess.terminal.open(sess.containerRef.current!);

    // Short delay so the container has layout before fit
    requestAnimationFrame(() => {
      try { sess.fitAddon.fit(); } catch { /* container not ready yet */ }
      const dims = sess.fitAddon.proposeDimensions();
      const cols = dims?.cols ?? 220;
      const rows = dims?.rows ?? 50;

      const ws = new WebSocket(buildWsUrl(sess.harness, cols, rows));
      sess.ws = ws;

      ws.onopen = () => {
        sess.terminal.write('\x1b[?25h'); // ensure cursor visible
      };

      ws.onmessage = (evt) => {
        if (typeof evt.data === 'string') {
          sess.terminal.write(evt.data);
        } else {
          evt.data.text().then((t: string) => sess.terminal.write(t));
        }
      };

      ws.onclose = () => {
        sess.terminal.write('\r\n\x1b[90m[connection closed]\x1b[0m\r\n');
      };

      ws.onerror = () => {
        sess.terminal.write('\r\n\x1b[31m[WebSocket error — is the server running?]\x1b[0m\r\n');
      };

      // Keyboard → PTY
      sess.terminal.onData(data => {
        if (ws.readyState === WebSocket.OPEN) ws.send(data);
      });

      // Resize → PTY
      sess.terminal.onResize(({ cols, rows }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'resize', cols, rows }));
        }
      });

      // Mark connected so we don't double-init
      setSessions(prev =>
        prev.map(s => s.id === sess.id ? { ...s, ws, connected: true } : s)
      );
    });
  }, []);

  // ── When active tab changes, fit the terminal ─────────────────────────────
  useEffect(() => {
    if (!activeId) return;
    const sess = sessionsRef.current.find(s => s.id === activeId);
    if (!sess) return;

    // If not yet connected (container just became visible), connect now
    if (!sess.connected && sess.containerRef.current) {
      connectSession(sess);
      return;
    }

    // Already connected — just re-fit
    requestAnimationFrame(() => {
      try { sess.fitAddon.fit(); } catch { /* ignore */ }
    });
  }, [activeId, connectSession]);

  // ── ResizeObserver on the active terminal container ───────────────────────
  useEffect(() => {
    if (!activeId) return;
    const sess = sessionsRef.current.find(s => s.id === activeId);
    if (!sess?.containerRef.current) return;

    const observer = new ResizeObserver(() => {
      try { sess.fitAddon.fit(); } catch { /* ignore */ }
    });
    observer.observe(sess.containerRef.current);
    return () => observer.disconnect();
  }, [activeId]);

  // ── Connect newly added sessions once their container mounts ─────────────
  // We need a small helper that fires after the DOM update
  const [pendingConnect, setPendingConnect] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingConnect) return;
    const sess = sessionsRef.current.find(s => s.id === pendingConnect);
    if (sess && sess.containerRef.current && !sess.connected) {
      connectSession(sess);
    }
    setPendingConnect(null);
  }, [pendingConnect, connectSession]);

  // Trigger pending connect after sessions state updates
  useEffect(() => {
    const unconnected = sessions.find(s => !s.connected && s.id === activeId);
    if (unconnected) setPendingConnect(unconnected.id);
  }, [sessions, activeId]);

  // ── Close a tab ───────────────────────────────────────────────────────────
  const closeTab = useCallback((id: string) => {
    const sess = sessionsRef.current.find(s => s.id === id);
    if (sess) {
      try { sess.ws?.close(); } catch { /* ignore */ }
      sess.terminal.dispose();
    }
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (activeId === id) {
        setActiveId(next[next.length - 1]?.id ?? null);
      }
      return next;
    });
  }, [activeId]);

  // ── Reconnect (restart PTY) ───────────────────────────────────────────────
  const reconnect = useCallback((id: string) => {
    const sess = sessionsRef.current.find(s => s.id === id);
    if (!sess) return;
    try { sess.ws?.close(); } catch { /* ignore */ }
    sess.terminal.reset();
    sess.terminal.write('\x1b[90m[reconnecting…]\x1b[0m\r\n');
    // Mark as disconnected so connectSession will re-run
    setSessions(prev =>
      prev.map(s => s.id === id ? { ...s, ws: null, connected: false } : s)
    );
    setPendingConnect(id);
  }, []);

  // ── Harness picker strip ──────────────────────────────────────────────────
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#050505]">
      {/* Tab bar */}
      <div className="flex items-center border-b border-[#1a1a1a] bg-[#0a0a0a] shrink-0 overflow-x-auto">
        {sessions.map(sess => {
          const H = sess.harness;
          const active = sess.id === activeId;
          return (
            <button
              key={sess.id}
              onClick={() => setActiveId(sess.id)}
              className={`flex items-center gap-2 px-4 py-2.5 border-r border-[#1a1a1a] shrink-0 group transition-colors ${
                active ? 'bg-[#111] text-white' : 'text-[#555] hover:text-[#888] hover:bg-[#0f0f0f]'
              }`}
            >
              <H.icon
                className="w-3.5 h-3.5 shrink-0"
                style={{ color: active ? H.color : undefined }}
              />
              <span className="text-[11px] font-mono">{H.label}</span>
              <span
                onClick={e => { e.stopPropagation(); closeTab(sess.id); }}
                className="ml-1 opacity-0 group-hover:opacity-100 hover:text-[#ef4444] transition-opacity cursor-pointer"
              >
                <X className="w-3 h-3" />
              </span>
            </button>
          );
        })}

        {/* New tab button */}
        <div className="relative">
          <button
            onClick={() => setPickerOpen(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2.5 text-[#444] hover:text-[#888] transition-colors"
            title="Open new terminal"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute top-full left-0 mt-1 z-50 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl shadow-2xl p-2 min-w-[180px]"
              >
                {HARNESSES.map(h => (
                  <button
                    key={h.id}
                    onClick={() => {
                      openTab(h);
                      setPickerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1a] transition-colors text-left"
                  >
                    <h.icon className="w-3.5 h-3.5 shrink-0" style={{ color: h.color }} />
                    <div>
                      <div className="text-[11px] font-mono text-[#ccc]">{h.label}</div>
                      <div className="text-[9px] text-[#444]">{h.cmd}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active tab controls */}
        {activeId && (
          <div className="ml-auto flex items-center gap-1 pr-3">
            <button
              onClick={() => reconnect(activeId)}
              title="Reconnect"
              className="p-1.5 text-[#444] hover:text-[#888] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                const sess = sessionsRef.current.find(s => s.id === activeId);
                sess?.fitAddon.fit();
              }}
              title="Fit terminal"
              className="p-1.5 text-[#444] hover:text-[#888] transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Terminal panes — all rendered, active one shown */}
      <div className="flex-1 relative overflow-hidden">
        {sessions.length === 0 && (
          <EmptyState onOpen={() => { openTab(HARNESSES[0]); }} />
        )}
        {sessions.map(sess => (
          <div
            key={sess.id}
            className="absolute inset-0 p-2"
            style={{ display: sess.id === activeId ? 'block' : 'none' }}
          >
            <div
              ref={sess.containerRef}
              className="w-full h-full xterm-container"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
      <div className="space-y-2">
        <div className="w-12 h-12 border border-[#2a2a2a] rounded-xl flex items-center justify-center mx-auto">
          <TermIcon className="w-6 h-6 text-[#333]" />
        </div>
        <h3 className="text-sm font-mono text-[#555]">No terminal open</h3>
        <p className="text-[10px] text-[#333] max-w-xs">
          Open a harness terminal to interact with your agentic CLI tools
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {HARNESSES.map(h => (
          <button
            key={h.id}
            onClick={onOpen}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#0f0f0f] transition-colors"
          >
            <h.icon className="w-4 h-4" style={{ color: h.color }} />
            <span className="text-[9px] font-mono text-[#555]">{h.label}</span>
          </button>
        ))}
      </div>

      <p className="text-[9px] font-mono text-[#2a2a2a]">
        click any harness — or use the + tab above
      </p>
    </div>
  );
}
