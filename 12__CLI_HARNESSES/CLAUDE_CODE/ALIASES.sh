#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Claude Code CLI Harness — Arkitekt Scaffold v3.1
# ═══════════════════════════════════════════════════════════════

# ── Resolve project root (two levels up from this file) ─────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# ── Source environment ────────────────────────────────────────
if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    # shellcheck source=/dev/null
    source "${PROJECT_ROOT}/.env"
    set +a
fi

# ── Claude Code binary detection ──────────────────────────────
CLAUDE_BIN=""
if command -v claude >/dev/null 2>&1; then
    CLAUDE_BIN="claude"
elif command -v npx >/dev/null 2>&1 && npm view @anthropic-ai/claude-code version >/dev/null 2>&1; then
    CLAUDE_BIN="npx -y @anthropic-ai/claude-code"
fi

# ── Install helper ────────────────────────────────────────────
_arkitekt_claude_install() {
    echo "🔧 Claude Code is not installed."
    echo ""
    echo "Install options:"
    echo "  npm:     npm install -g @anthropic-ai/claude-code"
    echo "  npx:     npx -y @anthropic-ai/claude-code"
    echo ""
    echo "After installing, reload your shell or run:"
    echo "  source 12__CLI_HARNESSES/CLAUDE_CODE/ALIASES.sh"
    return 1
}

# ── Launch with context ───────────────────────────────────────
_arkitekt_claude_launch() {
    local -a ctx_args=()
    if [ -d "${PROJECT_ROOT}/05__AGENTS/_ORCHESTRATOR" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/05__AGENTS/_ORCHESTRATOR/IDENTITY.md")
    fi
    if [ -d "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/99__META/schema.md")
    fi
    if [ -d "${PROJECT_ROOT}/00__DOCUMENTATION" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/00__DOCUMENTATION/PROJECT_MANIFEST.md")
    fi
    if [ -n "${ANTHROPIC_API_KEY:-}" ]; then
        export ANTHROPIC_API_KEY
    fi
    # shellcheck disable=SC2086
    ${CLAUDE_BIN} "${ctx_args[@]}" "$@"
}

# ── Public aliases / functions ────────────────────────────────
ccd() {
    if [ -z "$CLAUDE_BIN" ]; then
        _arkitekt_claude_install
        return 1
    fi
    _arkitekt_claude_launch "$@"
}

ccd-review() {
    if [ -z "$CLAUDE_BIN" ]; then
        _arkitekt_claude_install
        return 1
    fi
    ${CLAUDE_BIN} --review "$@"
}

ccd-tdd() {
    if [ -z "$CLAUDE_BIN" ]; then
        _arkitekt_claude_install
        return 1
    fi
    ${CLAUDE_BIN} --mode test-driven "$@"
}

ccd-orchestrate() {
    if [ -z "$CLAUDE_BIN" ]; then
        _arkitekt_claude_install
        return 1
    fi
    ${CLAUDE_BIN} --context "${PROJECT_ROOT}/05__AGENTS/_ORCHESTRATOR/IDENTITY.md" "$@"
}

ccd-swarm() {
    if [ -z "$CLAUDE_BIN" ]; then
        _arkitekt_claude_install
        return 1
    fi
    ${CLAUDE_BIN} \
        --context "${PROJECT_ROOT}/05__AGENTS/_ORCHESTRATOR/" \
        --context "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/99__META/schema.md" \
        "$@"
}

ccd-safe() {
    if [ -z "$CLAUDE_BIN" ]; then
        _arkitekt_claude_install
        return 1
    fi
    ${CLAUDE_BIN} --no-auto-accept "$@"
}

# ── Self-launch mode ──────────────────────────────────────────
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    ccd "$@"
fi
