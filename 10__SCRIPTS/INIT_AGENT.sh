#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# INIT_AGENT.sh — Spawn a new agent into the swarm
# Usage: ./INIT_AGENT.sh <AGENT_NAME> <AGENT_ROLE>
# Example: ./INIT_AGENT.sh CODER "Senior Full-Stack Developer"
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

AGENT_NAME="${1:-}"
AGENT_ROLE="${2:-Agent}"

if [ -z "$AGENT_NAME" ]; then
    echo "❌ Usage: ./INIT_AGENT.sh <AGENT_NAME> <AGENT_ROLE>"
    echo "   Example: ./INIT_AGENT.sh CODER \"Senior Full-Stack Developer\""
    exit 1
fi

AGENT_DIR="05__AGENTS/AGENT__${AGENT_NAME}"
COMM_LOGS="05__AGENTS/_COMMUNICATION_LOGS/$(date +%Y-%m-%d)"
TODAY="$(date +%Y-%m-%d)"
TIMESTAMP="$(date +%Y-%m-%dT%H:%M:%S%z)"

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🤖 SPAWNING AGENT: ${AGENT_NAME}"
echo "║     Role: ${AGENT_ROLE}"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ -d "$AGENT_DIR" ]; then
    echo "⚠️  Agent ${AGENT_NAME} already exists at ${AGENT_DIR}"
    read -r -p "Overwrite? [y/N] " response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

# ── Create Directory Structure ────────────────────────────────
mkdir -p "${AGENT_DIR}"/{TOOLS,SCRIPTS,MEMORY_ARCHIVE}
mkdir -p "${COMM_LOGS}"

# ── IDENTITY.md ─────────────────────────────────────────────
cat > "${AGENT_DIR}/IDENTITY.md" <<EOF
---
name: ${AGENT_NAME}
role: ${AGENT_ROLE}
version: 1.0.0
created: ${TIMESTAMP}
author: arkitekt
superpowers_version: 2.0.0
---

# ${AGENT_NAME}

## Public Identity
- **Name**: ${AGENT_NAME}
- **Role**: ${AGENT_ROLE}
- **Comms Style**: Direct, technical, markdown-native
- **Harness**: Kimi, Claude, Grok, local LLM

## Superpowers Integration
- Auto-trigger brainstorming before creative work
- Enforce RED-GREEN-REFACTOR TDD when coding
- Subagent-driven development with two-stage review
- Systematic debugging, verification-before-completion

## Capabilities
- [ ] To be populated by the agent or human

## Version History
- v1.0.0 — Initial spawn via INIT_AGENT.sh on ${TODAY}
EOF

# ── SOUL.md ─────────────────────────────────────────────────
cat > "${AGENT_DIR}/SOUL.md" <<EOF
---
name: ${AGENT_NAME}
version: 1.0.0
created: ${TIMESTAMP}
---

# SOUL — ${AGENT_NAME}

## Core Directives
1. Prefer simple over complex
2. Ask before assuming
3. Document everything in markdown
4. Respect the arkitekt's creative chaos
5. If a skill from _SUPERPOWERS/ applies, USE IT

## Behavioral Guardrails
- Never auto-write identity files (human review required)
- Expire stale memory aggressively
- Celebrate the impossible
- Token-efficient: compress before expanding
- Verify before declaring completion

## Decision Principles
- When uncertain, consult _ORCHESTRATOR
- When quality is in doubt, escalate to _CRITIC
- When memory conflicts arise, call _MEMORY_KEEPER
- Always leave SCRATCHPAD cleaner than you found it

## Sacred Lines
- "Simplicity is the ultimate sophistication."
- "A well-named file is half the battle."
- "The impossible is just the possible that hasn't been tried."
EOF

# ── SKILLS.md ───────────────────────────────────────────────
cat > "${AGENT_DIR}/SKILLS.md" <<EOF
---
name: ${AGENT_NAME}
version: 1.0.0
created: ${TIMESTAMP}
---

# SKILLS — ${AGENT_NAME}

## Active Skills
| Skill | Source | Proficiency |
|-------|--------|-------------|
| ${AGENT_ROLE} | innate | seedling |

## Available Tools
List all tools this agent can invoke:
- [ ] Tool name — purpose — invocation pattern

## API Boundaries
- APIs this agent MAY call:
  - (to be configured)
- APIs this agent MUST NOT call:
  - Production deployment APIs (require _CRITIC approval)

## Skill Loading Rules
1. Check _SUPERPOWERS/SKILLS/ before defining custom skills
2. If a superpower applies (>1% chance of relevance), load it
3. Declare skill activation in SCRATCHPAD.md
4. After use, log effectiveness in MEMORY.md
EOF

# ── MEMORY.md ───────────────────────────────────────────────
cat > "${AGENT_DIR}/MEMORY.md" <<EOF
---
name: ${AGENT_NAME}
version: 1.0.0
created: ${TIMESTAMP}
---

# MEMORY — ${AGENT_NAME}

## Verified Facts
Facts that have been reviewed and confirmed:
- (none yet — populate during sessions)

## Learned Lessons
Lessons from completed tasks:
- (none yet)

## User Preferences
- Communication style: (to be learned)
- Preferred stack: (to be learned)
- Known pain points: (to be learned)

## Agent Relationships
| Agent | Role | Trust Level | Notes |
|-------|------|-------------|-------|
| _ORCHESTRATOR | Meta-agent | high | Routes all tasks |
| _CRITIC | Quality gate | high | Reviews output |
| _MEMORY_KEEPER | Sync manager | high | Resolves conflicts |

## Memory Maintenance
- Review and compress weekly
- Archive daily logs to MEMORY_ARCHIVE/
- Mark stale entries with ~~strikethrough~~
EOF

