#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# ARKITEKT UNIVERSAL PROJECT SCAFFOLD v3.1
# Master bootstrap script
# Usage: ./INIT_PROJECT.sh <PROJECT_NAME>
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

PROJECT_NAME="${1:-ARKITEKT_PROJECT}"
PROJECT_ROOT="$(pwd)"

if [ -z "${1:-}" ]; then
    echo "⚠️  No project name provided. Using default: ARKITEKT_PROJECT"
    echo "Usage: ./INIT_PROJECT.sh <PROJECT_NAME>"
    echo ""
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🏗️  ARKITEKT UNIVERSAL SCAFFOLD v3.1                   ║"
echo "║     Bootstrapping: ${PROJECT_NAME}"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ── Core ALL CAPS Structure ─────────────────────────────────
echo "📁 Creating core directory structure..."

mkdir -p {00__DOCUMENTATION,01__FRONTEND,02__BACKEND,03__ASSETS,04__INFRASTRUCTURE}
mkdir -p {05__AGENTS/_ORCHESTRATOR,05__AGENTS/_CRITIC,05__AGENTS/_MEMORY_KEEPER,05__AGENTS/_SUPERPOWERS/SKILLS,05__AGENTS/_SUPERPOWERS/MARKETPLACE,05__AGENTS/_COMMUNICATION_LOGS,05__AGENTS/_PROTOCOLS,05__AGENTS/_SANDBOX}
mkdir -p {06__KNOWLEDGE_VAULT/00__INBOX,06__KNOWLEDGE_VAULT/01__SOURCES/{articles,books,podcasts,meeting_notes,WEB_CRAWL},06__KNOWLEDGE_VAULT/02__CONCEPTS/{architecture_patterns,business_logic,domain_knowledge},06__KNOWLEDGE_VAULT/03__PROJECTS/{active,completed},06__KNOWLEDGE_VAULT/04__PEOPLE,06__KNOWLEDGE_VAULT/05__DECISIONS,06__KNOWLEDGE_VAULT/06__PROCESSES,06__KNOWLEDGE_VAULT/07__TEMPLATES,06__KNOWLEDGE_VAULT/99__META}
mkdir -p {07__MEMORY_SYSTEM/QDRANT,07__MEMORY_SYSTEM/SQLITE/migrations,07__MEMORY_SYSTEM/OPENVIKING/workspace/{resources,user,agent},07__MEMORY_SYSTEM/EMBEDDINGS_CACHE,07__MEMORY_SYSTEM/SESSION_LOGS,07__MEMORY_SYSTEM/MEMORY_BRIDGE,07__MEMORY_SYSTEM/CLI_SESSIONS/{CLAUDE_CODE,CODEX,HERMES_AGENT,_CROSS_CLI_ANALYSIS}}
mkdir -p {08__PROMPTS/PROMPTFOO_CONFIG,08__PROMPTS/REGISTRY/{system,user,few_shot},08__PROMPTS/TESTS/{regression,redteam,evals},08__PROMPTS/VERSIONS,08__PROMPTS/SHARED_FRAGMENTS,08__PROMPTS/CLI_ADAPTERS/{claude_code,codex,kimi_code,hermes_agent}}
mkdir -p {09__RESEARCH/AUTORESEARCH_CONFIG,09__RESEARCH/EXPERIMENTS,09__RESEARCH/TEMPLATES/{ml_optimization,prompt_optimization,architecture_search,data_pipeline},09__RESEARCH/DASHBOARDS,09__RESEARCH/PAPERS}
mkdir -p {10__SCRIPTS/SYSTEM_MAINTENANCE/logs,10__SCRIPTS/CLAW3D/{templates,output},10__SCRIPTS/_TEMPLATES}
mkdir -p {11__TOKENS/BUDGETS,11__TOKENS/TRACKING,11__TOKENS/ALERTS,11__TOKENS/OPTIMIZATION,11__TOKENS/REPORTS}
mkdir -p {12__CLI_HARNESSES/{CLAUDE_CODE/.claude/auth,CODEX/.codex/mcp,GEMINI_CLI/.gemini,KIMI_CODE/.kimi,HERMES_AGENT/.hermes/skills,OPENCODE/.opencode},12__CLI_HARNESSES/_SHARED,12__CLI_HARNESSES/_ORCHESTRATOR}
mkdir -p {13__MISC/INBOX,13__MISC/SORTER_CONFIG/reports,13__MISC/SORTED,13__MISC/UNSORTABLE,13__MISC/QUARANTINE}
mkdir -p {14__ARCHIVE/{logs,temp,backups,deprecated}}

