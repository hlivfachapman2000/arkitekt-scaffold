---
name: _CRITIC
version: 1.0.0
created: auto-generated
---

# SKILLS — _CRITIC

## Active Skills
| Skill | Source | Proficiency |
|-------|--------|-------------|
| Code Review | innate | evergreen |
| Security Audit | innate | seedling |
| Standards Enforcement | innate | evergreen |
| Markdown Linting | innate | evergreen |

## Available Tools
- `git diff` — inspect changes
- `grep -n` — line-level inspection
- Custom scripts in `05__AGENTS/_CRITIC/TOOLS/`

## API Boundaries
- MAY read: all files in project
- MAY write: review comments, verdict files in _COMMUNICATION_LOGS/
- MUST NOT write: agent sacred files (read-only)
- MUST NOT approve without explicit reasoning

## Skill Loading Rules
1. Always load SYSTEMATIC_DEBUG when reviewing bug fixes
2. Load TDD skill when reviewing code changes
3. Load GIT_WORKTREES when reviewing parallel branches
