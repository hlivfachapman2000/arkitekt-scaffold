#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# UPDATE_ALL.sh — Arkitekt System Maintenance
# Updates Homebrew, npm, pip, cargo, and more with full logging.
# Usage: ./UPDATE_ALL.sh [--topgrade]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
LOG_DIR="${SCRIPT_DIR}/logs/$(date +%Y-%m)"
mkdir -p "$LOG_DIR"
LOG_FILE="${LOG_DIR}/update_$(date +%Y-%m-%d_%H-%M-%S).log"
REPORT_FILE="${LOG_DIR}/report_$(date +%Y-%m-%d_%H-%M-%S).md"

USE_TOPGRADE=false
if [ "${1:-}" = "--topgrade" ]; then
    USE_TOPGRADE=true
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
UPDATED=0
FAILED=0
SKIPPED=0

declare -a FAILURES

log() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
    UPDATED=$((UPDATED + 1))
}

fail() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    FAILURES+=("$1")
    FAILED=$((FAILED + 1))
}

skip() {
    echo -e "${YELLOW}⏭️  $1${NC}" | tee -a "$LOG_FILE"
    SKIPPED=$((SKIPPED + 1))
}

run_step() {
    local name="$1"
    local script="$2"
    local script_path="${SCRIPT_DIR}/${script}"

    log "🔧 ${name}..."
    if [ -x "$script_path" ]; then
        if bash "$script_path" >> "$LOG_FILE" 2>&1; then
            success "$name"
        else
            fail "$name"
        fi
    else
        log "   Script not found or not executable: ${script_path}"
        fail "$name (script missing)"
    fi
}

# ═══════════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════════

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🏗️  ARKITEKT SYSTEM MAINTENANCE v3.1                   ║"
echo "║     $(date '+%Y-%m-%d %H:%M:%S')                                    ║"
echo "║     Mode: ${USE_TOPGRADE:+Topgrade}Custom Script                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════════════════
# OPTION A: TOPGRADE (Recommended)
# ═══════════════════════════════════════════════════════════════

if [ "$USE_TOPGRADE" = true ]; then
    log "🚀 Using Topgrade for unified updates..."

    if ! command -v topgrade &> /dev/null; then
        log "⚠️  Topgrade not found. Installing via cargo..."
        if command -v cargo &> /dev/null; then
            cargo install topgrade >> "$LOG_FILE" 2>&1
        else
            fail "Cannot install topgrade — cargo not found"
            echo "Install Rust/cargo first: https://rustup.rs"
            exit 1
        fi
    fi

    # Generate topgrade config if not present
    if [ ! -f "${SCRIPT_DIR}/topgrade.toml" ]; then
        cat > "${SCRIPT_DIR}/topgrade.toml" <<'EOF'
# Topgrade Config for Arkitekt
[git]
repos = [
    "~/.dotfiles",
]

[brew]
greedy_casks = true
autoclean = true

[npm]
use_sudo = false

[macos]
# accept_all_updates = true  # Use with caution

[docker]
prune = true

[pre_commands]
# Run before any updates
"Arkitekt memory sync" = "echo 'Starting system maintenance...'"

[post_commands]
# Run after all updates
"Arkitekt cleanup" = "brew cleanup && npm cache clean --force 2>/dev/null || true"
EOF
    fi

    topgrade --config "${SCRIPT_DIR}/topgrade.toml" --yes 2>&1 | tee -a "$LOG_FILE"
    success "Topgrade Complete"

    # Jump to report
    goto_report=true
else
    goto_report=false
fi

# ═══════════════════════════════════════════════════════════════
# OPTION B: CUSTOM ARKITEKT SCRIPT (Full Control)
# ═══════════════════════════════════════════════════════════════

if [ "$USE_TOPGRADE" = false ]; then

# ── macOS System ──────────────────────────────────────────────
if [[ "$OSTYPE" == "darwin"* ]]; then
    log "🔧 macOS System Software..."
    if softwareupdate -l >> "$LOG_FILE" 2>&1; then
        success "macOS System Software"
    else
        fail "macOS System Software"
    fi
fi

# ── Homebrew ──────────────────────────────────────────────────
if command -v brew &> /dev/null; then
    run_step "Homebrew Formulas & Casks" "UPDATE_BREW.sh"
else
    skip "Homebrew (not installed)"
fi

# ── npm ───────────────────────────────────────────────────────
if command -v npm &> /dev/null; then
    run_step "npm Global Packages" "UPDATE_NPM.sh"
else
    skip "npm (not installed)"
fi

# ── pip ───────────────────────────────────────────────────────
if command -v pip3 &> /dev/null || command -v pip &> /dev/null; then
    run_step "pip Packages" "UPDATE_PIP.sh"
else
    skip "pip (not installed)"
fi

# ── cargo ─────────────────────────────────────────────────────
if command -v cargo &> /dev/null; then
    run_step "Cargo Crates & Rustup" "UPDATE_CARGO.sh"