# ── Secrets Infrastructure ──────────────────────────────────
echo "🔐 Initializing Secrets Vault..."

mkdir -p "04__INFRASTRUCTURE/SECRETS/keys"
mkdir -p "04__INFRASTRUCTURE/ENVIRONMENTS"

# Root .env.example (committed — the canonical reference)
cat > ".env.example" <<'EOF'
# ═══════════════════════════════════════════════════════════════
# ARKITEKT UNIVERSAL SCAFFOLD — Environment Variables
# Copy this file to .env and fill in your actual secrets.
# NEVER commit .env — it is gitignored by design.
# For cross-machine sharing, encrypt .env with: ./04__INFRASTRUCTURE/SECRETS/encrypt.sh
# ═══════════════════════════════════════════════════════════════

# ── Project Identity ──────────────────────────────────────────
ARKITEKT_PROJECT_NAME=ARKITEKT_PROJECT
ARKITEKT_ENVIRONMENT=development

# ── AI / LLM Providers ──────────────────────────────────────
# At least one provider key is required. Fill all that you use.
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
MOONSHOT_API_KEY=...
GROQ_API_KEY=...

# ── Qdrant Vector Database ──────────────────────────────────
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=                     # Optional: only if Qdrant is secured

# ── SQLite / Memory System ──────────────────────────────────
SQLITE_DB_PATH=07__MEMORY_SYSTEM/SQLITE/agent_state.db

# ── OpenViking Context DB (optional) ──────────────────────
OPENVIKING_HOST=localhost
OPENVIKING_PORT=7474
OPENVIKING_API_KEY=

# ── TinyFish / Firecrawl Web Crawl ──────────────────────────
TINYFISH_API_KEY=
FIRECRAWL_API_KEY=

# ── PromptFoo (optional CI/CD) ────────────────────────────
PROMPTFOO_API_KEY=

# ── Token Budget Alerts ─────────────────────────────────────
# Webhook URL for budget overrun alerts (Slack, Discord, etc.)
ALERT_WEBHOOK_URL=

# ── GitHub / Git ────────────────────────────────────────────
GITHUB_TOKEN=ghp-...
GITHUB_USERNAME=

# ── SSH / Signing ───────────────────────────────────────────
# Paths to SSH keys (relative to home)
SSH_KEY_PATH=~/.ssh/id_ed25519
GPG_SIGNING_KEY=

# ── Docker Registry ─────────────────────────────────────────
DOCKER_REGISTRY_URL=
DOCKER_REGISTRY_USER=
DOCKER_REGISTRY_PASS=

# ── Cloud Providers (optional) ──────────────────────────────
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AZURE_SUBSCRIPTION_ID=
GCP_PROJECT_ID=

# ── Database Connections (for backend projects) ─────────────
DATABASE_URL=sqlite:./local.db
POSTGRES_URL=
REDIS_URL=
MONGODB_URI=

# ── Monitoring / Observability ──────────────────────────────
SENTRY_DSN=
DATADOG_API_KEY=

# ── Arkitekt-Specific ───────────────────────────────────────
# Encryption key for .env.age cross-machine sharing
# Generate with: age-keygen -o 04__INFRASTRUCTURE/SECRETS/keys/primary.key
AGE_PUBLIC_KEY=age1...

# Master secret for seeding any internal crypto (JWT, session, etc.)
ARKITEKT_MASTER_SECRET=change-me-to-a-64-char-random-string-now-please

# ── Per-Machine Overrides (auto-loaded after .env) ──────────
# Create .env.local for machine-specific tweaks (also gitignored)
# Example: LOCAL_MODEL_ENDPOINT=http://localhost:11434
EOF

# Secrets vault README
cat > "04__INFRASTRUCTURE/SECRETS/README.md" <<'EOF'
# 🔐 ARKITEKT SECRETS VAULT

**Cross-machine secret management for the Arkitekt scaffold.**

## Philosophy

- **`.env`** = Live secrets. Never committed. Machine-local by default.
- **`.env.example`** = Committed template. The canonical "what secrets exist" reference.
- **`.env.age`** = Encrypted bundle. Safe to commit or share via any channel.
- **`04__INFRASTRUCTURE/SECRETS/keys/`** = Per-machine `age` private keys. Never committed.

## Quick Start

### 1. First-Time Setup (on your primary machine)

