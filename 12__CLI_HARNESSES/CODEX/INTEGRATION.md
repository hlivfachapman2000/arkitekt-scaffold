# CODEX Swarm Integration

## Role
This harness connects CODEX to the Arkitekt swarm.

## Entry Points
- Primary: `05__AGENTS/_ORCHESTRATOR/`
- Memory: `07__MEMORY_SYSTEM/`
- Logs: `07__MEMORY_SYSTEM/CLI_SESSIONS/CODEX/`

## Installation
```bash
npm install -g @openai/codex
# or
npx -y @openai/codex
```

## Usage
Source the harness aliases:
```bash
source 12__CLI_HARNESSES/CODEX/ALIASES.sh
```

Or use the master loader to load all harnesses at once:
```bash
source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
```

## Aliases
- `cx` — Launch with project context
- `cx-review` — Review mode
- `cx-cloud` — GPT-4o model
- `cx-fast` — GPT-4o-mini model
- `cx-tdd` — Test-driven mode
- `cx-debug` — Debug mode
- `cx-swarm` — Agent context

## Environment
Requires `OPENAI_API_KEY` in `.env`.
