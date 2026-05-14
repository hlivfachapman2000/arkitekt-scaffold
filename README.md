# 🏗️ ARKITEKT UNIVERSAL PROJECT SCAFFOLD v3.1

> *"The impossible is just the possible that hasn't been tried."*

A filesystem-native, agent-swarm-ready project scaffold designed for the age of AI-assisted development.

---

## Quick Start

```bash
# 1. Bootstrap the entire structure
./INIT_PROJECT.sh MyAwesomeProject

# 2. Spawn your first agent
./10__SCRIPTS/INIT_AGENT.sh CODER "Senior Full-Stack Developer"
./10__SCRIPTS/INIT_AGENT.sh RESEARCHER "Deep Research Specialist"

# 3. Drop junk in 13__MISC/INBOX/ — auto-sorter runs hourly
# Or run it manually:
./10__SCRIPTS/auto_sort_misc.sh

# 4. Sync agent memories
./10__SCRIPTS/SYNC_MEMORY.sh

# 5. Update everything
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh
```

---

## Directory Structure

| Prefix | Purpose |
|--------|---------|
| `00__DOCUMENTATION/` | Project docs, specs, PRDs, ADRs |
| `01__FRONTEND/` | UI, client, web, mobile |
| `02__BACKEND/` | API, services, workers |
| `03__ASSETS/` | Images, fonts, media, raw files |
| `04__INFRASTRUCTURE/` | Docker, k8s, terraform, CI/CD |
| `05__AGENTS/` | 🤖 The swarm lives here |
| `06__KNOWLEDGE_VAULT/` | 📚 Shared wiki (Obsidian-compatible) |
| `07__MEMORY_SYSTEM/` | 🧠 Secondary persistence layer |
| `08__PROMPTS/` | 🎯 PromptFoo registry + templates |
| `09__RESEARCH/` | 🔬 AutoResearch loops, experiments |
| `10__SCRIPTS/` | Automation, setup, orchestration |
| `11__TOKENS/` | 💰 Token budgets, usage tracking |
| `12__CLI_HARNESSES/` | 🛠️ Agent CLI tool integrations |
| `13__MISC/` | 🗑️ Junk dump — auto-sorted to archive |
| `14__ARCHIVE/` | Old iterations, backups, deprecated |

---

## 🤖 Agent Architecture

Each agent gets a folder with "sacred files":

| File | Purpose |
|------|---------|
| `IDENTITY.md` | Public persona, name, version |
| `SOUL.md` | Core values, behavioral guardrails |
| `SKILLS.md` | Capabilities, tools, API boundaries |
| `MEMORY.md` | Verified long-term facts |
| `SCRATCHPAD.md` | Working memory, current task state |
| `KANBAN.md` | Task board: TODO → DOING → DONE |
| `HEARTBEAT.md` | Health status, performance metrics |
| `CLI_ASSIGNMENT.md` | Which CLI harness this agent uses |

Spawn with: `./10__SCRIPTS/INIT_AGENT.sh <NAME> <ROLE>`

---

## 🛠️ CLI Harnesses

Pre-configured harnesses for:
- **Claude Code** (Anthropic)
- **Codex** (OpenAI)
- **Gemini CLI** (Google)
- **Kimi Code** (Moonshot)
- **Hermes Agent** (Nous Research)
- **opencode** (placeholder)

Each harness includes project context, aliases, and swarm integration docs.

---

## 🧠 Memory System

Hybrid persistence:
- **Files**: Human-readable, Git-trackable, Obsidian-browsable
- **SQLite**: Fast structured queries, relationships
- **Qdrant**: Semantic search, similarity matching
- **OpenViking** (optional): ByteDance context DB with L0/L1/L2 tiered loading

---

## 🕸️ CLAW3D — Agent Communication Visualizer

```bash
# Parse logs and generate graph
python3 10__SCRIPTS/CLAW3D/visualizer.py

# Serve interactively
python3 10__SCRIPTS/CLAW3D/visualizer.py --serve --port 8080
```

Visualizes message flow between agents, bottlenecks, orphaned agents, and critical paths.

---

## 💰 Token Management

Budgets per project, agent, and CLI tool. Alerts at 80%, critical at 95%, hard stop at 100%.

---

## 🗑️ Auto-Sorter

Drop anything into `13__MISC/INBOX/`. The sorter organizes by file extension:
- Images → `03__ASSETS/images/`
- Code → `02__BACKEND/snippets/`
- Markdown → `06__KNOWLEDGE_VAULT/00__INBOX/`
- Secrets → `13__MISC/QUARANTINE/` (manual review required)

---

## ⚡ System Maintenance

```bash
# Custom granular update (default)
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh

# Or use Topgrade for simplicity
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh --topgrade
```

Updates Homebrew, npm, pip, cargo, gems, VS Code extensions, Docker images, and more.

---

## 🔌 Integrations

| Tool | Purpose | Config Location |
|------|---------|----------------|
| PromptFoo | Prompt testing & red teaming | `08__PROMPTS/PROMPTFOO_CONFIG/` |
| Qdrant | Vector DB for semantic memory | `07__MEMORY_SYSTEM/QDRANT/` |
| OpenViking | Context database (optional) | `07__MEMORY_SYSTEM/OPENVIKING/` |
| Obsidian | Knowledge vault browsing | `06__KNOWLEDGE_VAULT/` |
| Topgrade | Unified package manager | `10__SCRIPTS/SYSTEM_MAINTENANCE/` |

---

## Agentic Principles

1. Prefer simple over complex
2. Ask before assuming
3. Document everything in markdown
4. Respect creative chaos — organize it
5. If a skill applies, USE IT

---

*Touch the impossible.* ⚡