```bash
# Install age if you don't have it
brew install age          # macOS
apt-get install age       # Debian/Ubuntu

# Generate a key pair for this machine
age-keygen -o 04__INFRASTRUCTURE/SECRETS/keys/primary.key

# The public key is printed to stdout — save it in .env:
# AGE_PUBLIC_KEY=age1...

# Copy .env.example to .env and fill in your secrets
cp .env.example .env
# ... edit .env with your actual keys ...

# Encrypt .env into .env.age (safe to commit!)
./04__INFRASTRUCTURE/SECRETS/encrypt.sh
```

### 2. Adding a Second Machine

```bash
# On the NEW machine, after cloning the repo:
age-keygen -o 04__INFRASTRUCTURE/SECRETS/keys/primary.key

# Copy the NEW public key to your primary machine
# On PRIMARY machine, add the new public key:
./04__INFRASTRUCTURE/SECRETS/add_recipient.sh "age1...new-machine-public-key..."

# Re-encrypt .env so both machines can decrypt it
./04__INFRASTRUCTURE/SECRETS/encrypt.sh

# Push the updated .env.age
# On the NEW machine, pull and decrypt:
git pull
./04__INFRASTRUCTURE/SECRETS/decrypt.sh
```

### 3. Daily Workflow

```bash
# After editing .env:
./04__INFRASTRUCTURE/SECRETS/encrypt.sh
git add .env.age && git commit -m "Rotate API keys"

# After pulling on another machine:
git pull
./04__INFRASTRUCTURE/SECRETS/decrypt.sh
```

## Security Rules

1. **Never commit `.env`** — it is gitignored globally
2. **Never commit `keys/*.key`** — these are machine-bound
3. **Do commit `recipients.txt`** — public keys are safe to share
4. **Do commit `.env.age`** — encryption is your safety net
5. **Rotate keys quarterly** — use `./04__INFRASTRUCTURE/SECRETS/rotate.sh`
6. **Revoke lost machines immediately** — use `remove_recipient.sh` and re-encrypt

## Validation

Before running any agent or script, validate secrets:

```bash
./04__INFRASTRUCTURE/SECRETS/validate.sh
```

This checks:
- All required variables from `TEMPLATE.md` are present in `.env`
- No dummy values remain (`change-me`, `sk-...`, etc.)
- No obviously malformed keys (length, prefix checks)
- File permissions are strict (`chmod 600`)
EOF

# Secrets template
cat > "04__INFRASTRUCTURE/SECRETS/TEMPLATE.md" <<'EOF'
# 🔐 SECRETS TEMPLATE — Arkitekt Scaffold v3.1

This file documents **every** secret variable the scaffold expects.
It is the single source of truth for:
- `.env.example` (committed)
- `validate.sh` (checks)
- `.env.age` (encrypted live values)

## Variable Catalog

### Project Identity
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `ARKITEKT_PROJECT_NAME` | Yes | string | `MyApp` | Project identifier |
| `ARKITEKT_ENVIRONMENT` | Yes | dev\|staging\|prod | `development` | Runtime environment |

### AI / LLM Providers
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `OPENAI_API_KEY` | Conditional | `sk-...` | `sk-abc123...` | OpenAI (Codex, GPT) |
| `ANTHROPIC_API_KEY` | Conditional | `sk-ant-...` | `sk-ant-api03-...` | Anthropic (Claude) |
| `GOOGLE_API_KEY` | Conditional | string | `AIza...` | Google (Gemini) |
| `MOONSHOT_API_KEY` | Conditional | string | `sk-...` | Moonshot (Kimi) |
| `GROQ_API_KEY` | Conditional | `gsk_...` | `gsk_abc...` | Groq inference |

> **Note:** At least one LLM provider key is required. Fill all that you use. Unused keys may be left empty.

### Arkitekt Internal
| Variable | Required | Format | Example | Description |
|----------|----------|--------|---------|-------------|
| `AGE_PUBLIC_KEY` | Yes* | `age1...` | `age1ql3z...` | For `.env.age` encryption |
| `ARKITEKT_MASTER_SECRET` | Yes | 64+ chars | `...` | Internal crypto seed |

> `AGE_PUBLIC_KEY` is required only if using `.env.age` encryption. Skip if using a password manager.

## Validation Rules

### Strict Checks (Hard Fail)
- `ARKITEKT_PROJECT_NAME` — non-empty, <= 64 chars
- `ARKITEKT_ENVIRONMENT` — one of: `development`, `staging`, `production`, `test`
- `ARKITEKT_MASTER_SECRET` — >= 64 characters, not equal to default
- At least one LLM provider key — non-empty

### Dummy Value Detection
The following are rejected as "not configured":
- `change-me`, `CHANGE-ME`, `replace-me`
- `sk-...`, `sk-ant-...` (literal ellipsis)
- `your-key-here`, `your-api-key`, `xxx`
- `TODO`, `FIXME`, `placeholder`
- Empty strings for required variables
EOF