else
    skip "cargo (not installed)"
fi

# ── gem ───────────────────────────────────────────────────────
if command -v gem &> /dev/null; then
    run_step "Ruby Gems" "UPDATE_GEM.sh"
else
    skip "gem (not installed)"
fi

# ── Mac App Store ─────────────────────────────────────────────
if command -v mas &> /dev/null; then
    run_step "Mac App Store" "UPDATE_MAS.sh"
else
    skip "Mac App Store (mas not installed)"
fi

# ── VS Code Extensions ────────────────────────────────────────
if command -v code &> /dev/null; then
    run_step "VS Code Extensions" "UPDATE_VSCODE.sh"
else
    skip "VS Code CLI (not installed)"
fi

# ── Docker ────────────────────────────────────────────────────
if command -v docker &> /dev/null; then
    run_step "Docker Images" "UPDATE_DOCKER.sh"
else
    skip "Docker (not installed)"
fi

# ── Oh My Zsh ─────────────────────────────────────────────────
if [ -d "${HOME}/.oh-my-zsh" ]; then
    run_step "Oh My Zsh" "UPDATE_OHMYZSH.sh"
else
    skip "Oh My Zsh (not installed)"
fi

# ── Fish Plugins ──────────────────────────────────────────────
if command -v fish &> /dev/null && [ -d "${HOME}/.config/fish" ]; then
    run_step "Fish Plugins" "UPDATE_FISH.sh"
else
    skip "Fish (not installed)"
fi

# ── Arkitekt Memory Sync ──────────────────────────────────────
if [ -x "${PROJECT_ROOT}/10__SCRIPTS/SYNC_MEMORY.sh" ]; then
    run_step "Agent Memory Sync" "../../SYNC_MEMORY.sh"
else
    skip "Agent Memory Sync (SYNC_MEMORY.sh not found)"
fi

# ── System Cleanup ────────────────────────────────────────────
log "🧹 Running system cleanup..."

if command -v brew &> /dev/null; then
    brew cleanup >> "$LOG_FILE" 2>&1 && log "   brew cleanup OK" || true
fi
if command -v npm &> /dev/null; then
    npm cache clean --force >> "$LOG_FILE" 2>&1 && log "   npm cache clean OK" || true
fi
if command -v pip3 &> /dev/null; then
    pip3 cache purge >> "$LOG_FILE" 2>&1 && log "   pip cache purge OK" || true
fi
if command -v cargo &> /dev/null; then
    cargo cache --autoclean >> "$LOG_FILE" 2>&1 && log "   cargo cache OK" || true
fi
if command -v docker &> /dev/null; then
    docker system prune -f >> "$LOG_FILE" 2>&1 && log "   docker prune OK" || true
fi

success "System Cleanup"

fi  # end custom script path

# ═══════════════════════════════════════════════════════════════
# REPORT GENERATION
# ═══════════════════════════════════════════════════════════════

cat > "$REPORT_FILE" <<EOF
# System Maintenance Report

**Date**: $(date '+%Y-%m-%d %H:%M:%S')
**Host**: $(hostname)
**User**: $(whoami)
**Mode**: ${USE_TOPGRADE:+Topgrade}Custom Script

## Summary

| Metric | Count |
|--------|-------|
| ✅ Updated | $UPDATED |
| ❌ Failed | $FAILED |
| ⏭️ Skipped | $SKIPPED |

EOF

if [ ${#FAILURES[@]} -gt 0 ]; then
    cat >> "$REPORT_FILE" <<EOF
## Failed Steps

EOF
    for f in "${FAILURES[@]}"; do
        echo "- ❌ $f" >> "$REPORT_FILE"
    done
    echo "" >> "$REPORT_FILE"
fi

cat >> "$REPORT_FILE" <<EOF
## Detailed Log

\`\`\`
$(cat "$LOG_FILE" | tail -n 100)
\`\`\`

## Next Steps

- Review failed steps above
- Check \`11__TOKENS/\` for cost impact
- Run \`brew doctor\` if Homebrew issues persist
- Review quarantine at \`13__MISC/QUARANTINE/\` if applicable

---
*Generated by Arkitekt System Maintenance*
EOF

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
printf "║  ✅ Updated: %-3d  |  ❌ Failed: %-3d  |  ⏭️ Skipped: %-3d  ║\n" "$UPDATED" "$FAILED" "$SKIPPED"
echo "║                                                               ║"
echo "║  📄 Log:    ${LOG_FILE}"
echo "║  📊 Report: ${REPORT_FILE}"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ── Auto-archive old logs (>30 days) ────────────────────────
find "${SCRIPT_DIR}/logs" -name "*.log" -mtime +30 -exec mv {} "${PROJECT_ROOT}/14__ARCHIVE/logs/" \; 2>/dev/null || true
find "${SCRIPT_DIR}/logs" -name "report_*.md" -mtime +30 -exec mv {} "${PROJECT_ROOT}/14__ARCHIVE/logs/" \; 2>/dev/null || true
