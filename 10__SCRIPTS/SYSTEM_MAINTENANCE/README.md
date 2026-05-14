# 🔧 ARKITEKT SYSTEM MAINTENANCE

One script to update EVERYTHING on your system.

## 📦 What's Included

| Script | What It Updates |
|--------|----------------|
| `UPDATE_ALL.sh` | **Master script** — runs everything below |
| `UPDATE_BREW.sh` | Homebrew formulas + casks |
| `UPDATE_NPM.sh` | npm global packages |
| `UPDATE_PIP.sh` | Python pip packages |
| `UPDATE_CARGO.sh` | Rust Cargo crates |
| `UPDATE_GEM.sh` | Ruby gems |
| `UPDATE_MAS.sh` | Mac App Store apps |
| `UPDATE_VSCODE.sh` | VS Code extensions |
| `UPDATE_MACOS.sh` | macOS system software |
| `UPDATE_DOCKER.sh` | Docker images |
| `UPDATE_OHMYZSH.sh` | Oh My Zsh framework |
| `UPDATE_FISH.sh` | Fish shell plugins |
| `UPDATE_NVM.sh` | NVM Node versions |
| `UPDATE_FNM.sh` | FNM Node versions |
| `UPDATE_RUSTUP.sh` | Rustup toolchains |
| `UPDATE_PYENV.sh` | Pyenv Python versions |
| `UPDATE_TOPGRADE.sh` | Wrapper for [topgrade](https://github.com/topgrade-rs/topgrade) |

## 🚀 Quick Start

```bash
# Make everything executable
chmod +x *.sh

# Run the master script
./UPDATE_ALL.sh

# Or run just one thing
./UPDATE_BREW.sh
```

## 🔄 Auto-Scheduling

### Option A: Cron (Linux/macOS)
```bash
# Edit crontab
crontab -e

# Add this line — runs every Sunday at 3 AM:
0 3 * * 0 cd /path/to/ARKITEKT_SYSTEM_MAINTENANCE && ./UPDATE_ALL.sh
```

### Option B: macOS Launchd
```bash
# 1. Edit the plist to set your actual script path
sed -i '' 's|__SCRIPT_PATH__|/path/to/ARKITEKT_SYSTEM_MAINTENANCE|g' \
    com.arkitekt.system-maintenance.plist

# 2. Copy to LaunchAgents
cp com.arkitekt.system-maintenance.plist ~/Library/LaunchAgents/

# 3. Load it
launchctl load ~/Library/LaunchAgents/com.arkitekt.system-maintenance.plist

# 4. Verify it's loaded
launchctl list | grep arkitekt
```

## 🎯 Topgrade Alternative

If you prefer [topgrade](https://github.com/topgrade-rs/topgrade) (Rust-based, auto-detects everything):

```bash
# Install topgrade
cargo install topgrade

# Run with arkitekt config
./UPDATE_TOPGRADE.sh
```

## 📊 Logging

All logs go to `logs/YYYY-MM/`:
- `update_YYYY-MM-DD_HH-MM-SS.log` — Full terminal output
- `report_YYYY-MM-DD_HH-MM-SS.md` — Markdown summary report

Old logs auto-archive to `../../14__ARCHIVE/logs/` after 30 days.

## 🏗️ Integration with Arkitekt Swarm

Drop the generated report into your vault:
```bash
cp logs/2026-05/report_*.md ../06__KNOWLEDGE_VAULT/05__DECISIONS/
```

---
*Part of the Arkitekt Universal Project Scaffold v3.1*
