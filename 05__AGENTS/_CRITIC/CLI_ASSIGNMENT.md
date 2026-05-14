---
name: _CRITIC
version: 1.0.0
created: auto-generated
---

# CLI_ASSIGNMENT — _CRITIC

## Primary Harness
- **CLI Tool**: CLAUDE_CODE
- **Model**: claude-3-5-sonnet-20241022
- **Reason**: Best code analysis and reasoning capabilities

## Fallback Chain
1. KIMI_CODE — long context for large diffs
2. CODEX — fast scanning of many files

## Task-Specific Overrides
| Task Type | Preferred CLI | Rationale |
|-----------|-------------|-----------|
| security_audit | CLAUDE_CODE | deep reasoning for vulnerability detection |
| style_check | CODEX | fast, cheap for linting |
| architecture_review | KIMI_CODE | large context for system analysis |

## Notes
- Must remain independent — never review work produced by the same CLI instance
- Prefer local analysis over API calls when possible