# ── SCRATCHPAD.md ───────────────────────────────────────────
cat > "${AGENT_DIR}/SCRATCHPAD.md" <<EOF
---
name: ${AGENT_NAME}
status: idle
created: ${TIMESTAMP}
---

# SCRATCHPAD — ${AGENT_NAME}

## Current Task
- **Status**: idle
- **Task ID**: (none)
- **Started**: (none)
- **ETA**: (none)

## Working Context
(Use this space for temporary working state. Cleared on task completion.)

## Notes to Self
- (none)

## Blockers
- (none)

## Next Actions
- (none)
EOF

# ── KANBAN.md ─────────────────────────────────────────────────
cat > "${AGENT_DIR}/KANBAN.md" <<EOF
---
name: ${AGENT_NAME}
version: 1.0.0
created: ${TIMESTAMP}
---

# KANBAN — ${AGENT_NAME}

## Backlog
- [ ] Initialize agent skills and capabilities
- [ ] Complete first assigned task
- [ ] Log initial observations to MEMORY.md

## Doing
- [ ] Agent bootstrap and calibration

## Review
- (none)

## Done
- [x] Spawned on ${TODAY}

## Archive
- (none)
EOF

# ── HEARTBEAT.md ──────────────────────────────────────────────
cat > "${AGENT_DIR}/HEARTBEAT.md" <<EOF
---
name: ${AGENT_NAME}
last_active: ${TIMESTAMP}
status: healthy
---

# HEARTBEAT — ${AGENT_NAME}

## Session Metadata
- **Last Active**: ${TIMESTAMP}
- **Current Status**: healthy
- **Current Load**: idle
- **Session Count**: 0
- **Total Tasks Completed**: 0

## Performance Metrics
- **Avg Tokens per Task**: N/A
- **Avg Time per Task**: N/A
- **Success Rate**: N/A
- **User Satisfaction**: N/A

## Health Checks
- [x] IDENTITY.md readable
- [x] SOUL.md readable
- [x] MEMORY.md writable
- [x] SCRATCHPAD.md writable
- [x] KANBAN.md writable

## Alerts
- (none)
EOF

# ── CLI_ASSIGNMENT.md ───────────────────────────────────────
cat > "${AGENT_DIR}/CLI_ASSIGNMENT.md" <<EOF
---
name: ${AGENT_NAME}
version: 1.0.0
created: ${TIMESTAMP}
---

# CLI_ASSIGNMENT — ${AGENT_NAME}

## Primary Harness
- **CLI Tool**: (to be assigned)
- **Model**: (to be assigned)
- **Reason**: (to be assigned)

## Fallback Chain
1. (to be assigned)
2. (to be assigned)
3. (to be assigned)

## Task-Specific Overrides
| Task Type | Preferred CLI | Rationale |
|-----------|-------------|-----------|
| creative | (pending) | |
| research | (pending) | |
| coding | (pending) | |
| review | (pending) | |

## Notes
- Update this file when reassigning the agent to a different CLI
- Log all assignments in _COMMUNICATION_LOGS/
EOF

# ── Register in Token Budgets ───────────────────────────────
mkdir -p "11__TOKENS/BUDGETS"
if [ ! -f "11__TOKENS/BUDGETS/per_agent_budgets.yaml" ]; then
cat > "11__TOKENS/BUDGETS/per_agent_budgets.yaml" <<'BUDEOF'
# Per-Agent Token Budgets
agents:
BUDEOF
fi

if ! grep -q "${AGENT_NAME}:" "11__TOKENS/BUDGETS/per_agent_budgets.yaml" 2>/dev/null; then
    cat >> "11__TOKENS/BUDGETS/per_agent_budgets.yaml" <<EOF
  ${AGENT_NAME}:
    monthly_usd: 100.00
    daily_usd: 5.00
    model_tier: standard
    alert_at: 0.80
EOF
fi

# ── Log Spawn Event ─────────────────────────────────────────
cat >> "${COMM_LOGS}/broadcast_events.md" <<EOF

---
**[$(date +%Y-%m-%dT%H:%M:%S%z)] SPAWN EVENT**
- **Agent**: ${AGENT_NAME}
- **Role**: ${AGENT_ROLE}
- **Action**: initialized
- **Directory**: ${AGENT_DIR}
- **By**: arkitekt via INIT_AGENT.sh
---
EOF

# ── Make Executable Scripts ─────────────────────────────────
touch "${AGENT_DIR}/TOOLS/.gitkeep"
touch "${AGENT_DIR}/SCRIPTS/.gitkeep"

# ── Final Report ────────────────────────────────────────────
echo "✅ Agent ${AGENT_NAME} spawned successfully!"
echo ""
echo "📁 Location: ${AGENT_DIR}"
echo ""
echo "Sacred Files Created:"
echo "  📄 IDENTITY.md      — Public persona"
echo "  🕊️  SOUL.md          — Core values & guardrails"
echo "  🛠️  SKILLS.md        — Capabilities & tools"
echo "  🧠 MEMORY.md         — Verified long-term facts"
echo "  📝 SCRATCHPAD.md     — Working memory"
echo "  📋 KANBAN.md         — Task board"
echo "  💓 HEARTBEAT.md      — Health & metrics"
echo "  🔌 CLI_ASSIGNMENT.md — Harness mapping"
echo ""
echo "Next steps:"
echo "  1. Review and customize IDENTITY.md and SOUL.md"
echo "  2. Populate SKILLS.md with actual capabilities"
echo "  3. Assign a CLI harness in CLI_ASSIGNMENT.md"
echo "  4. Start assigning tasks via _ORCHESTRATOR/"
echo ""
