# OPENCODE Swarm Integration

## Role
This harness connects OPENCODE to the Arkitekt swarm.

## Entry Points
- Primary: `05__AGENTS/_ORCHESTRATOR/`
- Memory: `07__MEMORY_SYSTEM/`
- Logs: `07__MEMORY_SYSTEM/CLI_SESSIONS/OPENCODE/`

## Installation
```bash
brew install opencode
# or
npm install -g opencode
# or
npx -y opencode
```

## Usage
Source the harness aliases:
```bash
source 12__CLI_HARNESSES/OPENCODE/ALIASES.sh
```

Or use the master loader to load all harnesses at once:
```bash
source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
```

## Aliases
- `oc` — Launch with project context
- `oc-swarm` — Full swarm context