# Recipients template
cat > "04__INFRASTRUCTURE/SECRETS/recipients.txt" <<'EOF'
# AGE RECIPIENTS — Arkitekt Secrets Vault
# One public key per line. Lines starting with # are ignored.
# Add your machines here, then run encrypt.sh to re-seal .env.age

# Primary machine — replace with your actual age public key
# age1ql3z7h3gk...  (primary)

# Secondary machine — laptop / server / VM
# age1xyz...  (secondary)
EOF

# Environment configs
cat > "04__INFRASTRUCTURE/ENVIRONMENTS/.env.development" <<'EOF'
# ENVIRONMENT: DEVELOPMENT
# Sourced AFTER .env — these values override the base config.

ARKITEKT_ENVIRONMENT=development
QDRANT_URL=http://localhost:6333
SQLITE_DB_PATH=07__MEMORY_SYSTEM/SQLITE/agent_state.db
DEBUG=true
LOG_LEVEL=debug
EOF

cat > "04__INFRASTRUCTURE/ENVIRONMENTS/.env.staging" <<'EOF'
# ENVIRONMENT: STAGING
# Sourced AFTER .env — these values override the base config.

ARKITEKT_ENVIRONMENT=staging
QDRANT_URL=https://staging-qdrant.internal:6333
DEBUG=false
LOG_LEVEL=info
AGENT_BUDGET_SAFETY_FACTOR=0.5
EOF

cat > "04__INFRASTRUCTURE/ENVIRONMENTS/.env.production" <<'EOF'
# ENVIRONMENT: PRODUCTION
# Sourced AFTER .env — these values override the base config.

ARKITEKT_ENVIRONMENT=production
QDRANT_URL=https://qdrant.internal:6333
DEBUG=false
LOG_LEVEL=warn
AGENT_BUDGET_SAFETY_FACTOR=0.3
EOF

cat > "04__INFRASTRUCTURE/ENVIRONMENTS/.env.local" <<'EOF'
# ENVIRONMENT: LOCAL (Machine-Specific Overrides)
# Sourced AFTER .env AND after the active environment file.
# Use this for THIS MACHINE ONLY — never commit, never share.

# Example: you run Ollama on this machine but not others
# LOCAL_MODEL_ENDPOINT=http://localhost:11434
# LOCAL_MODEL_NAME=llama3.1
EOF

# ── Secrets Management Scripts ──────────────────────────────
echo "🔐 Installing secrets management scripts..."

SCAFFOLD_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCAFFOLD_SECRETS="${SCAFFOLD_DIR}/04__INFRASTRUCTURE/SECRETS"
SECRETS_DIR="04__INFRASTRUCTURE/SECRETS"

if [ -d "$SCAFFOLD_SECRETS" ]; then
    for script in encrypt.sh decrypt.sh add_recipient.sh remove_recipient.sh validate.sh rotate.sh; do
        src="${SCAFFOLD_SECRETS}/${script}"
        dst="${SECRETS_DIR}/${script}"
        if [ -f "$src" ]; then
            cp "$src" "$dst"
            chmod +x "$dst"
            echo "  ✅ ${script}"
        else
            echo "  ⚠️  ${script} not found in scaffold source"
        fi
    done
else
    echo "  ⚠️  Scaffold source secrets directory not found."
    echo "     If running from a standalone INIT_PROJECT.sh, download the scripts from:"
    echo "     https://github.com/arkitekt/scaffold/04__INFRASTRUCTURE/SECRETS/"
    echo ""
    echo "     Or create stubs:"
    for script in encrypt.sh decrypt.sh add_recipient.sh remove_recipient.sh validate.sh rotate.sh; do
        cat > "${SECRETS_DIR}/${script}" <<'STUBEOF'
#!/bin/bash
# STUB — download the full script from the Arkitekt scaffold repo
echo "This is a stub. Please copy the real script from the scaffold source."
exit 1
STUBEOF
        chmod +x "${SECRETS_DIR}/${script}"
    done
fi

# ── Root Documentation ──────────────────────────────────────
echo "📝 Writing root documentation..."

cat > "00__DOCUMENTATION/PROJECT_MANIFEST.md" <<EOF
---
title: "Project Manifest"
created: $(date +%Y-%m-%d)
status: active
scaffold_version: "3.1.0"
---

# PROJECT_MANIFEST

## Project Identity
- **Name**: ${PROJECT_NAME}
- **Scaffold Version**: 3.1.0
- **Created**: $(date +%Y-%m-%d)
- **Arkitekt**: $(whoami)

