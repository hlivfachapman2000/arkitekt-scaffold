# GEMINI_CLI Swarm Integration

## Role
This harness connects GEMINI_CLI to the Arkitekt swarm.

## Entry Points
- Primary: `05__AGENTS/_ORCHESTRATOR/`
- Memory: `07__MEMORY_SYSTEM/`
- Logs: `07__MEMORY_SYSTEM/CLI_SESSIONS/GEMINI_CLI/`

## Installation
```bash
npm install -g @google/gemini-cli
# or
npx -y @google/gemini-cli
```

## Usage
Source the harness aliases:
```bash
source 12__CLI_HARNESSES/GEMINI_CLI/ALIASES.sh
```

Or use the master loader to load all harnesses at once:
```bash
source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
```

## Aliases
- `gem` — Launch with project context
- `gem-research` — Research mode
- `gem-code` — Code mode
- `gem-swarm` — Full swarm context

## Environment
Requires `GOOGLE_API_KEY` in `.env`.
