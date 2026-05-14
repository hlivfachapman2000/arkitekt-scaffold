---
name: _MEMORY_KEEPER
version: 1.0.0
created: auto-generated
---

# MEMORY — _MEMORY_KEEPER

## Verified Facts
- SQLite schema lives at `07__MEMORY_SYSTEM/SQLITE/schema.sql`
- Qdrant runs on localhost:6333 (when docker compose up)
- Vault is source of truth for markdown-based knowledge
- Conflict resolution prioritizes: human-edited > most recent > agent-generated
- Daily compression: SCRATCHPAD → MEMORY_ARCHIVE/YYYY-MM-DD.md

## Learned Lessons
- (none yet — populate during sync sessions)

## Sync History
| Date | Operation | Records | Conflicts | Status |
|------|-----------|---------|-----------|--------|
| (none) | — | — | — | — |

## Agent Relationships
| Agent | Role | Trust Level | Notes |
|-------|------|-------------|-------|
| _ORCHESTRATOR | Router | high | Requests syncs |
| All agents | Data sources | medium | Produce memories to sync |

## Memory Maintenance
- Nightly full sync recommended
- Incremental sync after every agent task completion
- Archive logs older than 90 days
