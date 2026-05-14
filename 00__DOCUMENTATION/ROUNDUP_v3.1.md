# 🏗️ ARKITEKT UNIVERSAL PROJECT SCAFFOLD v3.1 — Release Roundup

> **Build Date:** 2026-05-14  
> **Commit:** `fdc5dc0`  
> **Files:** 107  
> **Insertions:** 5,836+ lines  
> **Status:** Production-ready scaffold

---

## 📦 What's Inside

A filesystem-native, agent-swarm-ready project scaffold designed for the age of AI-assisted development. Drop it anywhere, run `INIT_PROJECT.sh`, and spawn your first agent in 30 seconds.

---

## 📊 By The Numbers

| Metric | Count |
|--------|-------|
| Root directories | 14 (ALL CAPS) |
| Total files | 107 |
| Executable shell scripts | 28 |
| Python utilities | 6 |
| Markdown docs | ~65 |
| YAML/TOML configs | 12 |
| Pre-spawned system agents | 3 |
| Agent sacred files per agent | 8 |
| Maintenance update scripts | 20 |
| CLI harnesses | 6 |
| Superpowers skills | 7 |
| Docker services | 1 (Qdrant) |

---

## 🗂️ The 14 Root Directories

```
00__DOCUMENTATION/      — Project specs, PRDs, ADRs, this roundup
01__FRONTEND/           — UI, client, web, mobile
02__BACKEND/            — API, services, workers, data
03__ASSETS/             — Images, fonts, media, raw files
04__INFRASTRUCTURE/     — Docker, k8s, terraform, CI/CD
05__AGENTS/             — 🤖 The swarm lives here
06__KNOWLEDGE_VAULT/    — 📚 Obsidian-compatible shared brain
07__MEMORY_SYSTEM/      — 🧠 SQLite + Qdrant + OpenViking bridge
08__PROMPTS/            — 🎯 PromptFoo registry + redteam config
09__RESEARCH/           — 🔬 Karpathy-style autoresearch loops
10__SCRIPTS/            — ⚡ Automation, setup, orchestration
11__TOKENS/             — 💰 Token budgets, burn tracking, alerts
12__CLI_HARNESSES/      — 🛠️ Claude, Codex, Gemini, Kimi, Hermes, opencode
13__MISC/               — 🗑️ Junk dump — auto-sorted to archive
14__ARCHIVE/            — 🪦 Old iterations, backups, deprecated
```

---

## 🤖 Agent Swarm Architecture

### System Agents (Pre-Spawned)

| Agent | Role | Files |
|-------|------|-------|
| `_ORCHESTRATOR` | Routes tasks, monitors health | 8 sacred files |
| `_CRITIC` | Quality gate, enforces standards | 8 sacred files |
| `_MEMORY_KEEPER` | Cross-agent memory sync | 8 sacred files |

### The Eight Sacred Files

Every agent carries these canonical files:

1. **`IDENTITY.md`** — Public persona, name, version, comms style
2. **`SOUL.md`** — Core values, behavioral guardrails, decision principles
3. **`SKILLS.md`** — Capabilities, tools, API boundaries
4. **`MEMORY.md`** — Verified long-term facts, learned lessons
5. **`SCRATCHPAD.md`** — Ephemeral working state (wiped per-task)
6. **`KANBAN.md`** — Backlog → Doing → Review → Done
7. **`HEARTBEAT.md`** — Health status, performance metrics
8. **`CLI_ASSIGNMENT.md`** — Which CLI harness this agent uses

**Spawn a new agent:**
```bash
./10__SCRIPTS/INIT_AGENT.sh CODER "Senior Full-Stack Developer"
```

---

## ⚡ System Maintenance Engine

20 scripts to keep your entire development environment sharp:

