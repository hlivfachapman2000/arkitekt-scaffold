#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Opencode CLI Harness — Arkitekt Scaffold v3.1
# ═══════════════════════════════════════════════════════════════

# ── Resolve project root (two levels up from this file) ─────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# ── Source environment ────────────────────────────────────────
if [ -f "${PROJECT_ROOT}/.env" ]; then
    # shellcheck source=/dev/null
    source "${PROJECT_ROOT}/.env"
    # Opencode may use any provider key; export the common ones without leaking all secrets
    for _key in ANTHROPIC_API_KEY OPENAI_API_KEY GOOGLE_API_KEY MOONSHOT_API_KEY GROQ_API_KEY; do
        eval "[ -n \"\${${_key}:-}\" ] && export ${_key}"
    done
fi

# ── Opencode binary detection ─────────────────────────────────
OPENCODE_BIN=""
if command -v opencode >/dev/null 2>&1; then
    OPENCODE_BIN="opencode"
# Try common alternative names
elif command -v opencode-cli >/dev/null 2>&1; then
    OPENCODE_BIN="opencode-cli"
fi

# ── Install helper ────────────────────────────────────────────
_arkitekt_opencode_install() {
    echo "🔧 Opencode CLI is not installed."
    echo ""
    echo "Opencode is typically installed via Homebrew or npm."
    echo "Install options:"
    echo "  brew:    brew install opencode"
    echo "  npm:     npm install -g opencode"
    echo "  npx:     npx -y opencode"
    echo "  pip:     pip install opencode"
    echo ""
    echo "After installing, reload your shell or run:"
    echo "  source 12__CLI_HARNESSES/OPENCODE/ALIASES.sh"
    return 1
}

# ── Launch with context ───────────────────────────────────────
_arkitekt_opencode_launch() {
    local -a ctx_args=()
    if [ -d "${PROJECT_ROOT}/05__AGENTS" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/05__AGENTS/")
    fi
    if [ -d "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/")
    fi
    if [ -d "${PROJECT_ROOT}/00__DOCUMENTATION" ]; then
        ctx_args+=("--context" "${PROJECT_ROOT}/00__DOCUMENTATION/PROJECT_MANIFEST.md")
    fi
    # shellcheck disable=SC2086
    ${OPENCODE_BIN} "${ctx_args[@]}" "$@"
}

# ── Public functions ──────────────────────────────────────────
oc() {
    if [ -z "$OPENCODE_BIN" ]; then
        _arkitekt_opencode_install
        return 1
    fi
    _arkitekt_opencode_launch "$@"
}

oc-swarm() {
    if [ -z "$OPENCODE_BIN" ]; then
        _arkitekt_opencode_install
        return 1
    fi
    ${OPENCODE_BIN} \
        --context "${PROJECT_ROOT}/05__AGENTS/" \
        --context "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/" \
        "$@"
}

# ── Self-launch mode ──────────────────────────────────────────
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    oc "$@"
fi
