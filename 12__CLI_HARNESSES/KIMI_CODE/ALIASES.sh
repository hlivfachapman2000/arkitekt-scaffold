#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Kimi Code CLI Harness — Arkitekt Scaffold v3.1
# ═══════════════════════════════════════════════════════════════

# ── Resolve project root (two levels up from this file) ─────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# ── Source environment ────────────────────────────────────────
if [ -f "${PROJECT_ROOT}/.env" ]; then
    # shellcheck source=/dev/null
    source "${PROJECT_ROOT}/.env"
    # Export only the key this CLI needs (avoids leaking all secrets to child processes)
    [ -n "${MOONSHOT_API_KEY:-}" ] && export MOONSHOT_API_KEY
fi

# ── Kimi binary detection ─────────────────────────────────────
KIMI_BIN=""
if command -v kimi-code >/dev/null 2>&1; then
    KIMI_BIN="kimi-code"
elif command -v npx >/dev/null 2>&1; then
    KIMI_BIN="npx -y kimi-code"
fi

# ── Install helper ────────────────────────────────────────────
_arkitekt_kimi_install() {
    echo "🔧 Kimi Code CLI is not installed."
    echo ""
    echo "Install options:"
    echo "  npm:     npm install -g kimi-code"
    echo "  npx:     npx -y kimi-code"
    echo ""
    echo "After installing, reload your shell or run:"
    echo "  source 12__CLI_HARNESSES/KIMI_CODE/ALIASES.sh"
    return 1
}

# ── Launch with context ───────────────────────────────────────
_arkitekt_kimi_launch() {
    local -a ctx_args=()
    if [ -d "${PROJECT_ROOT}/05__AGENTS" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/05__AGENTS/")
    fi
    if [ -d "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/")
    fi
    if [ -n "${MOONSHOT_API_KEY:-}" ]; then
        export MOONSHOT_API_KEY
    fi
    # shellcheck disable=SC2086
    ${KIMI_BIN} "${ctx_args[@]}" "$@"
}

# ── Public functions ──────────────────────────────────────────
kimi() {
    if [ -z "$KIMI_BIN" ]; then
        _arkitekt_kimi_install
        return 1
    fi
    _arkitekt_kimi_launch "$@"
}

kimi-long() {
    if [ -z "$KIMI_BIN" ]; then
        _arkitekt_kimi_install
        return 1
    fi
    ${KIMI_BIN} --context-window max "$@"
}

kimi-research() {
    if [ -z "$KIMI_BIN" ]; then
        _arkitekt_kimi_install
        return 1
    fi
    ${KIMI_BIN} --mode research "$@"
}

kimi-swarm() {
    if [ -z "$KIMI_BIN" ]; then
        _arkitekt_kimi_install
        return 1
    fi
    ${KIMI_BIN} \
        --context "${PROJECT_ROOT}/05__AGENTS/" \
        --context "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/" \
        "$@"
}

# ── Self-launch mode ──────────────────────────────────────────
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    kimi "$@"
fi
