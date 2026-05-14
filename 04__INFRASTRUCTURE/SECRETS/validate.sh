#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# validate.sh — Verify secrets are complete, well-formed, and secure
# Usage: ./04__INFRASTRUCTURE/SECRETS/validate.sh
# Exit 0 = all good, Exit 1 = issues found
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"

ERRORS=0
WARNINGS=0

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── Helper Functions ────────────────────────────────────────
error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

ok() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# ── Safe .env parser (do NOT source — avoids arbitrary code execution) ──
env_get() {
    local key="$1"
    grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | sed "s/^${key}=//" | tail -n1
}

# Check .env exists
if [ ! -f "$ENV_FILE" ]; then
    error ".env not found at: $ENV_FILE"
    error "   Run: cp .env.example .env && fill in your secrets"
    echo ""
    echo "Summary: ${ERRORS} error(s), ${WARNINGS} warning(s)"
    exit 1
fi

# Check .env has no obvious shell syntax that would execute
if grep -qE '^[[:space:]]*(source|\.|eval|exec|command)[[:space:]]' "$ENV_FILE" 2>/dev/null; then
    warn ".env contains potential shell commands — review manually for safety"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🔐 ARKITEKT SECRETS VALIDATION                           ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ── File Security ────────────────────────────────────────────
info "Checking .env permissions..."
PERM=$(stat -f '%Lp' "$ENV_FILE" 2>/dev/null || stat -c '%a' "$ENV_FILE" 2>/dev/null || echo "unknown")
if [ "$PERM" = "600" ]; then
    ok ".env permissions: 600 (owner read/write only)"
else
    warn ".env permissions: $PERM (should be 600)"
    warn "   Fix: chmod 600 .env"
fi

# ── Strict Checks ────────────────────────────────────────────
info "Checking required variables..."

# ARKITEKT_PROJECT_NAME
ARKITEKT_PROJECT_NAME=$(env_get "ARKITEKT_PROJECT_NAME")
if [ -z "$ARKITEKT_PROJECT_NAME" ]; then
    error "ARKITEKT_PROJECT_NAME is empty"
else
    LEN=${#ARKITEKT_PROJECT_NAME}
    if [ "$LEN" -gt 64 ]; then
        error "ARKITEKT_PROJECT_NAME too long ($LEN chars, max 64)"
    else
        ok "ARKITEKT_PROJECT_NAME = $ARKITEKT_PROJECT_NAME"
    fi
fi

# ARKITEKT_ENVIRONMENT
ARKITEKT_ENVIRONMENT=$(env_get "ARKITEKT_ENVIRONMENT")
if [ -z "$ARKITEKT_ENVIRONMENT" ]; then
    error "ARKITEKT_ENVIRONMENT is empty"
else
    case "$ARKITEKT_ENVIRONMENT" in
        development|staging|production|test)
            ok "ARKITEKT_ENVIRONMENT = $ARKITEKT_ENVIRONMENT"
            ;;
        *)
            error "ARKITEKT_ENVIRONMENT = '$ARKITEKT_ENVIRONMENT' (must be development, staging, production, or test)"
            ;;
    esac
fi

# At least one LLM key
OPENAI_API_KEY=$(env_get "OPENAI_API_KEY")
ANTHROPIC_API_KEY=$(env_get "ANTHROPIC_API_KEY")
GOOGLE_API_KEY=$(env_get "GOOGLE_API_KEY")
MOONSHOT_API_KEY=$(env_get "MOONSHOT_API_KEY")
GROQ_API_KEY=$(env_get "GROQ_API_KEY")

LLM_KEYS="${OPENAI_API_KEY}${ANTHROPIC_API_KEY}${GOOGLE_API_KEY}${MOONSHOT_API_KEY}${GROQ_API_KEY}"
if [ -z "$LLM_KEYS" ]; then
    error "No LLM provider API key set (need at least one of: OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, MOONSHOT_API_KEY, GROQ_API_KEY)"
else
    ok "At least one LLM provider key is configured"
fi

# ARKITEKT_MASTER_SECRET
ARKITEKT_MASTER_SECRET=$(env_get "ARKITEKT_MASTER_SECRET")
if [ -z "$ARKITEKT_MASTER_SECRET" ]; then
    error "ARKITEKT_MASTER_SECRET is empty"
