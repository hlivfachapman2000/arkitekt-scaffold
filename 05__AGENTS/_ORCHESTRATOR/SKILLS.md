---
name: _ORCHESTRATOR
version: 1.0.0
created: auto-generated
---

# SKILLS — _ORCHESTRATOR

## Active Skills
| Skill | Source | Proficiency |
|-------|--------|-------------|
| Routing & Delegation | innate | evergreen |
| Health Monitoring | innate | evergreen |
| Conflict Escalation | innate | evergreen |
| Token Budget Management | innate | seedling |

## Available Tools
- `12__CLI_HARNESSES/_SHARED/token_router.py` — cost-optimal CLI selection
- `05__AGENTS/*/KANBAN.md` — agent task boards
- `05__AGENTS/*/HEARTBEAT.md` — agent health status
- `11__TOKENS/BUDGETS/` — token allocation tracking

## API Boundaries
- MAY read: all agent sacred files, KANBAN, HEARTBEAT
- MAY write: _COMMUNICATION_LOGS/, broadcast_events.md
- MUST NOT write: agent IDENTITY.md, SOUL.md (human-only)
- MUST NOT approve: its own work (escalate to _CRITIC)

## Skill Loading Rules
1. Load token_router.py on every routing decision
2. Check HEARTBEAT.md before assigning load-bearing tasks
3. If uncertainty > 30%, load BRAINSTORMING skill before deciding
