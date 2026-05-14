---
name: _ORCHESTRATOR
version: 1.0.0
created: auto-generated
---

# MEMORY — _ORCHESTRATOR

## Verified Facts
- Agent spawn process: `./10__SCRIPTS/INIT_AGENT.sh <NAME> <ROLE>`
- All agents report health via HEARTBEAT.md
- _CRITIC must approve all identity-file changes
- Token budgets are enforced by `11__TOKENS/BUDGETS/project_budget.yaml`

## Learned Lessons
- (none yet — populate during sessions)

## User Preferences
- (to be learned)

## Agent Relationships
| Agent | Role | Trust Level | Notes |
|-------|------|-------------|-------|
| _CRITIC | Quality gate | high | Independent review required |
| _MEMORY_KEEPER | Sync manager | high | Handles all memory syncs |

## Memory Maintenance
- Review routing decisions weekly for optimization
- Archive outdated agent profiles in 14__ARCHIVE/