## Directory Legend
| Prefix | Purpose |
|--------|---------|
| 00__ | Documentation & decisions |
| 01__ | Frontend code |
| 02__ | Backend services |
| 03__ | Static assets |
| 04__ | Infrastructure & DevOps |
| 05__ | Agent swarm |
| 06__ | Knowledge vault (Obsidian) |
| 07__ | Memory systems |
| 08__ | Prompt registry |
| 09__ | Research & experiments |
| 10__ | Scripts & automation |
| 11__ | Token budgets |
| 12__ | CLI harnesses |
| 13__ | Misc / inbox |
| 14__ | Archive |

## Quick Start
1. Run `./INIT_PROJECT.sh` to scaffold a new project
2. Run `10__SCRIPTS/INIT_AGENT.sh <NAME> <ROLE>` to spawn agents
3. Drop junk in `13__MISC/INBOX/` — auto-sorter runs hourly
4. Review `05__AGENTS/_ORCHESTRATOR/` for swarm routing

## Agentic Principles
- Prefer simple over complex
- Ask before assuming
- Document everything in markdown
- Respect creative chaos — organize it
- If a skill applies, USE IT
EOF

cat > "00__DOCUMENTATION/GETTING_STARTED.md" <<'EOF'
# Getting Started

## Spawning Your First Agent
```bash
./10__SCRIPTS/INIT_AGENT.sh CODER "Senior Full-Stack Developer"
./10__SCRIPTS/INIT_AGENT.sh RESEARCHER "Deep Research Specialist"
./10__SCRIPTS/INIT_AGENT.sh CRITIC "Code Review & Quality Gate"
```

## System Maintenance
```bash
./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh
```

## Memory Sync
```bash
./10__SCRIPTS/SYNC_MEMORY.sh
```

## Knowledge Vault
Open `06__KNOWLEDGE_VAULT/` in Obsidian or any markdown editor.
Use wikilinks: `[[Concept Name]]`
Use frontmatter for metadata.
EOF

# ── Knowledge Vault Constitution ────────────────────────────
echo "📚 Initializing Knowledge Vault..."

cat > "06__KNOWLEDGE_VAULT/99__META/schema.md" <<EOF
---
title: "Vault Constitution"
created: $(date +%Y-%m-%d)
status: evergreen
---

# Vault Constitution

## Frontmatter Schema
Every note MUST include:
```yaml
---
title: "Note Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [concept, backend, agent-swarm]
status: seedling | budding | evergreen
source: "URL or reference"
agents: [agent_name, agent_name]
---
```

## Status Definitions
- **seedling**: Raw capture, unprocessed
- **budding**: Organized, linked, but evolving
- **evergreen**: Mature, atomic, referenced often

## Linking Rules
- Use wikilinks: `[[Note Name]]`
- Prefer atomic notes (one idea per file)
- Tag aggressively for agent discoverability
EOF

touch "06__KNOWLEDGE_VAULT/99__META/broken_links_report.md"

# ── Memory System ───────────────────────────────────────────
echo "🧠 Initializing Memory System..."

cat > "07__MEMORY_SYSTEM/QDRANT/docker-compose.qdrant.yml" <<'EOF'
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
    environment:
      QDRANT__SERVICE__GRPC_PORT: 6334

volumes:
  qdrant_storage:
EOF

cat > "07__MEMORY_SYSTEM/SQLITE/schema.sql" <<'EOF'
-- Agent Memory Schema
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP,
    status TEXT DEFAULT 'idle'
);

CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT REFERENCES agents(id),
    content TEXT NOT NULL,
    embedding_id TEXT,
    category TEXT DEFAULT 'general',
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    agent_id TEXT REFERENCES agents(id),
    cli_tool TEXT,
    model TEXT,
    tokens_in INTEGER DEFAULT 0,
    tokens_out INTEGER DEFAULT 0,
    cost_estimate REAL DEFAULT 0.0,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memory_bridge_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT,
    destination TEXT,
    records_synced INTEGER,
    conflicts INTEGER,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON sessions(agent_id);
EOF

cat > "07__MEMORY_SYSTEM/OPENVIKING/ov.conf" <<'EOF'
# OpenViking Context Database Config
[server]
host = 0.0.0.0
port = 7474

[workspace]
root = ./workspace
protocol = viking://

[tier]
L0_abstract = 100
L1_overview = 2048
L2_details = 0  # unlimited, on-demand

[sync]
interval_seconds = 300
auto_compress = true
EOF

