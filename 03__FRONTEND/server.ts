/**
 * SITK.FS Dashboard Server
 * Express HTTP + WebSocket PTY bridge for agentic CLI harnesses
 */
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as pty from 'node-pty';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// FS project root (one level up from 03__FRONTEND/)
const ROOT = path.resolve(__dirname, '..');
const AGENTS_DIR = path.join(ROOT, '05__AGENTS');
const SCRIPTS_DIR = path.join(ROOT, '10__SCRIPTS');

const PORT = parseInt(process.env.PORT || '3001', 10);

// ─── Harness definitions ─────────────────────────────────────────────────────
const HARNESS_COMMANDS: Record<string, { cmd: string; args: string[] }> = {
  CLAUDE_CODE:   { cmd: 'claude',       args: [] },
  CODEX:         { cmd: 'codex',        args: [] },
  GEMINI_CLI:    { cmd: 'gemini',       args: [] },
  KIMI_CODE:     { cmd: 'kimi-code',   args: [] },
  HERMES_AGENT:  { cmd: 'hermes-agent', args: [] },
  OPENCODE:      { cmd: 'opencode',     args: [] },
  BASH:          { cmd: process.env.SHELL || '/bin/zsh', args: [] },
};

// ─── Express app ─────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist/client')));
}

// ── List agents ───────────────────────────────────────────────────────────────
app.get('/api/agents', (_req, res) => {
  try {
    const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    const all = entries
      .filter(e => e.isDirectory())
      .map(e => {
        const hbPath   = path.join(AGENTS_DIR, e.name, 'HEARTBEAT.md');
        const idPath   = path.join(AGENTS_DIR, e.name, 'IDENTITY.md');
        const cliPath  = path.join(AGENTS_DIR, e.name, 'CLI_ASSIGNMENT.md');

        let status = 'unknown', role = '', harness = '';

        if (fs.existsSync(hbPath)) {
          const c = fs.readFileSync(hbPath, 'utf-8');
          status = c.match(/^status:\s*(\S+)/m)?.[1] ?? 'unknown';
        }
        if (fs.existsSync(idPath)) {
          const c = fs.readFileSync(idPath, 'utf-8');
          role = c.match(/^role:\s*(.+)/m)?.[1]?.trim() ?? '';
        }
        if (fs.existsSync(cliPath)) {
          const c = fs.readFileSync(cliPath, 'utf-8');
          harness = c.match(/\*\*CLI Tool\*\*:\s*(.+)/)?.[1]?.trim() ?? '';
        }

        return { name: e.name, status, role, harness, core: e.name.startsWith('_') };
      });

    res.json({ agents: all });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Spawn agent ───────────────────────────────────────────────────────────────
app.post('/api/agents', (req, res) => {
  const { name, role } = req.body as { name?: string; role?: string };
  if (!name) return res.status(400).json({ error: 'name is required' });

  const script = path.join(SCRIPTS_DIR, 'INIT_AGENT.sh');
  execFile('bash', [script, name.toUpperCase(), role ?? 'Agent'], { cwd: ROOT }, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: err.message, stderr });
    res.json({ success: true, output: stdout });
  });
});