| Script | What It Updates |
|--------|----------------|
| `UPDATE_ALL.sh` | **Master script** — runs everything |
| `UPDATE_BREW.sh` | Homebrew formulas + casks + doctor |
| `UPDATE_NPM.sh` | npm itself + global packages |
| `UPDATE_PIP.sh` | Python pip + outdated packages |
| `UPDATE_CARGO.sh` | Rust Cargo crates |
| `UPDATE_GEM.sh` | Ruby gems |
| `UPDATE_MAS.sh` | Mac App Store apps |
| `UPDATE_VSCODE.sh` | VS Code extensions |
| `UPDATE_MACOS.sh` | macOS system software |
| `UPDATE_DOCKER.sh` | Docker images + prune |
| `UPDATE_OHMYZSH.sh` | Oh My Zsh framework |
| `UPDATE_FISH.sh` | Fisher / OMF plugins |
| `UPDATE_NVM.sh` | NVM Node LTS install |
| `UPDATE_FNM.sh` | FNM Node LTS install |
| `UPDATE_RUSTUP.sh` | Rustup toolchains |
| `UPDATE_PYENV.sh` | Pyenv + latest Python |
| `UPDATE_TOPGRADE.sh` | Wrapper for topgrade |
| `topgrade.toml` | Arkitekt config for topgrade |
| `com.arkitekt.system-maintenance.plist` | macOS launchd auto-scheduler |
| `README.md` | Full maintenance docs |

**Run everything:**
```bash
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh
```

---

## 🛠️ CLI Harnesses

Pre-configured harnesses for every major AI CLI tool:

| Harness | Tool | Aliases |
|---------|------|---------|
| `CLAUDE_CODE/` | Anthropic Claude Code | `ccd`, `ccd-review` |
| `CODEX/` | OpenAI Codex | `cx`, `cx-cloud`, `cx-review` |
| `GEMINI_CLI/` | Google Gemini | `gcli` |
| `KIMI_CODE/` | Moonshot Kimi | `kimi` |
| `HERMES_AGENT/` | Nous Research Hermes | `hermes`, `hermes-dashboard` |
| `OPENCODE/` | opencode | `ocode` |

Plus `_SHARED/context_sync.py` and `_SHARED/token_router.py` for cross-CLI consistency.

---

## 🧠 Memory System

Hybrid triad: files for humans, SQLite for structure, Qdrant for semantics.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| File-based | Markdown in `05__AGENTS/` | Human-readable, Git-trackable |
| Structured | SQLite (`schema.sql`) | Fast queries, relationships |
| Vector | Qdrant (`docker-compose.qdrant.yml`) | Semantic search, similarity |
| Context DB | OpenViking (`ov.conf`) | Optional L0/L1/L2 tiered loading |

**Sync everything:**
```bash
./10__SCRIPTS/SYNC_MEMORY.sh
```

---

## 📚 Knowledge Vault

Obsidian-native, wikilink-powered, frontmatter-structured:

```
06__KNOWLEDGE_VAULT/
├── 00__INBOX/          — Fleeting notes
├── 01__SOURCES/        — Articles, books, meeting notes, web crawls
├── 02__CONCEPTS/       — Evergreen atomic ideas
├── 03__PROJECTS/       — Active & completed project knowledge
├── 04__PEOPLE/         — Team, stakeholders, contacts
├── 05__DECISIONS/      — ADRs with rationale
├── 06__PROCESSES/      — Runbooks, SOPs
├── 07__TEMPLATES/      — Note templates
└── 99__META/           — Vault constitution & broken link reports
```

Every note carries frontmatter:
```yaml
---
title: "Note Title"
created: 2026-05-14
updated: 2026-05-14
tags: [concept, backend, agent-swarm]
status: seedling | budding | evergreen
source: "URL or reference"
agents: [agent_name, agent_name]
---
```

---

## 🎯 Prompt Registry

PromptFoo-native declarative prompt management:

```
08__PROMPTS/
├── PROMPTFOO_CONFIG/     — Global, redteam, CI configs
├── REGISTRY/             — Version-controlled prompts (system, user, few-shot)
├── TESTS/                — Regression, redteam, eval suites
├── VERSIONS/             — Git-tracked prompt versions with changelogs
├── SHARED_FRAGMENTS/     — Reusable identity/soul/constraints components
└── CLI_ADAPTERS/         — Per-CLI prompt tuning
```

