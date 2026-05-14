---
name: _MEMORY_KEEPER
version: 1.0.0
created: auto-generated
---

# CLI_ASSIGNMENT — _MEMORY_KEEPER

## Primary Harness
- **CLI Tool**: CLAUDE_CODE
- **Model**: claude-3-5-sonnet-20241022
- **Reason**: Best for structured data processing and script writing

## Fallback Chain
1. CODEX — fast script iteration
2. Local execution (no CLI) — preferred for sync tasks to save tokens

## Task-Specific Overrides
| Task Type | Preferred CLI | Rationale |
|-----------|-------------|-----------|
| script_dev | CLAUDE_CODE | robust Python/Shell |
| data_migration | Local | no token cost for bulk ops |
| embedding_tuning | KIMI_CODE | long context for model config |

## Notes
- Prefer local execution for routine syncs (zero token cost)
- Use CLI harnesses only for complex logic development
