# HERMES_AGENT Swarm Integration

## Role
This harness connects HERMES_AGENT to the Arkitekt swarm.

## Entry Points
- Primary: `05__AGENTS/_ORCHESTRATOR/`
- Memory: `07__MEMORY_SYSTEM/`
- Logs: `07__MEMORY_SYSTEM/CLI_SESSIONS/HERMES_AGENT/`

## Installation
Hermes Agent is a custom/local tool. Install via your preferred package manager:
```bash
npm install -g hermes-agent
# or
pip install hermes-agent
# or
brew install hermes-agent
```

## Usage
Source the harness aliases:
```bash
source 12__CLI_HARNESSES/HERMES_AGENT/ALIASES.sh
```

Or use the master loader to load all harnesses at once:
```bash
source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
```

## Aliases
- `hermes` — Launch with project context
- `hermes-dashboard` — Dashboard mode
- `hermes-brainstorm` — Brainstorm mode
- `hermes-skills` — List skills
- `hermes-swarm` — Full swarm context