Built-in red teaming: PII detection, prompt injection, jailbreak scanning.

---

## 🔬 Research Engine

Karpathy-style autoresearch adapted for general agent work:

- `program.md` — Human writes the research goal
- Agent proposes change → runs 5-min experiment → measures metric
- Verdict: **KEEP** / **ROLLBACK** / **ITERATE**
- Full git audit trail on `exp/YYYY-MM-DD__topic` branches

Safety: immutable files protected, _CRITIC approval required before merge.

---

## 💰 Token Budgets

Financial governance for agent swarms:

```
11__TOKENS/
├── BUDGETS/         — Project, per-agent, per-task allocations
├── TRACKING/          — Usage logs (timestamp, model, tokens, cost)
├── ALERTS/            — 80% warning, 95% critical, 100% hard stop
├── OPTIMIZATION/      — Compression strategies, model routing
└── REPORTS/           — Monthly spend analysis
```

Auto-registered when spawning agents via `INIT_AGENT.sh`.

---

## 🗑️ MISC Auto-Sorter

The sanctioned junk dump. Drop anything into `13__MISC/INBOX/`:

- Images → `03__ASSETS/images/`
- Code → `02__BACKEND/snippets/`
- Markdown → `06__KNOWLEDGE_VAULT/00__INBOX/`
- **Secrets** (`.pem`, `.key`, `.env`) → `13__MISC/QUARANTINE/` 🔒

Run manually or schedule via cron:
```bash
./10__SCRIPTS/auto_sort_misc.sh
```

---

## 🕸️ CLAW3D Visualizer

D3.js-powered agent communication graph:

- Edge thickness = message frequency
- Edge color = token burn rate
- Red nodes = orphaned agents
- Green paths = orchestrator → worker → critic loops

```bash
python3 10__SCRIPTS/CLAW3D/visualizer.py --serve --port 8080
```

---

## 🐳 Docker Stack

```bash
# Start Qdrant vector DB
docker compose up -d qdrant

# Optional: SQLite web inspector (uncomment in docker-compose.yml)
# docker compose up -d sqlite-web
```

---

## 🔐 Security Highlights

- `.gitignore` pre-configured for secrets, embeddings, session logs
- Secret-pattern quarantine in MISC sorter
- Agent guardrails in `SOUL.md`: no auto-rewrite of identities, no prod deploys from experiments
- `_CRITIC` approval gate for all merges

---

## 🚀 Quick Start (30 Seconds)

```bash
# 1. Bootstrap a new project
./INIT_PROJECT.sh MyAwesomeProject

# 2. Spawn your first agent
./10__SCRIPTS/INIT_AGENT.sh CODER "Senior Full-Stack Developer"

# 3. Update everything
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh

# 4. Start Qdrant
docker compose up -d qdrant

# 5. Open Knowledge Vault in Obsidian
#    (point it at 06__KNOWLEDGE_VAULT/)
```

---

## 📁 Deliverables

| File | Location | Purpose |
|------|----------|---------|
| Zip archive | `~/Desktop/ARKITEKT_SCAFFOLD_v3.1.zip` | Portable backup (~118K) |
| Git repo | `/Users/sanpopin/Desktop/FS` | Full version control |
| Deep overview | `00__DOCUMENTATION/DEEP_SYSTEM_OVERVIEW.md` | Canonical reference |
| GitHub guide | `GITHUB_SETUP.md` | Push instructions |
| This roundup | `00__DOCUMENTATION/ROUNDUP_v3.1.md` | Release notes |

---

## 🧬 Philosophy

1. **Prefer simple over complex**
2. **Ask before assuming**
3. **Document everything in markdown**
4. **Respect creative chaos — organize it**
5. **If a skill applies, USE IT**

---

*Built with relentless curiosity.* ⚡  
*Touch the impossible.* 🌈