cat > "07__MEMORY_SYSTEM/MEMORY_BRIDGE/sync_to_qdrant.py" <<'PYEOF'
#!/usr/bin/env python3
"""Sync verified memories from SQLite to Qdrant vector DB."""
import sqlite3
import os
import json
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "../SQLITE/agent_state.db")
QDRANT_URL = os.environ.get("QDRANT_URL", "http://localhost:6333")

def sync():
    print(f"[{datetime.now().isoformat()}] Starting memory sync to Qdrant...")
    # TODO: implement actual Qdrant client sync
    print("✅ Sync complete (stub)")

if __name__ == "__main__":
    sync()
PYEOF
chmod +x "07__MEMORY_SYSTEM/MEMORY_BRIDGE/sync_to_qdrant.py"

cat > "07__MEMORY_SYSTEM/MEMORY_BRIDGE/sync_from_vault.py" <<'PYEOF'
#!/usr/bin/env python3
"""Parse Knowledge Vault markdown files into structured memory."""
import os
import re
import sqlite3
from datetime import datetime

VAULT_PATH = os.path.join(os.path.dirname(__file__), "../../06__KNOWLEDGE_VAULT")
DB_PATH = os.path.join(os.path.dirname(__file__), "../SQLITE/agent_state.db")

FM_RE = re.compile(r'^---\s*\n(.*?)\n---\s*\n', re.DOTALL)

def parse_frontmatter(content):
    m = FM_RE.match(content)
    if not m:
        return {}
    raw = m.group(1)
    meta = {}
    for line in raw.splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    return meta

def sync():
    print(f"[{datetime.now().isoformat()}] Syncing vault to memory DB...")
    # TODO: implement recursive vault parsing + upsert to SQLite
    print("✅ Vault sync complete (stub)")

if __name__ == "__main__":
    sync()
PYEOF
chmod +x "07__MEMORY_SYSTEM/MEMORY_BRIDGE/sync_from_vault.py"

# ── Prompt Registry ─────────────────────────────────────────
echo "🎯 Initializing Prompt Registry..."

cat > "08__PROMPTS/PROMPTFOO_CONFIG/promptfooconfig.yaml" <<'EOF'
# PromptFoo Global Config
# https://promptfoo.dev/docs/configuration/guide

description: "Arkitekt Prompt Registry"

defaults:
  providers:
    - openai:gpt-4o
    - anthropic:claude-3-5-sonnet-20241022
  targets:
    - id: default
      config:
        temperature: 0.7

sharing:
  appBaseUrl: https://app.promptfoo.dev

prompts:
  - file://../REGISTRY/system/orchestrator_system.yaml
  - file://../REGISTRY/user/brainstorm_prompt.yaml

tests:
  - file://../TESTS/regression/test_brainstorm.yaml
EOF

cat > "08__PROMPTS/PROMPTFOO_CONFIG/redteam.yaml" <<'EOF'
# PromptFoo Red Team Config
# Security scanning: PII, injection, jailbreaks

plugins:
  - id: pii
  - id: harmful
  - id: hijacking
  - id: injection

targets:
  - id: default
    config:
      temperature: 1.0
EOF

cat > "08__PROMPTS/REGISTRY/system/orchestrator_system.yaml" <<'EOF'
name: "Orchestrator System Prompt"
tags: [system, orchestrator, swarm]
---
You are the _ORCHESTRATOR agent in the Arkitekt swarm.

## Directives
1. Route tasks to the most capable agent
2. Monitor agent health via HEARTBEAT.md
3. Ensure cross-agent memory consistency
4. Escalate to _CRITIC when quality gates fail

## Comms Style
- Concise, structured markdown
- Always cite which agent you are delegating to
- Log all decisions in _COMMUNICATION_LOGS/
EOF

cat > "08__PROMPTS/REGISTRY/user/brainstorm_prompt.yaml" <<'EOF'
name: "Brainstorm Prompt"
tags: [user, creative, brainstorming]
---
We need creative solutions for: {{topic}}

Constraints:
- {{constraints}}

Please output:
1. 3 wild ideas (no judgment)
2. 3 practical implementations
3. 1 impossible-but-inspiring concept
4. Recommended agent to implement
EOF

# ── Research Templates ──────────────────────────────────────
echo "🔬 Initializing Research Templates..."

cat > "09__RESEARCH/AUTORESEARCH_CONFIG/program.md" <<'EOF'
# AutoResearch Program

## Objective
{{RESEARCH_GOAL}}

## Constraints
- Do NOT modify: {{PROTECTED_FILES}}
- Max experiment duration: {{MAX_DURATION}}
- Success metric: {{METRIC}}

