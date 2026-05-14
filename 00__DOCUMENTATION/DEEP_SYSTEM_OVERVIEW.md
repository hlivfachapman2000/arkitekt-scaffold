# 🏗️ ARKITEKT UNIVERSAL PROJECT SCAFFOLD v3.1
## Deep System Overview

> *"The impossible is just the possible that hasn't been tried."*

This document is the canonical reference for the Arkitekt filesystem-native, agent-swarm-ready project scaffold. It describes every directory, every file, every interaction pattern, and the philosophy that binds them.

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [The 14 Root Directories](#2-the-14-root-directories)
3. [Agent Swarm Architecture](#3-agent-swarm-architecture)
4. [Memory System](#4-memory-system)
5. [Knowledge Vault](#5-knowledge-vault)
6. [Prompt Registry](#6-prompt-registry)
7. [Research Engine](#7-research-engine)
8. [Token Budget Management](#8-token-budget-management)
9. [CLI Harnesses](#9-cli-harnesses)
10. [System Maintenance Engine](#10-system-maintenance-engine)
11. [MISC Auto-Sorter](#11-misc-auto-sorter)
12. [CLAW3D Visualizer](#12-claw3d-visualizer)
13. [Docker Compose Stack](#13-docker-compose-stack)
14. [Bootstrap & Agent Lifecycle](#14-bootstrap--agent-lifecycle)
15. [Integration Map](#15-integration-map)
16. [Security Model](#16-security-model)
17. [Extension Points](#17-extension-points)

---

## 1. Design Philosophy

Arkitekt is built on five immutable principles:

1. **Prefer simple over complex** — Every abstraction must earn its keep.
2. **Ask before assuming** — Agents must not rewrite identity files or make irreversible decisions without human review.
3. **Document everything in markdown** — Human-readable, Git-trackable, Obsidian-browsable. Memory IS documentation.
4. **Respect creative chaos — organize it** — The `13__MISC/INBOX/` is a sanctioned dumping ground. Rules, not discipline, keep it clean.
5. **If a skill applies, USE IT** — The "1% rule" from obra/superpowers: if a shared skill has even a slim chance of relevance, auto-trigger it.

---

## 2. The 14 Root Directories

| Prefix | Name | Purpose | Human/Agent Ownership |
|--------|------|---------|----------------------|
| `00__` | DOCUMENTATION | Project specs, PRDs, ADRs, system overviews | Human writes, agents read |
| `01__` | FRONTEND | UI, client, web, mobile code | Human + agents |
| `02__` | BACKEND | API, services, workers, data pipelines | Human + agents |
| `03__` | ASSETS | Images, fonts, media, raw files | Human drops, auto-sorter organizes |
| `04__` | INFRASTRUCTURE | Docker, k8s, terraform, CI/CD configs | Human + agents |
| `05__` | AGENTS | 🤖 The swarm lives here | Agents own, humans review |
| `06__` | KNOWLEDGE_VAULT | 📚 Shared wiki (Obsidian-native) | Human + agents co-write |
| `07__` | MEMORY_SYSTEM | 🧠 Secondary persistence (DB + vector) | Agents write, humans audit |
| `08__` | PROMPTS | 🎯 PromptFoo registry + templates | Human curates, agents consume |
| `09__` | RESEARCH | 🔬 AutoResearch loops, experiments | Agents run, humans define goals |
| `10__` | SCRIPTS | Automation, setup, orchestration | Human writes, agents invoke |
| `11__` | TOKENS | 💰 Token budgets, usage tracking | Agents report, humans set budgets |
| `12__` | CLI_HARNESSES | 🛠️ Per-CLI tool configs and aliases | Human configures once |
| `13__` | MISC | 🗑️ Junk dump — auto-sorted to archive | Human drops, robot sorts |
| `14__` | ARCHIVE | Old iterations, backups, deprecated | Auto-rotated, human purges |

### Naming Convention

- **Double underscore `__`** separates the numeric prefix from the semantic name.
- **Numeric prefix `00–14`** enforces filesystem sort order. Documentation always comes first; archive always last.
- **ALL CAPS** for directory names ensures visual distinction from code folders and prevents accidental collisions with package-manager directories.

---

## 3. Agent Swarm Architecture

### 3.1 Directory Layout

```
05__AGENTS/
├── _ORCHESTRATOR/              # Meta-agent: routes, delegates, monitors
├── _CRITIC/                    # Quality gate: reviews, standards, guardrails
├── _MEMORY_KEEPER/             # Manages cross-agent memory sync
├── _SUPERPOWERS/               # Shared skills library (obra/superpowers style)
│   ├── SKILLS/
│   │   ├── BRAINSTORMING.md
│   │   ├── TDD.md
│   │   ├── WRITING_PLANS.md
│   │   ├── SUBAGENT_DEV.md
│   │   ├── SYSTEMATIC_DEBUG.md
│   │   ├── GIT_WORKTREES.md
│   │   └── WRITING_SKILLS.md
│   └── MARKETPLACE/            # External skills (obra/superpowers-marketplace)
├── _COMMUNICATION_LOGS/        # Inter-agent message bus logs
│   └── YYYY-MM-DD/
│       ├── agent_A_to_agent_B.md
│       └── broadcast_events.md
├── _PROTOCOLS/                 # Message formats (A2A, MCP, custom)
├── _SANDBOX/                   # Isolated execution for risky operations
└── AGENT__{NAME}/              # One folder per spawned agent
    ├── IDENTITY.md
    ├── SOUL.md
    ├── SKILLS.md
    ├── MEMORY.md
    ├── SCRATCHPAD.md
    ├── KANBAN.md
    ├── HEARTBEAT.md
    ├── CLI_ASSIGNMENT.md
    ├── TOOLS/
    ├── SCRIPTS/
    └── MEMORY_ARCHIVE/
        └── YYYY-MM-DD.md
```

### 3.2 The Eight Sacred Files

Every agent, including system agents, carries eight canonical files. They are loaded in tiered priority:

| File | Purpose | Loaded When | Approx. Tokens |
|------|---------|-------------|----------------|
| `IDENTITY.md` | Public persona, name, version, comms style | Every session bootstrap | ~200 |
| `SOUL.md` | Core values, decision principles, behavioral guardrails | Every session — this is the agent's character | ~300 |
| `SKILLS.md` | Tool definitions, API schemas, capability boundaries | On skill invocation (modular load) | ~500 |
| `MEMORY.md` | Verified facts, learned lessons, user preferences | Every session + before context compression | ~1k–2k |
| `SCRATCHPAD.md` | Current task context, temporary working state | Per-task, cleared on completion | ~500 |
| `KANBAN.md` | Task tracking: Backlog → Doing → Review → Done | Every planning cycle | ~200 |
| `HEARTBEAT.md` | Session metadata, last active, performance metrics | Health checks | ~100 |
| `CLI_ASSIGNMENT.md` | Which CLI harness this agent uses, fallback chain | When routing a task to an agent | ~150 |

**Lifecycle:**
1. `INIT_AGENT.sh` generates all eight files from templates.
2. Human reviews `IDENTITY.md` and `SOUL.md` before first activation.
3. Agent populates `SKILLS.md`, `MEMORY.md`, and `KANBAN.md` during work.
4. `SCRATCHPAD.md` is ephemeral — wiped after every task.
5. `HEARTBEAT.md` is updated by the `_ORCHESTRATOR` health-check loop.
6. `CLI_ASSIGNMENT.md` is updated when the agent is reassigned to a different CLI tool.

### 3.3 System Agents (Pre-Spawned)

Three meta-agents are created by `INIT_PROJECT.sh` and never deleted:

#### `_ORCHESTRATOR`
- **Role:** Meta-agent. Routes tasks, delegates to workers, monitors health.
- **Skills:** Swarm routing, conflict resolution, task decomposition.
- **Reads:** All `HEARTBEAT.md` files, all `KANBAN.md` files.
- **Writes:** `_COMMUNICATION_LOGS/`, broadcasts to all agents.

#### `_CRITIC`
- **Role:** Quality gate. Reviews output before merge, enforces standards.
- **Skills:** Code review, prompt injection detection, ADR validation.
- **Reads:** Agent output, `SKILLS.md` for compliance, `06__KNOWLEDGE_VAULT/05__DECISIONS/`.
- **Writes:** Review reports into `_COMMUNICATION_LOGS/`.

#### `_MEMORY_KEEPER`
- **Role:** Cross-agent memory sync manager.
- **Skills:** Conflict resolution, deduplication, compression.
- **Reads:** All `MEMORY.md` files, SQLite DB, Qdrant vectors.
- **Writes:** `07__MEMORY_SYSTEM/`, nightly compression logs.

### 3.4 Communication Logs

All inter-agent messages are append-only markdown in `05__AGENTS/_COMMUNICATION_LOGS/YYYY-MM-DD/`:

- `agent_A_to_agent_B.md` — Directed messages
- `broadcast_events.md` — Pub/sub events (spawn, task complete, alert)
- `system_health.md` — Aggregated heartbeat dumps

Format:
```markdown
---
from: AGENT__CODER
to: _CRITIC
timestamp: 2026-05-14T09:23:17Z
type: review_request
priority: high
---

## Request
Please review PR #42 for backend refactoring.

## Context
[[AGENT__CODER/MEMORY.md#refactoring-notes]]
```

### 3.5 Superpowers Skills

Located in `05__AGENTS/_SUPERPOWERS/SKILLS/`, these are obra/superpowers-compatible skill manifests. Any agent can invoke them if the task matches the skill's trigger conditions.

| Skill | Trigger | Output |
|-------|---------|--------|
| `BRAINSTORMING.md` | Creative or architectural task | 3 wild + 3 practical + 1 impossible idea |
| `TDD.md` | Any code generation task | RED-GREEN-REFACTOR cycle instructions |
| `WRITING_PLANS.md` | Task > 5 minutes estimated | Decomposed sub-tasks with estimates |
| `SUBAGENT_DEV.md` | Complex implementation | Two-stage review plan |
| `SYSTEMATIC_DEBUG.md` | Bug report or failure | 4-phase root-cause process |
| `GIT_WORKTREES.md` | Parallel feature work | Git worktree setup for isolation |
| `WRITING_SKILLS.md` | Meta: creating new skills | Template for new skill manifests |

---

## 4. Memory System

The memory system is a **hybrid triad**: files for humans, SQLite for structure, Qdrant for semantics. Optionally backed by OpenViking.

```
07__MEMORY_SYSTEM/
├── QDRANT/
│   └── docker-compose.qdrant.yml    # Vector DB for semantic search
├── SQLITE/
│   ├── schema.sql                   # Table definitions
│   └── migrations/                  # Schema evolution
├── OPENVIKING/                      # ByteDance context DB (optional)
│   ├── ov.conf
│   └── workspace/
│       ├── resources/               # Project docs
│       ├── user/                    # Arkitekt profile
│       └── agent/                   # Agent skills & memories
├── EMBEDDINGS_CACHE/                # Cached embeddings (avoid re-computation)
├── SESSION_LOGS/
│   └── YYYY-MM/
│       └── session_{uuid}.jsonl     # Full conversation transcripts
├── CLI_SESSIONS/                    # Per-CLI session artifacts
│   ├── CLAUDE_CODE/
│   ├── CODEX/
│   ├── HERMES_AGENT/
│   └── _CROSS_CLI_ANALYSIS/       # Comparative analysis across CLIs
└── MEMORY_BRIDGE/
    ├── sync_to_qdrant.py            # SQLite → Qdrant sync
    ├── sync_from_vault.py           # Vault markdown → SQLite parse
    ├── conflict_resolver.py         # Deduplication & merge rules
    └── openviking_sync.py           # OpenViking L0/L1/L2 tier sync
```

### 4.1 SQLite Schema

The canonical schema defines four tables:

- **`agents`** — Registry of all spawned agents (id, name, role, created_at, last_active, status)
- **`memories`** — Verified facts with embedding IDs for vector linkage (content, category, verified flag)
- **`sessions`** — Token accounting: tokens_in, tokens_out, cost_estimate, cli_tool, model
- **`memory_bridge_log`** — Audit trail of every sync operation (source, destination, conflicts)

Indexes: `idx_memories_agent`, `idx_memories_category`, `idx_sessions_agent`.

### 4.2 Qdrant

Runs via Docker Compose (`docker-compose -f 07__MEMORY_SYSTEM/QDRANT/docker-compose.qdrant.yml up -d`).

- **Port 6333:** HTTP REST API
- **Port 6334:** gRPC API
- **Volume:** `qdrant_storage` (Docker-managed persistent volume)

Use case: semantic search across all agent memories, cross-reference discovery, similarity matching for deduplication.

### 4.3 OpenViking Integration (Optional)

OpenViking is ByteDance's filesystem-native context database. If enabled, it mounts via the `viking://` URI scheme.

**Tiered loading mapping:**
- **L0 Abstract** (~100 tokens) → Auto-generated from `SOUL.md` + `IDENTITY.md`
- **L1 Overview** (~2k tokens) → `SKILLS.md` + `KANBAN.md`
- **L2 Details** (unlimited, on-demand) → Full `MEMORY.md` + vault notes

Config in `07__MEMORY_SYSTEM/OPENVIKING/ov.conf` controls sync intervals and compression.

### 4.4 Memory Bridge

Three Python scripts manage the sync layer:

1. **`sync_to_qdrant.py`** — Reads verified memories from SQLite, computes embeddings (or uses cache), upserts into Qdrant collections.
2. **`sync_from_vault.py`** — Parses Knowledge Vault markdown files (extracts frontmatter + body), upserts structured records into SQLite.
3. **`conflict_resolver.py`** — Detects duplicate memories across agents, merges with attribution, flags conflicts for human review.

Run all: `./10__SCRIPTS/SYNC_MEMORY.sh`

---

## 5. Knowledge Vault

An Obsidian-compatible, wikilink-powered, frontmatter-structured shared brain.

```
06__KNOWLEDGE_VAULT/
├── .obsidian/                  # Obsidian config (if using app)
├── 00__INBOX/                  # Fleeting notes, raw captures
├── 01__SOURCES/                # Immutable raw material
│   ├── articles/
│   ├── books/
│   ├── podcasts/
│   ├── meeting_notes/
│   └── WEB_CRAWL/              # TinyFish crawl results
│       └── YYYY-MM-DD__{site}/
│           ├── raw.md
│           ├── extracted.json
│           └── summary.md
├── 02__CONCEPTS/               # Evergreen notes, atomic ideas
│   ├── architecture_patterns/
│   ├── business_logic/
│   └── domain_knowledge/
├── 03__PROJECTS/               # Project-specific knowledge
│   ├── active/
│   └── completed/
├── 04__PEOPLE/                 # Team, stakeholders, contacts
├── 05__DECISIONS/              # ADRs, rationale, outcomes
│   └── YYYY-MM-DD__decision_name.md
├── 06__PROCESSES/              # How-to, runbooks, SOPs
├── 07__TEMPLATES/              # Note templates, frontmatter schemas
└── 99__META/                   # Vault maintenance
    ├── schema.md               # Vault constitution
    └── broken_links_report.md
```

### 5.1 Frontmatter Schema

Every note MUST include:

```yaml
---
title: "Note Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [concept, backend, agent-swarm]
status: seedling | budding | evergreen
source: "URL or reference"
agents: [agent_name, agent_name]  # Which agents should know this?
---
```

**Status definitions:**
- **seedling** — Raw capture, unprocessed, may be wrong
- **budding** — Organized, linked, evolving, referenced occasionally
- **evergreen** — Mature, atomic, referenced often, rarely changes

### 5.2 Linking Rules

- Use wikilinks: `[[Note Name]]`
- Prefer atomic notes (one idea per file)
- Tag aggressively for agent discoverability
- Agents parse `agents:` frontmatter to decide which memories to load

---

## 6. Prompt Registry

PromptFoo-native declarative prompt management with version control, red teaming, and CI/CD integration.

```
08__PROMPTS/
├── PROMPTFOO_CONFIG/
│   ├── promptfooconfig.yaml    # Global config: providers, tests, sharing
│   ├── redteam.yaml            # Security scanning config
│   └── ci.yaml                 # GitHub Actions / pipeline integration
├── REGISTRY/
│   ├── system/
│   │   └── orchestrator_system.yaml
│   ├── user/
│   │   └── brainstorm_prompt.yaml
│   └── few_shot/
│       └── examples_orchestrator.yaml
├── TESTS/
│   ├── regression/
│   ├── redteam/
│   │   ├── test_injection.yaml
│   │   └── test_pii_leak.yaml
│   └── evals/
│       └── benchmark_results/
├── VERSIONS/
│   └── {prompt_name}/
│       ├── v1.0.0.yaml
│       ├── v1.1.0.yaml
│       └── CHANGELOG.md
├── SHARED_FRAGMENTS/
│   ├── identity_fragment.md
│   ├── soul_fragment.md
│   └── constraints_fragment.md
└── CLI_ADAPTERS/
    ├── claude_code/
    ├── codex/
    ├── kimi_code/
    └── hermes_agent/
```

### 6.1 Why PromptFoo?

- **Declarative YAML configs** — Version in Git, diffable, reviewable
- **Red teaming built-in** — Prompt injection, PII exposure, jailbreak risks
- **Multi-provider** — OpenAI, Anthropic, Google, local models
- **CI/CD native** — Fail builds on prompt regression

### 6.2 Shared Fragments

Reusable prompt components that get composed into full prompts at runtime:

- `identity_fragment.md` — "You are AGENT__X, a Y..."
- `soul_fragment.md` — Core directives and guardrails
- `constraints_fragment.md` — "You MUST NOT..."

---

## 7. Research Engine

Karpathy-style autoresearch adapted for general agent experimentation.

```
09__RESEARCH/
├── AUTORESEARCH_CONFIG/
│   ├── program.md              # Human-written research instructions
│   ├── constraints.md            # Immutable files & safety limits
│   ├── metrics.yaml            # Success criteria (BPB, accuracy, etc.)
│   └── loop_config.yaml        # Experiment duration, checkpoints
├── EXPERIMENTS/
│   └── YYYY-MM-DD__{topic}/
│       ├── hypothesis.md       # Agent's proposed change
│       ├── diff.patch          # Code diff
│       ├── results.json        # Metrics output
│       ├── git_log.txt         # Commit history
│       └── verdict.md          # KEEP / ROLLBACK / ITERATE
├── TEMPLATES/
│   ├── ml_optimization/        # Karpathy-style nanochat loops
│   ├── prompt_optimization/    # A/B test prompt variants
│   ├── architecture_search/    # Try different system designs
│   └── data_pipeline/          # ETL experiment loops
├── DASHBOARDS/
│   └── experiment_tracker.html # D3.js timeline of all runs
└── PAPERS/
    └── YYYY-MM-DD__finding.md
```

### 7.1 The Loop

1. Human writes `program.md` (research goals, constraints).
2. Agent reads instructions → proposes code change.
3. Run 5-minute experiment → measure metric.
4. Verdict: **KEEP** if improved, **ROLLBACK** if not, **ITERATE** if ambiguous.
5. Git commits on feature branch `exp/YYYY-MM-DD__topic` → full audit trail.

### 7.2 Safety Constraints

- No production deployments from experiments.
- All experiments on feature branches.
- `_CRITIC` approval required before merge.
- Immutable files (`IDENTITY.md`, `SOUL.md`, `schema.md`) cannot be modified by the research agent.

---

## 8. Token Budget Management

Financial governance for agent swarms. Every token spent is tracked.

```
11__TOKENS/
├── BUDGETS/
│   ├── project_budget.yaml     # Total monthly/weekly allocation
│   ├── per_agent_budgets.yaml  # Sniper: $500/mo, Researcher: $1000/mo, etc.
│   └── per_task_budgets.yaml   # Brainstorm: $5, Code gen: $20
├── TRACKING/
│   └── YYYY-MM/
│       └── usage_log.jsonl     # Timestamp, agent, model, tokens, cost
├── ALERTS/
│   ├── threshold_rules.yaml    # 80% warning, 95% critical, 100% hard stop
│   └── alert_history.md
├── OPTIMIZATION/
│   ├── compression_strategies.md  # Summarization, context pruning
│   ├── model_routing.yaml         # Cheap model for draft, expensive for review
│   └── cache_hit_analysis.md
└── REPORTS/
    └── YYYY-MM__token_report.md
```

### 8.1 Alert Rules

```yaml
rules:
  - name: "Daily Burn Rate"
    condition: "daily_spend > (monthly_budget / 30) * 1.5"
    action: "notify_slack"
    severity: warning

  - name: "Agent Overrun"
    condition: "agent_spend > agent_budget * 0.95"
    action: "pause_agent"
    severity: critical

  - name: "Project Cap"
    condition: "total_spend > project_budget"
    action: "hard_stop_all"
    severity: emergency
```

### 8.2 Per-Agent Budgets

When `INIT_AGENT.sh` spawns a new agent, it auto-registers a default budget in `11__TOKENS/BUDGETS/per_agent_budgets.yaml`:

```yaml
agents:
  CODER:
    monthly_usd: 300.00
    daily_usd: 10.00
    model_tier: standard
    alert_at: 0.80
```

---

## 9. CLI Harnesses

Every major CLI agent tool gets a harness folder with project context, aliases, and swarm integration docs.

```
12__CLI_HARNESSES/
├── CLAUDE_CODE/
│   ├── CLAUDE_CODE.md          # Project context for Claude
│   ├── INTEGRATION.md          # Swarm connectivity
│   ├── ALIASES.sh              # Shortcuts: ccd, ccd-review
│   └── .claude/
│       ├── settings.json
│       └── auth/               # Credentials (gitignored)
├── CODEX/
│   ├── CODEX.md
│   ├── INTEGRATION.md
│   ├── ALIASES.sh              # cx, cx-cloud, cx-review
│   └── .codex/
│       ├── config.toml
│       └── mcp/                # MCP server configs
├── GEMINI_CLI/
├── KIMI_CODE/
├── HERMES_AGENT/
├── OPENCODE/
├── _SHARED/
│   ├── context_sync.py         # Propagate shared conventions to all harnesses
│   └── token_router.py         # Route tasks to cheapest capable CLI
└── _ORCHESTRATOR/
    ├── router.sh               # "arkitekt, do X" → picks best CLI
    ├── cost_tracker.py         # Real-time cost across all CLIs
    └── fallback_chain.yaml     # If Claude fails → try Codex → try Kimi
```

### 9.1 Router Logic

`token_router.py` maps task types to optimal CLIs:

| Task Type | Primary CLI | Fallback |
|-----------|-------------|----------|
| creative_writing | HERMES_AGENT | CLAUDE_CODE |
| deep_research | KIMI_CODE | CLAUDE_CODE |
| google_workspace | GEMINI_CLI | CLAUDE_CODE |
| code_review | CLAUDE_CODE | CODEX |
| bug_hunt | CODEX | CLAUDE_CODE |
| frontend_ui | CLAUDE_CODE | KIMI_CODE |

### 9.2 Context Sync

`context_sync.py` propagates changes in shared project conventions to all CLI `.md` files simultaneously, preventing drift between harnesses.

---

## 10. System Maintenance Engine

A two-tier update system: **custom granular control** (default) or **Topgrade** (simplified unified approach).

```
10__SCRIPTS/SYSTEM_MAINTENANCE/
├── UPDATE_ALL.sh               # Master script with colored output & markdown reports
├── UPDATE_BREW.sh              # Homebrew formulas + casks + cleanup + doctor
├── UPDATE_NPM.sh               # npm itself + global packages
├── UPDATE_PIP.sh               # pip + all outdated packages
├── UPDATE_CARGO.sh             # Cargo crates via cargo-update
├── UPDATE_GEM.sh               # Ruby gems + cleanup
├── UPDATE_MAS.sh               # Mac App Store apps
├── UPDATE_VSCODE.sh            # VS Code extensions
├── UPDATE_MACOS.sh             # macOS system software updates
├── UPDATE_DOCKER.sh            # Docker image pulls + prune
├── UPDATE_OHMYZSH.sh           # Oh My Zsh framework
├── UPDATE_FISH.sh              # Fisher / OMF plugins
├── UPDATE_NVM.sh               # NVM Node LTS install
├── UPDATE_FNM.sh               # FNM Node LTS install
├── UPDATE_RUSTUP.sh            # Rustup toolchains
├── UPDATE_PYENV.sh             # Pyenv + latest Python
├── UPDATE_TOPGRADE.sh          # Wrapper for topgrade
├── topgrade.toml               # Arkitekt config for topgrade
├── com.arkitekt.system-maintenance.plist  # macOS launchd auto-scheduler
├── README.md                   # Full documentation
└── logs/
    └── YYYY-MM/
        ├── update_YYYY-MM-DD_HH-MM-SS.log
        └── report_YYYY-MM-DD_HH-MM-SS.md
```

### 10.1 Master Script (`UPDATE_ALL.sh`)

- **Colored output:** green ✅, red ❌, yellow ⏭️
- **Full logging** to `logs/YYYY-MM/update_*.log`
- **Markdown reports** with summary tables and next-step checklists
- **Auto-cleanup** of logs older than 30 days (moved to `14__ARCHIVE/logs/`)
- **Two modes:**
  - `./UPDATE_ALL.sh` — Custom granular control (default)
  - `./UPDATE_ALL.sh --topgrade` — Unified via topgrade

### 10.2 Auto-Scheduling

**Cron (Linux/macOS):**
```bash
0 3 * * 0 cd /path/to/project && 10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh
```

**macOS Launchd:**
```bash
sed -i '' "s|__SCRIPT_PATH__|$(pwd)|g" com.arkitekt.system-maintenance.plist
cp com.arkitekt.system-maintenance.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.arkitekt.system-maintenance.plist
```

Runs every Sunday at 3:00 AM.

---

## 11. MISC Auto-Sorter

The sanctioned junk dump. Drop ANYTHING into `13__MISC/INBOX/` and the robot sorts it.

```
13__MISC/
├── INBOX/                      # Flat chaos. Drop everything here.
├── SORTER_CONFIG/
│   ├── rules.yaml              # File-extension → destination mapping
│   ├── ml_classifier.py        # Optional AI-based content classification
│   ├── dry_run.sh              # Preview what would move where
│   └── reports/                # Daily sorting reports
├── SORTED/                     # Staging area with provenance logs
│   └── YYYY-MM-DD/
├── UNSORTABLE/                 # Files the sorter couldn't classify
└── QUARANTINE/                 # SECURITY RISK — secrets, keys, .env files
```

### 11.1 Rule Engine

File extensions are mapped to destinations:

| Extension | Destination | Action |
|-----------|-------------|--------|
| `.png`, `.jpg`, `.svg` | `03__ASSETS/images/` | Move |
| `.mp4`, `.mov` | `03__ASSETS/video/` | Move |
| `.md`, `.txt` | `06__KNOWLEDGE_VAULT/00__INBOX/` | Move |
| `.py`, `.js`, `.ts` | `02__BACKEND/snippets/` | Move |
| `.log`, `.tmp` | `14__ARCHIVE/temp/` | Move |
| `.zip`, `.tar.gz` | `14__ARCHIVE/backups/` | Move |
| `.pem`, `.key`, `.env` | `13__MISC/QUARANTINE/` | **Quarantine** |

### 11.2 Security Model

Files matching secret patterns (`.pem`, `.key`, `.crt`, `.env`, `.secrets`) are **quarantined**, not moved into the project tree. A daily report flags them for manual review.

### 11.3 Collision Handling

If a destination file already exists, the sorter appends a Unix timestamp suffix (`filename_1715736000.ext`) and logs the rename in the daily report.

---

## 12. CLAW3D Visualizer

Agent communication network visualizer. Generates interactive D3.js graphs from inter-agent message logs.

```
10__SCRIPTS/CLAW3D/
├── log_parser.py               # Parses _COMMUNICATION_LOGS/ into graph JSON
├── visualizer.py               # Generates interactive HTML
├── templates/
│   └── network_graph.html      # D3.js / Cytoscape visualization
└── output/
    └── agent_network_YYYY-MM-DD.html
```

### 12.1 Visualized Metrics

- **Message flow** — Edge thickness = frequency of communication
- **Token burn rate** — Edge color intensity = cost of that communication path
- **Bottlenecks** — Nodes with high inbound, low outbound
- **Orphaned agents** — No recent comms (highlighted in red)
- **Critical path** — Orchestrator → worker → critic loops (highlighted in green)

### 12.2 Usage

```bash
# Generate today's network graph
python3 10__SCRIPTS/CLAW3D/visualizer.py

# Serve interactively
python3 10__SCRIPTS/CLAW3D/visualizer.py --serve --port 8080
```

---

## 13. Docker Compose Stack

Root-level `docker-compose.yml` orchestrates optional infrastructure services.

### 13.1 Services

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| **qdrant** | `qdrant/qdrant:latest` | 6333 (HTTP), 6334 (gRPC) | Vector database for semantic memory |
| sqlite-web | `coleifer/sqlite-web` | 8080 | Browser-based SQLite inspector (commented out) |
| openviking | `volcengine/openviking` | 7474 | Context database (commented out) |

### 13.2 Volumes

- `qdrant_storage` — Persistent Docker volume for vector data
- `openviking_data` — Optional OpenViking workspace data

### 13.3 Quick Start

```bash
# Start Qdrant
docker compose up -d qdrant

# Verify
curl http://localhost:6333

# Stop
docker compose down
```

---

## 14. Bootstrap & Agent Lifecycle

### 14.1 INIT_PROJECT.sh

The master bootstrap script. Run once per project.

**What it does:**
1. Creates all 14 root directories and nested subdirectories.
2. Writes `PROJECT_MANIFEST.md` and `GETTING_STARTED.md`.
3. Initializes the Knowledge Vault constitution (`schema.md`).
4. Creates the SQLite schema, Qdrant compose file, and OpenViking config.
5. Writes PromptFoo global config and sample registry entries.
6. Writes research templates and constraints.
7. Initializes token budgets with default allocations.
8. Creates all 6 CLI harness folders with placeholder `.md` files.
9. Writes the MISC sorter rules and quarantine config.
10. Pre-spawns `_ORCHESTRATOR`, `_CRITIC`, `_MEMORY_KEEPER` with all 8 sacred files.

**Usage:**
```bash
./INIT_PROJECT.sh MyAwesomeProject
```

### 14.2 INIT_AGENT.sh

Spawns a new agent into the swarm.

**What it does:**
1. Validates name and role arguments.
2. Creates `AGENT__{NAME}/` directory with `TOOLS/`, `SCRIPTS/`, `MEMORY_ARCHIVE/`.
3. Generates all 8 sacred files from templates with agent-specific substitutions.
4. Appends a spawn event to `_COMMUNICATION_LOGS/YYYY-MM-DD/broadcast_events.md`.
5. Auto-registers a default token budget in `11__TOKENS/BUDGETS/per_agent_budgets.yaml`.
6. Prints a spawn report with next steps.

**Usage:**
```bash
./10__SCRIPTS/INIT_AGENT.sh CODER "Senior Full-Stack Developer"
./10__SCRIPTS/INIT_AGENT.sh RESEARCHER "Deep Research Specialist"
```

### 14.3 Agent Lifecycle States

```
[spawned] → [calibrating] → [idle] → [assigned] → [working] → [review] → [done] → [idle]
                               ↑___________________________________________________|
```

- **spawned** — `INIT_AGENT.sh` just created the agent.
- **calibrating** — Human reviews `IDENTITY.md` and `SOUL.md`.
- **idle** — Agent waits in `_ORCHESTRATOR` queue.
- **assigned** — Task written to `KANBAN.md` "Doing" column.
- **working** — Agent fills `SCRATCHPAD.md` with context.
- **review** — `_CRITIC` evaluates output.
- **done** — Task moved to "Done", `SCRATCHPAD.md` wiped.

---

## 15. Integration Map

How the 14 directories interact:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              HUMAN / OPERATOR                                │
└─────────────────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐
│ 00__DOCUMENT │   │ 13__MISC/    │   │ 10__SCRIPTS/         │
│ ATION        │   │ INBOX/       │   │ INIT_PROJECT.sh      │
│ (specs, PRDs)│   │ (junk dump)  │   │ INIT_AGENT.sh        │
└──────┬───────┘   └──────┬───────┘   │ UPDATE_ALL.sh        │
       │                  │            └──────────────────────┘
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│ 06__KNOWLEDGE│   │ 13__MISC/    │
│ _VAULT       │   │ SORTED/      │
│ ( evergreen  │◄──│ (organized  │
│   notes )    │   │   output )   │
└──────┬───────┘   └──────────────┘
       │
       ▼
┌──────────────┐
│ 07__MEMORY_  │◄────────────────┐
│ SYSTEM       │                 │
│ (SQLite +    │◄────────────────┤
│  Qdrant)     │                 │
└──────┬───────┘                 │
       │                        │
       ▼                        │
┌──────────────┐                │
│ 05__AGENTS/  │────────────────┘
│ _MEMORY_KEEPER│
└──────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            AGENT SWARM                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │_ORCHES- │  │_CRITIC  │  │AGENT__  │  │AGENT__  │  │AGENT__  │           │
│  │TRATOR   │  │         │  │CODER    │  │DESIGNER │  │RESEARCH │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       │            │            │            │            │               │
│       └────────────┴────────────┴────────────┴────────────┘               │
│                         _COMMUNICATION_LOGS/                               │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            OUTPUT & EXECUTION                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │01__FRONT│  │02__BACK │  │04__INFRA │  │09__RESEA│  │08__PROMP│           │
│  │END      │  │END      │  │STRUCTURE │  │RCH      │  │TS       │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            OBSERVABILITY                                    │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │11__TOKEN│  │12__CLI  │  │10__SCRIP│  │14__ARCHI│                        │
│  │S        │  │HARNESSES│  │TS/CLAW3D│  │VE       │                        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. Human writes specs in `00__DOCUMENTATION/`.
2. Human drops files in `13__MISC/INBOX/` → auto-sorter moves to `03__ASSETS/`, `02__BACKEND/`, or `06__KNOWLEDGE_VAULT/`.
3. `_ORCHESTRATOR` reads `00__DOCUMENTATION/` and assigns tasks to agents.
4. Agents read/write their sacred files in `05__AGENTS/`.
5. `_MEMORY_KEEPER` syncs agent memories to `07__MEMORY_SYSTEM/`.
6. `07__MEMORY_SYSTEM/` feeds vectors back to agents for semantic recall.
7. Agents produce code in `01__FRONTEND/` and `02__BACKEND/`.
8. `_CRITIC` reviews output before merge.
9. `11__TOKENS/` tracks cost of every operation.
10. `10__SCRIPTS/CLAW3D/` visualizes the communication graph.
11. Old artifacts rot into `14__ARCHIVE/`.

---

## 16. Security Model

### 16.1 Secret Quarantine

Files matching these patterns are **never** auto-sorted into the project tree:

- `.pem`, `.key`, `.crt`, `.csr`, `.p12` — Cryptographic material
- `.env`, `.secrets` — Environment variables and secrets

They land in `13__MISC/QUARANTINE/` with a security flag in the daily report. Human must manually review and decide:
- Delete (if accidental)
- Move to a proper secrets manager
- Add to `.gitignore` and commit a `.env.example`

### 16.2 Git Hygiene

`.gitignore` is pre-configured to exclude:
- `07__MEMORY_SYSTEM/EMBEDDINGS_CACHE/` (large binary blobs)
- `07__MEMORY_SYSTEM/SESSION_LOGS/` (potentially sensitive conversations)
- `07__MEMORY_SYSTEM/QDRANT/qdrant_storage/` (Docker volume data)
- `12__CLI_HARNESSES/*/.claude/auth/` (API keys)
- `12__CLI_HARNESSES/*/.codex/mcp/` (MCP credentials)
- `12__CLI_HARNESSES/*/.gemini/` (Google auth)
- `12__CLI_HARNESSES/*/.kimi/` (Moonshot auth)
- `12__CLI_HARNESSES/*/.hermes/skills/` (Skill secrets)
- `10__SCRIPTS/CLAW3D/output/` (Generated artifacts)
- `11__TOKENS/TRACKING/` (Raw usage logs)
- `*.tmp`, `*.log` (Temporary files)
- `.DS_Store` (macOS metadata)

### 16.3 Agent Guardrails

From `SOUL.md`:
- Never auto-write identity files (human review required).
- Never modify immutable files (`IDENTITY.md`, `SOUL.md`, `schema.md`).
- Never deploy to production from an experiment branch.
- Expire stale memory aggressively.

---

## 17. Extension Points

Arkitekt is designed to grow. Here are the sanctioned extension patterns:

| Extension | Where | How |
|-----------|-------|-----|
| New root directory | Add `15__NEWTHING/` | Update `INIT_PROJECT.sh` and this overview |
| New agent type | Add template to `10__SCRIPTS/_TEMPLATES/` | Reference in `INIT_AGENT.sh` |
| New CLI harness | Create `12__CLI_HARNESSES/NEWCLI/` | Add to `context_sync.py` router |
| New skill | Write `.md` in `05__AGENTS/_SUPERPOWERS/SKILLS/` | Agents auto-discover by filename |
| New maintenance step | Write `UPDATE_X.sh` in `10__SCRIPTS/SYSTEM_MAINTENANCE/` | Register in `UPDATE_ALL.sh` |
| New vault note type | Add folder in `06__KNOWLEDGE_VAULT/` | Update `schema.md` frontmatter rules |
| New memory backend | Add connector in `07__MEMORY_SYSTEM/MEMORY_BRIDGE/` | Update `SYNC_MEMORY.sh` |
| New prompt test | Add YAML in `08__PROMPTS/TESTS/` | Reference in `promptfooconfig.yaml` |

---

## Appendix A: File Count Summary

As of the last scaffold build:

- **Total files:** 126
- **Shell scripts:** 28 (all executable)
- **Python scripts:** 6
- **Markdown files:** ~60
- **YAML/TOML configs:** ~12
- **HTML templates:** 1
- **Plist configs:** 1
- **SQL schemas:** 1

---

## Appendix B: Quick Reference Card

```bash
# Bootstrap
./INIT_PROJECT.sh MyProject

# Spawn agents
./10__SCRIPTS/INIT_AGENT.sh CODER "Senior Developer"
./10__SCRIPTS/INIT_AGENT.sh DESIGNER "UI/UX Specialist"

# System maintenance
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh

# Memory sync
./10__SCRIPTS/SYNC_MEMORY.sh

# Auto-sort junk
./10__SCRIPTS/auto_sort_misc.sh

# Start infrastructure
docker compose up -d qdrant

# Visualize swarm
python3 10__SCRIPTS/CLAW3D/visualizer.py --serve --port 8080
```

---

*Generated for Arkitekt Universal Project Scaffold v3.1.*
*Touch the impossible.* ⚡
