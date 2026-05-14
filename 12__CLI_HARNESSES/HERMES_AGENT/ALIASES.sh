#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Hermes Agent CLI Harness — Arkitekt Scaffold v3.1
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

# ── Hermes binary detection ───────────────────────────────────
HERMES_BIN=""
if command -v hermes-agent >/dev/null 2>&1; then
    HERMES_BIN="hermes-agent"
# Try common alternative names
elif command -v hermes >/dev/null 2>&1; then
    HERMES_BIN="hermes"
fi

# ── Install helper ────────────────────────────────────────────
_arkitekt_hermes_install() {
    echo "🔧 Hermes Agent CLI is not installed."
    echo ""
    echo "Hermes Agent is a custom/local tool. Common install paths:"
    echo "  npm:     npm install -g hermes-agent"
    echo "  pip:     pip install hermes-agent"
    echo "  brew:    brew install hermes-agent"
    echo "  cargo:   cargo install hermes-agent"
    echo "  source:  git clone <repo> && make install"
    echo ""
    echo "After installing, reload your shell or run:"
    echo "  source 12__CLI_HARNESSES/HERMES_AGENT/ALIASES.sh"
    return 1
}

# ── Launch with context ───────────────────────────────────────
_arkitekt_hermes_launch() {
    local -a ctx_args=()
    if [ -d "${PROJECT_ROOT}/05__AGENTS/_SUPERPOWERS/SKILLS" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/05__AGENTS/_SUPERPOWERS/SKILLS/")
    fi
    if [ -d "${PROJECT_ROOT}/05__AGENTS" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/05__AGENTS/")
    fi
    if [ -d "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/")
    fi
    # shellcheck disable=SC2086
    ${HERMES_BIN} "${ctx_args[@]}" "$@"
}

# ── Public functions ──────────────────────────────────────────
hermes() {
    if [ -z "$HERMES_BIN" ]; then
        _arkitekt_hermes_install
        return 1
    fi
    _arkitekt_hermes_launch "$@"
}

hermes-dashboard() {
    if [ -z "$HERMES_BIN" ]; then
        _arkitekt_hermes_install
        return 1
    fi
    ${HERMES_BIN} --dashboard "$@"
}

hermes-brainstorm() {
    if [ -z "$HERMES_BIN" ]; then
        _arkitekt_hermes_install
        return 1
    fi
    ${HERMES_BIN} --mode brainstorm "$@"
}

hermes-skills() {
    if [ -z "$HERMES_BIN" ]; then
        _arkitekt_hermes_install
        return 1
    fi
    ${HERMES_BIN} --list-skills "$@"
}

hermes-swarm() {
    if [ -z "$HERMES_BIN" ]; then
        _arkitekt_hermes_install
        return 1
    fi
    ${HERMES_BIN} \
        --context "${PROJECT_ROOT}/05__AGENTS/" \
        --context "${PROJECT_ROOT}/05__AGENTS/_SUPERPOWERS/SKILLS/" \
        "$@"
}

# ── Self-launch mode ──────────────────────────────────────────
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    hermes "$@"
fi
