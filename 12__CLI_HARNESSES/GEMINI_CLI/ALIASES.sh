#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Gemini CLI Harness — Arkitekt Scaffold v3.1
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

# ── Gemini binary detection ───────────────────────────────────
GEMINI_BIN=""
if command -v gemini >/dev/null 2>&1; then
    GEMINI_BIN="gemini"
elif command -v npx >/dev/null 2>&1 && npm view @google/gemini-cli version >/dev/null 2>&1; then
    GEMINI_BIN="npx -y @google/gemini-cli"
fi

# ── Install helper ────────────────────────────────────────────
_arkitekt_gemini_install() {
    echo "🔧 Google Gemini CLI is not installed."
    echo ""
    echo "Install options:"
    echo "  npm:     npm install -g @google/gemini-cli"
    echo "  npx:     npx -y @google/gemini-cli"
    echo ""
    echo "After installing, reload your shell or run:"
    echo "  source 12__CLI_HARNESSES/GEMINI_CLI/ALIASES.sh"
    return 1
}

# ── Launch with context ───────────────────────────────────────
_arkitekt_gemini_launch() {
    local -a ctx_args=()
    if [ -d "${PROJECT_ROOT}/05__AGENTS" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/05__AGENTS/")
    fi
    if [ -d "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/")
    fi
    if [ -n "${GOOGLE_API_KEY:-}" ]; then
        export GOOGLE_API_KEY
    fi
    # shellcheck disable=SC2086
    ${GEMINI_BIN} "${ctx_args[@]}" "$@"
}

# ── Public functions ──────────────────────────────────────────
gem() {
    if [ -z "$GEMINI_BIN" ]; then
        _arkitekt_gemini_install
        return 1
    fi
    _arkitekt_gemini_launch "$@"
}

gem-research() {
    if [ -z "$GEMINI_BIN" ]; then
        _arkitekt_gemini_install
        return 1
    fi
    ${GEMINI_BIN} --mode research "$@"
}

gem-code() {
    if [ -z "$GEMINI_BIN" ]; then
        _arkitekt_gemini_install
        return 1
    fi
    ${GEMINI_BIN} --mode code "$@"
}

gem-swarm() {
    if [ -z "$GEMINI_BIN" ]; then
        _arkitekt_gemini_install
        return 1
    fi
    ${GEMINI_BIN} \
        --context "${PROJECT_ROOT}/05__AGENTS/" \
        --context "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/" \
        "$@"
}

# ── Self-launch mode ──────────────────────────────────────────
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    gem "$@"
fi
