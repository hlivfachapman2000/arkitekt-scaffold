# 🏗️ Arkitekt CLI Dashboard

Terminal-native control center for the entire Arkitekt swarm — built with Python Textual.

## 📐 Layout

```
┌─────────────────────────────────────────────────────────┐
│  🏗️ Arkitekt Dashboard          Touch the impossible    │
├─────────────────────────────────────────────────────────┤
│  [⚡Orchestrator] [🤖Agents] [🎨Code] [🏗️Infra] [🧠Memory] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────┐  ┌──────────────────┐ │
│  │   Command Console           │  │ ⚡ Live Execution │ │
│  │   arkitekt> _               │  │                  │ │
│  │                             │  │ [22:31] ORCH →   │ │
│  │   (70% width — main area)   │  │ [22:28] SNIP →   │ │
│  └─────────────────────────────┘  └──────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  q:Quit  │  1-9,0:Tabs  │  /:Search  │  ctrl+s:Settings │
└─────────────────────────────────────────────────────────┘
```

## 🎹 Tabs (Keys 1-9, 0)

| Key | Tab | What's Inside |
|-----|-----|---------------|
| 1 | ⚡ Orchestrator | Command console (70%) + Live execution trace (30%) |
| 2 | 🤖 Agents | Swarm tree view — meta agents, active agents, superpowers |
| 3 | 🎨 Code | Framework picker — Aceternity UI, shadcn, Framer, Three.js, etc. |
| 4 | 🏗️ Infra | File server indexer, DBs visualized, services |
| 5 | 🧠 Memory | SQLite + Qdrant + OpenViking + Obsidian vault stats |
| 6 | 🔬 Research | ASCII grid map — probes, visited, queued, OSINT |
| 7 | 📜 Scripts | Full arsenal — maintenance, agents, Smart Drop, CLAW3D |
| 8 | 💰 Tokens | Economics — $1880/month savings from free tools! |
| 9 | 📜 History | Merged with archive — git commits + execution log |
| 0 | 📚 Vault | Most important info — evergreen notes, ADRs, people |

## 🛠️ Console Commands

```
help                    # Show all commands
agents                  # List swarm
status                  # System status
vault                   # Open vault
search <query>          # Search everything
git <cmd>               # Git operations
drop <path>             # Drop into Smart Pipeline
update                  # Run maintenance
```

## 🚀 Install & Run

```bash
# Quick install
./install.sh

# Or manual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py

# Launch
arkitekt-dashboard
```

## 🎮 Shortcuts

- `q` — Quit
- `1-9, 0` — Switch tabs
- `/` — Focus search
- `ctrl+s` — Settings
- `ctrl+h` — History
- `ctrl+g` — Git sync