// ── Kanban aggregator ─────────────────────────────────────────────────────────
app.get('/api/kanban', (_req, res) => {
  const tasks: object[] = [];
  const SECTION_STATUS: Record<string, string> = {
    Backlog: 'backlog', Doing: 'doing', Review: 'review', Done: 'done',
  };

  try {
    const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const kp = path.join(AGENTS_DIR, entry.name, 'KANBAN.md');
      if (!fs.existsSync(kp)) continue;

      const content = fs.readFileSync(kp, 'utf-8');
      for (const [heading, statusKey] of Object.entries(SECTION_STATUS)) {
        const match = content.match(new RegExp(`## ${heading}([\\s\\S]*?)(?=##|$)`));
        if (!match) continue;
        const items = match[1].match(/^- \[.?\] .+/gm) ?? [];
        for (const item of items) {
          const done = /^- \[x\]/i.test(item);
          const title = item.replace(/^- \[.?\] /, '').trim();
          if (!title) continue;
          tasks.push({
            id: `${entry.name}-${title.slice(0, 24).replace(/\W+/g, '-')}`,
            title,
            agent: entry.name.replace(/^AGENT__/, '').replace(/^_/, ''),
            status: done && statusKey === 'backlog' ? 'done' : statusKey,
            priority: title.toLowerCase().includes('critical') ? 'high'
              : title.toLowerCase().includes('review') ? 'medium' : 'low',
          });
        }
      }
    }
    res.json({ tasks });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── Heartbeat aggregator ──────────────────────────────────────────────────────
app.get('/api/heartbeat', (_req, res) => {
  const nodes: object[] = [];
  try {
    const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const hbPath = path.join(AGENTS_DIR, entry.name, 'HEARTBEAT.md');
      if (!fs.existsSync(hbPath)) continue;

      const c = fs.readFileSync(hbPath, 'utf-8');
      nodes.push({
        name:       entry.name.replace(/^AGENT__/, '').replace(/^_/, ''),
        status:     c.match(/^status:\s*(\S+)/m)?.[1] ?? 'unknown',
        lastActive: c.match(/^last_active:\s*(.+)/m)?.[1]?.trim() ?? '',
        load:       c.match(/Current Load[:\s*]+(\S+)/m)?.[1] ?? 'idle',
        sessions:   parseInt(c.match(/Session Count[:\s*]+(\d+)/m)?.[1] ?? '0', 10),
      });
    }
    res.json({ nodes, timestamp: new Date().toISOString() });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ── System stats ──────────────────────────────────────────────────────────────
app.get('/api/stats', (_req, res) => {
  try {
    const entries = fs.readdirSync(AGENTS_DIR, { withFileTypes: true });
    const agentDirs = entries.filter(e => e.isDirectory());
    let healthy = 0;

    for (const e of agentDirs) {
      const hb = path.join(AGENTS_DIR, e.name, 'HEARTBEAT.md');
      if (fs.existsSync(hb)) {
        const c = fs.readFileSync(hb, 'utf-8');
        if (/^status:\s*healthy/m.test(c)) healthy++;
      }
    }

    res.json({
      totalAgents: agentDirs.length,
      healthyAgents: healthy,
      uptime: Math.floor(process.uptime()),
      harnesses: Object.keys(HARNESS_COMMANDS).length,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── HTTP Server + WebSocket ──────────────────────────────────────────────────
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  if (url.pathname !== '/ws/terminal') {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    const harness = url.searchParams.get('harness') ?? 'BASH';
    const cols    = parseInt(url.searchParams.get('cols') ?? '220', 10);
    const rows    = parseInt(url.searchParams.get('rows') ?? '50', 10);

    const harnessConfig = HARNESS_COMMANDS[harness] ?? HARNESS_COMMANDS.BASH;
    let proc: pty.IPty;

    const spawnFallback = (reason: string) => {
      proc = pty.spawn(process.env.SHELL ?? '/bin/zsh', [], {
        name: 'xterm-256color', cols, rows, cwd: ROOT,
        env: { ...process.env as Record<string, string>, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
      });
      const msg = `\r\n\x1b[33m⚠  ${reason} — opening shell instead\x1b[0m\r\n\r\n`;
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    };

    try {
      proc = pty.spawn(harnessConfig.cmd, harnessConfig.args, {
        name: 'xterm-256color', cols, rows, cwd: ROOT,
        env: { ...process.env as Record<string, string>, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
      });
    } catch {
      spawnFallback(`'${harnessConfig.cmd}' not found`);
    }

    proc!.onData(data => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data);
    });

    proc!.onExit(({ exitCode }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`\r\n\x1b[90m[process exited with code ${exitCode}]\x1b[0m\r\n`);
        ws.close();
      }
    });

    ws.on('message', (raw) => {
      const msg = raw.toString();
      try {
        const parsed = JSON.parse(msg);
        if (parsed.type === 'resize' && parsed.cols && parsed.rows) {
          proc!.resize(Math.max(1, parsed.cols), Math.max(1, parsed.rows));
        }
      } catch {
        proc!.write(msg);
      }
    });

    ws.on('close', () => {
      try { proc!.kill(); } catch { /* already dead */ }
    });

    ws.on('error', () => {
      try { proc!.kill(); } catch { /* already dead */ }
    });
  });
});

server.listen(PORT, () => {
  console.log(`\x1b[32m✓\x1b[0m SITK.FS server →  http://localhost:${PORT}`);
  console.log(`\x1b[32m✓\x1b[0m PTY harnesses  →  ${Object.keys(HARNESS_COMMANDS).join(', ')}`);
});
