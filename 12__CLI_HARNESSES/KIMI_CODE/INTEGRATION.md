# KIMI_CODE Swarm Integration

## Role
This harness connects KIMI_CODE to the Arkitekt swarm.

## Entry Points
- Primary: `05__AGENTS/_ORCHESTRATOR/`
- Memory: `07__MEMORY_SYSTEM/`
- Logs: `07__MEMORY_SYSTEM/CLI_SESSIONS/KIMI_CODE/`

## Installation
```bash
npm install -g kimi-code
# or
npx -y kimi-code
```

## Usage
Source the harness aliases:
```bash
source 12__CLI_HARNESSES/KIMI_CODE/ALIASES.sh
```

Or use the master loader to load all harnesses at once:
```bash
source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
```

## Aliases
- `kimi` — Launch with project context
- `kimi-long` — Max context window
- `kimi-research` — Research mode
- `kimi-swarm` — Full swarm context

## Environment
Requires `MOONSHOT_API_KEY` in `.env`.