## Loop Config
- Checkpoints every: 5 minutes
- Auto-rollback on: metric degradation > 5%
- Git branch naming: `exp/YYYY-MM-DD__{topic}`
EOF

cat > "09__RESEARCH/AUTORESEARCH_CONFIG/constraints.md" <<'EOF'
# Constraints

## Immutable Files
- `05__AGENTS/*/IDENTITY.md`
- `05__AGENTS/*/SOUL.md`
- `06__KNOWLEDGE_VAULT/99__META/schema.md`

## Safety Limits
- No production deployments from experiments
- All experiments on feature branches
- _CRITIC approval required before merge
EOF

# ── Token Budgets ───────────────────────────────────────────
echo "💰 Initializing Token Budgets..."

cat > "11__TOKENS/BUDGETS/project_budget.yaml" <<'EOF'
# Project Token Budget
period: monthly
reset_day: 1

allocations:
  total_usd: 2000.00
  cli_tools:
    claude_code: 600.00
    codex: 400.00
    hermes_agent: 300.00
    kimi_code: 200.00
    gemini_cli: 100.00
  agents:
    CODER: 300.00
    RESEARCHER: 200.00
    CRITIC: 100.00
    ORCHESTRATOR: 150.00
  buffers:
    emergency: 200.00
    experimentation: 150.00

alert_thresholds:
  warning: 0.80
  critical: 0.95
  hard_stop: 1.00
EOF

cat > "11__TOKENS/ALERTS/threshold_rules.yaml" <<'EOF'
# Alert Rules
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
EOF

# ── CLI Harnesses ───────────────────────────────────────────
echo "🛠️  Initializing CLI Harnesses..."

for CLI in CLAUDE_CODE CODEX GEMINI_CLI KIMI_CODE HERMES_AGENT OPENCODE; do
    cat > "12__CLI_HARNESSES/${CLI}/${CLI}.md" <<EOF
---
tool: ${CLI}
created: $(date +%Y-%m-%d)
status: active
---

# ${CLI} Project Context

## Stack
- Fill in your project stack here

## Conventions
- All caps directory names
- Markdown for all documentation
- Agent-swarm compatible

## Integration
See INTEGRATION.md for swarm connectivity.
EOF

    cat > "12__CLI_HARNESSES/${CLI}/INTEGRATION.md" <<EOF
# ${CLI} Swarm Integration

## Role
This harness connects ${CLI} to the Arkitekt swarm.

