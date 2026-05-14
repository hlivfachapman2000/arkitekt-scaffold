#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Codex CLI Harness — Arkitekt Scaffold v3.1
# ═══════════════════════════════════════════════════════════════

# ── Resolve project root (two levels up from this file) ─────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# ── Source environment ────────────────────────────────────────
if [ -f "${PROJECT_ROOT}/.env" ]; then
    # shellcheck source=/dev/null
    source "${PROJECT_ROOT}/.env"
    # Export only the key this CLI needs (avoids leaking all secrets to child processes)
    [ -n "${OPENAI_API_KEY:-}" ] && export OPENAI_API_KEY
fi

# ── Codex binary detection ────────────────────────────────────
CODEX_BIN=""
if command -v codex >/dev/null 2>&1; then
    CODEX_BIN="codex"
elif command -v npx >/dev/null 2>&1; then
    CODEX_BIN="npx -y @openai/codex"
fi

# ── Install helper ────────────────────────────────────────────
_arkitekt_codex_install() {
    echo "🔧 OpenAI Codex CLI is not installed."
    echo ""
    echo "Install options:"
    echo "  npm:     npm install -g @openai/codex"
    echo "  npx:     npx -y @openai/codex"
    echo ""
    echo "After installing, reload your shell or run:"
    echo "  source 12__CLI_HARNESSES/CODEX/ALIASES.sh"
    return 1
}

# ── Launch with context ───────────────────────────────────────
_arkitekt_codex_launch() {
    local -a ctx_args=()
    if [ -d "${PROJECT_ROOT}/05__AGENTS" ]; then
        ctx_args+=("--context-dir" "${PROJECT_ROOT}/05__AGENTS/")
    fi
    if [ -d "${PROJECT_ROOT}/00__DOCUMENTATION" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/00__DOCUMENTATION/PROJECT_MANIFEST.md")
    fi
    if [ -n "${OPENAI_API_KEY:-}" ]; then
        export OPENAI_API_KEY
    fi
    # shellcheck disable=SC2086
    ${CODEX_BIN} "${ctx_args[@]}" "$@"
}

# ── Public functions ──────────────────────────────────────────
cx() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    _arkitekt_codex_launch "$@"
}

cx-review() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    ${CODEX_BIN} --review "$@"
}

cx-cloud() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    ${CODEX_BIN} --model gpt-4o "$@"
}

cx-fast() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    ${CODEX_BIN} --model gpt-4o-mini "$@"
}

cx-tdd() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    ${CODEX_BIN} --mode test-driven "$@"
}

cx-debug() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    ${CODEX_BIN} --mode debug "$@"
}

cx-swarm() {
    if [ -z "$CODEX_BIN" ]; then
        _arkitekt_codex_install
        return 1
    fi
    ${CODEX_BIN} --context-dir "${PROJECT_ROOT}/05__AGENTS/" "$@"
}

# ── Self-launch mode ──────────────────────────────────────────
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cx "$@"
fi
