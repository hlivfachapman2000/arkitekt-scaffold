#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Arkitekt CLI Harness Master Loader — v3.1
# Source this file to load every CLI harness alias into your shell.
#   source 12__CLI_HARNESSES/_ORCHESTRATOR/source_all.sh
# ═══════════════════════════════════════════════════════════════

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESSES_DIR="${SCRIPT_DIR}/.."

# ── Load each harness ─────────────────────────────────────────
for HARNESS in CLAUDE_CODE CODEX GEMINI_CLI KIMI_CODE HERMES_AGENT OPENCODE; do
    ALIASES_FILE="${HARNESSES_DIR}/${HARNESS}/ALIASES.sh"
    if [ -f "$ALIASES_FILE" ]; then
        # shellcheck source=/dev/null
        source "$ALIASES_FILE"
        echo "✅ Loaded ${HARNESS} harness"
    else
        echo "⚠️  Missing ${HARNESS} harness (expected ${ALIASES_FILE})"
    fi
done

echo ""
echo "🚀 Arkitekt CLI harnesses loaded. Available commands:"
echo "  Claude Code:  ccd, ccd-review, ccd-tdd, ccd-orchestrate, ccd-swarm, ccd-safe"
echo "  Codex:        cx, cx-review, cx-cloud, cx-fast, cx-tdd, cx-debug, cx-swarm"
echo "  Gemini:       gem, gem-research, gem-code, gem-swarm"
echo "  Kimi Code:    kimi, kimi-long, kimi-research, kimi-swarm"
echo "  Hermes:       hermes, hermes-dashboard, hermes-brainstorm, hermes-skills, hermes-swarm"
echo "  Opencode:     oc, oc-swarm"
echo ""
echo "💡 Not all binaries may be installed. Missing tools will show install instructions when invoked."
echo "💡 To auto-load on every shell session, add this to your ~/.zshrc or ~/.bashrc:"
echo "   source $(cd "${SCRIPT_DIR}" && pwd)/source_all.sh"