## Entry Points
- Primary: \`05__AGENTS/_ORCHESTRATOR/\`
- Memory: \`07__MEMORY_SYSTEM/\`
- Logs: \`07__MEMORY_SYSTEM/CLI_SESSIONS/${CLI}/\`

## Aliases
See ALIASES.sh for shortcuts.
EOF

touch "12__CLI_HARNESSES/${CLI}/ALIASES.sh"
done

cat > "12__CLI_HARNESSES/_SHARED/context_sync.py" <<'PYEOF'
#!/usr/bin/env python3
"""Sync project context across all CLI harnesses."""
import os
import shutil

HARNESSES = ["CLAUDE_CODE", "CODEX", "GEMINI_CLI", "KIMI_CODE", "HERMES_AGENT", "OPENCODE"]
ROOT = os.path.dirname(os.path.dirname(__file__))

def sync():
    # Example: propagate shared conventions to all CLI .md files
    print("Syncing shared context across CLI harnesses...")
    for h in HARNESSES:
        path = os.path.join(ROOT, h, f"{h}.md")
        if os.path.exists(path):
            print(f"  ✓ {h}")
    print("Done.")

if __name__ == "__main__":
    sync()
PYEOF
chmod +x "12__CLI_HARNESSES/_SHARED/context_sync.py"

cat > "12__CLI_HARNESSES/_SHARED/token_router.py" <<'PYEOF'
#!/usr/bin/env python3
"""Route tasks to the cheapest capable CLI."""
import yaml
import os

# TODO: implement cost-based routing with fallback chains

def route(task_type: str, complexity: str) -> str:
    routes = {
        "creative_writing": "HERMES_AGENT",
        "deep_research": "KIMI_CODE",
        "google_workspace": "GEMINI_CLI",
        "code_review": "CLAUDE_CODE",
        "bug_hunt": "CODEX",
    }
    return routes.get(task_type, "CLAUDE_CODE")

if __name__ == "__main__":
    import sys
    print(route(sys.argv[1], sys.argv[2]) if len(sys.argv) > 2 else "CLAUDE_CODE")
PYEOF
chmod +x "12__CLI_HARNESSES/_SHARED/token_router.py"

# ── MISC Auto-Sorter ────────────────────────────────────────
echo "🗑️  Initializing MISC Auto-Sorter..."

cat > "13__MISC/SORTER_CONFIG/rules.yaml" <<'EOF'
rules:
  - pattern: "*.{png,jpg,jpeg,gif,svg,webp,avif}"
    destination: "03__ASSETS/images/"
    description: "Image assets"

  - pattern: "*.{mp4,mov,avi,webm,mkv}"
    destination: "03__ASSETS/video/"
    description: "Video assets"

  - pattern: "*.{mp3,wav,flac,aac,ogg}"
    destination: "03__ASSETS/audio/"
    description: "Audio assets"

  - pattern: "*.{md,txt,rst,org}"
    destination: "06__KNOWLEDGE_VAULT/00__INBOX/"
    description: "Text notes for vault processing"

  - pattern: "*.{py,js,ts,jsx,tsx,rs,go,java,kt,swift,c,cpp,h,hpp,rb,php}"
    destination: "02__BACKEND/snippets/"
    description: "Code snippets"

  - pattern: "*.{log,tmp,temp,cache}"
    destination: "14__ARCHIVE/temp/"
    description: "Temporary files"

  - pattern: "*.{zip,tar,gz,tgz,7z,rar,bz2}"
    destination: "14__ARCHIVE/backups/"
    description: "Compressed archives"

  - pattern: "*.{pdf,doc,docx,xls,xlsx,ppt,pptx,odt,ods}"
    destination: "00__DOCUMENTATION/imports/"
    description: "Imported documents"

  - pattern: "*.{sql,dump,db,sqlite,sqlite3}"
    destination: "07__MEMORY_SYSTEM/SQLITE/imports/"
    description: "Database files"

  - pattern: "*.{json,jsonl,yaml,yml,toml,xml,csv,parquet}"
    destination: "02__BACKEND/data/"
    description: "Data files"

  - pattern: "*.{html,htm,css,scss,less,vue,svelte}"
    destination: "01__FRONTEND/snippets/"
    description: "Frontend snippets"

  - pattern: "*.{drawio,excalidraw,puml,mmd}"
    destination: "00__DOCUMENTATION/diagrams/"
    description: "Diagrams"

  - pattern: "*.{pem,key,crt,csr,p12,env,secrets}"
    destination: "14__ARCHIVE/deprecated/"
    description: "SECURITY RISK — manual review required"
    action: "quarantine"
EOF

cat > "13__MISC/SORTER_CONFIG/dry_run.sh" <<'EOF'
#!/bin/bash
# Preview what auto_sort_misc.sh would do without moving files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "${SCRIPT_DIR}/ml_classifier.py" --dry-run 2>/dev/null || echo "ml_classifier.py not yet implemented. Rules-only preview."
EOF
chmod +x "13__MISC/SORTER_CONFIG/dry_run.sh"

cat > "13__MISC/SORTER_CONFIG/ml_classifier.py" <<'PYEOF'
#!/usr/bin/env python3
"""Optional AI-based file classifier for the MISC sorter."""
import argparse
import os
import sys

def classify(path: str) -> dict:
    # TODO: integrate with a lightweight local model for content-based classification
    return {"destination": "UNKNOWN", "confidence": 0.0, "reason": "stub"}

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    print("ml_classifier: stub implementation")

if __name__ == "__main__":
    main()
PYEOF
chmod +x "13__MISC/SORTER_CONFIG/ml_classifier.py"

# ── Archive Placeholders ────────────────────────────────────
mkdir -p "14__ARCHIVE/logs"
mkdir -p "14__ARCHIVE/temp"
mkdir -p "14__ARCHIVE/backups"
mkdir -p "14__ARCHIVE/deprecated"

# ── Final Report ────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ ARKITEKT SCAFFOLD COMPLETE                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Structure: ${PROJECT_ROOT}"
echo ""
echo "Next steps:"
echo "  1. Spawn agents:   ./10__SCRIPTS/INIT_AGENT.sh <NAME> <ROLE>"
echo "  2. Sort junk:      ./10__SCRIPTS/auto_sort_misc.sh"
echo "  3. Update system:  ./10__SCRIPTS/SYSTEM_MAINTENANCE/UPDATE_ALL.sh"
echo "  4. Start Qdrant:   docker compose -f 07__MEMORY_SYSTEM/QDRANT/docker-compose.qdrant.yml up -d"
echo ""
echo "🏗️  Touch the impossible, arkitekt."
echo ""
