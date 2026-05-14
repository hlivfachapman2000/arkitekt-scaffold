# CLAUDE_CODE Swarm Integration

## Role
This harness connects CLAUDE_CODE to the Arkitekt swarm.

## Entry Points
- Primary: `05__AGENTS/_ORCHESTRATOR/`
- Memory: `07__MEMORY_SYSTEM/`
- Logs: `07__MEMORY_SYSTEM/CLI_SESSIONS/CLAUDE_CODE/`

## Installation
```bash
npm install -g @anthropic-ai/claude-code
# or
npx -y @anthropic-ai/claude-code
```

## Usage
Source the harness aliases:
```bash
source 12__CLI_HARNESSES/CLAUDE_CODE/ALIASES.sh
```

Or use the master loader to load all harnesses at once:
```bash
source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
```

## Aliases
- `ccd` — Launch with project context
- `ccd-review` — Review mode
- `ccd-tdd` — Test-driven mode
- `ccd-orchestrate` — Orchestrator context
- `ccd-swarm` — Full swarm context
- `ccd-safe` — No auto-accept

## Environment
Requires `ANTHROPIC_API_KEY` in `.env`.
