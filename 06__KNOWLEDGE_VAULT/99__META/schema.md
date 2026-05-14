---
title: "Vault Constitution"
created: $(date +%Y-%m-%d)
status: evergreen
---

# Vault Constitution

## Frontmatter Schema
Every note MUST include:
```yaml
---
title: "Note Title"
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [concept, backend, agent-swarm]
status: seedling | budding | evergreen
source: "URL or reference"
agents: [agent_name, agent_name]
---
```

## Status Definitions
- **seedling**: Raw capture, unprocessed
- **budding**: Organized, linked, but evolving
- **evergreen**: Mature, atomic, referenced often

## Linking Rules
- Use wikilinks: `[[Note Name]]`
- Prefer atomic notes (one idea per file)
- Tag aggressively for agent discoverability