else
    LEN=${#ARKITEKT_MASTER_SECRET}
    if [ "$LEN" -lt 64 ]; then
        error "ARKITEKT_MASTER_SECRET too short ($LEN chars, need >= 64)"
    elif [ "$ARKITEKT_MASTER_SECRET" = "change-me-to-a-64-char-random-string-now-please" ]; then
        error "ARKITEKT_MASTER_SECRET is still the default dummy value"
    else
        ok "ARKITEKT_MASTER_SECRET = $(echo "$ARKITEKT_MASTER_SECRET" | head -c 8)... (${LEN} chars)"
    fi
fi

# ── Dummy Value Detection ────────────────────────────────────
info "Checking for dummy values..."

DUMMY_PATTERNS="change-me CHANGE-ME replace-me your-key-here your-api-key xxx TODO FIXME placeholder"
FOUND_DUMMY=""
for pattern in $DUMMY_PATTERNS; do
    if grep -qi "$pattern" "$ENV_FILE" 2>/dev/null; then
        FOUND_DUMMY="$FOUND_DUMMY $pattern"
    fi
done

if [ -n "$FOUND_DUMMY" ]; then
    error "Dummy values detected in .env: $FOUND_DUMMY"
    error "   Replace all placeholder values with real secrets."
else
    ok "No dummy values detected"
fi

# Check for literal ellipsis (sk-...)
if grep -E 'sk-\.\.\.|sk-ant-\.\.\.|gsk_\.\.\.' "$ENV_FILE" >/dev/null 2>&1; then
    warn "Literal ellipsis found in API keys (sk-...) — make sure these are real keys"
fi

# ── Soft Checks / Format Validation ─────────────────────────
info "Checking key formats..."

# OPENAI_API_KEY
if [ -n "$OPENAI_API_KEY" ]; then
    if [[ "$OPENAI_API_KEY" =~ ^sk-[a-zA-Z0-9]+$ ]]; then
        ok "OPENAI_API_KEY format looks valid"
    else
        warn "OPENAI_API_KEY format unexpected (should start with sk-)"
    fi
fi

# ANTHROPIC_API_KEY
if [ -n "$ANTHROPIC_API_KEY" ]; then
    if [[ "$ANTHROPIC_API_KEY" =~ ^sk-ant-api[0-9]+-[a-zA-Z0-9_-]+$ ]]; then
        ok "ANTHROPIC_API_KEY format looks valid"
    else
        warn "ANTHROPIC_API_KEY format unexpected (should start with sk-ant-api...)"
    fi
fi

# GROQ_API_KEY
if [ -n "$GROQ_API_KEY" ]; then
    if [[ "$GROQ_API_KEY" =~ ^gsk_[a-zA-Z0-9]+$ ]]; then
        ok "GROQ_API_KEY format looks valid"
    else
        warn "GROQ_API_KEY format unexpected (should start with gsk_)"
    fi
fi

# AGE_PUBLIC_KEY
AGE_PUBLIC_KEY=$(env_get "AGE_PUBLIC_KEY")
if [ -n "$AGE_PUBLIC_KEY" ]; then
    if [[ "$AGE_PUBLIC_KEY" =~ ^age1[0-9a-z]+$ ]]; then
        ok "AGE_PUBLIC_KEY format looks valid"
    else
        warn "AGE_PUBLIC_KEY format unexpected (should start with age1)"
    fi
fi

# ── Optional Variables ────────────────────────────────────────
info "Checking optional variables..."

# QDRANT
QDRANT_API_KEY=$(env_get "QDRANT_API_KEY")
QDRANT_URL=$(env_get "QDRANT_URL")
if [ -n "$QDRANT_API_KEY" ] && [ -z "$QDRANT_URL" ]; then
    warn "QDRANT_API_KEY set but QDRANT_URL is empty"
fi

# GitHub
GITHUB_TOKEN=$(env_get "GITHUB_TOKEN")
GITHUB_USERNAME=$(env_get "GITHUB_USERNAME")
if [ -n "$GITHUB_TOKEN" ] && [ -z "$GITHUB_USERNAME" ]; then
    warn "GITHUB_TOKEN set but GITHUB_USERNAME is empty"
fi

# Cloud
AWS_ACCESS_KEY_ID=$(env_get "AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY=$(env_get "AWS_SECRET_ACCESS_KEY")
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    warn "AWS_ACCESS_KEY_ID set but AWS_SECRET_ACCESS_KEY is empty"
fi

# ── Encrypted Bundle Check ────────────────────────────────────
if [ -f "${PROJECT_ROOT}/.env.age" ]; then
    ok ".env.age encrypted bundle exists"
else
    warn ".env.age not found — secrets are NOT backed up or shareable across machines"
    warn "   Fix: ./04__INFRASTRUCTURE/SECRETS/encrypt.sh"
fi

# ── Summary ─────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "║  ${GREEN}✅ ALL CHECKS PASSED${NC}                                        ║"
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "║  ${YELLOW}⚠️  $WARNINGS WARNING(S) — safe to proceed${NC}                  ║"
else
    echo -e "║  ${RED}❌ $ERRORS ERROR(S), $WARNINGS WARNING(S)${NC}                   ║"
fi
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$ERRORS" -gt 0 ]; then
    exit 1
else
    exit 0
fi
