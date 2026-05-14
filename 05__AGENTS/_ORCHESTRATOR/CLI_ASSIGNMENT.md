---
name: _ORCHESTRATOR
version: 1.0.0
created: auto-generated
---

# CLI_ASSIGNMENT — _ORCHESTRATOR

## Primary Harness
- **CLI Tool**: CLAUDE_CODE
- **Model**: claude-3-5-sonnet-20241022
- **Reason**: Best reasoning for complex routing decisions

## Fallback Chain
1. KIMI_CODE — long context for swarm-wide analysis
2. CODEX — fast iteration for urgent rerouting

## Task-Specific Overrides
| Task Type | Preferred CLI | Rationale |
|-----------|-------------|-----------|
| budget_analysis | CODEX | fast, cheap |
| health_dashboard | HERMES_AGENT | Kanban integration |
| swarm_review | CLAUDE_CODE | deep reasoning |

## Notes
- Must be available at all times — prefer cloud or daemon modes
- Lowest latency harness preferred for real-time routing
