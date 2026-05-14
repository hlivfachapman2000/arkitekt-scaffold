---
name: _MEMORY_KEEPER
version: 1.0.0
created: auto-generated
---

# SKILLS — _MEMORY_KEEPER

## Active Skills
| Skill | Source | Proficiency |
|-------|--------|-------------|
| SQLite Management | innate | evergreen |
| Vector DB Sync | innate | seedling |
| Markdown Parsing | innate | evergreen |
| Conflict Resolution | innate | seedling |
| Compression & Archival | innate | seedling |

## Available Tools
- `sqlite3` — structured queries and migrations
- `07__MEMORY_SYSTEM/MEMORY_BRIDGE/sync_to_qdrant.py` — vector sync
- `07__MEMORY_SYSTEM/MEMORY_BRIDGE/sync_from_vault.py` — vault ingestion
- `07__MEMORY_SYSTEM/MEMORY_BRIDGE/conflict_resolver.py` — conflict handling

## API Boundaries
- MAY read/write: all memory system files, SQLite DB, vault files
- MAY read: agent sacred files (for sync purposes)
- MUST NOT write: agent IDENTITY.md, SOUL.md
- MUST NOT delete: verified MEMORY.md entries without _ORCHESTRATOR approval

## Skill Loading Rules
1. Load vault sync on every `--full` run
2. Load Qdrant sync only when Qdrant is available
3. Load conflict resolver when duplicate memories detected
