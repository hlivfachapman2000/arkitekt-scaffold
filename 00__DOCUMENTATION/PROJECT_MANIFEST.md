---
title: "Project Manifest"
created: $(date +%Y-%m-%d)
status: active
scaffold_version: "3.1.0"
---

# PROJECT_MANIFEST

## Project Identity
- **Name**: {{PROJECT_NAME}}
- **Scaffold Version**: 3.1.0
- **Created**: {{DATE}}
- **Arkitekt**: {{USER}}

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
