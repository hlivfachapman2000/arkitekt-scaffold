#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# rotate.sh — Interactive secret rotation after a leak or revocation
# Usage: ./04__INFRASTRUCTURE/SECRETS/rotate.sh
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"
ENV_EXAMPLE="${PROJECT_ROOT}/.env.example"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${RED}╔═══════════════════════════════════════════════════════════════╗"
echo -e "║  🚨 EMERGENCY SECRET ROTATION                                 ║"
echo -e "╚═══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "This script helps you rotate ALL secrets after:"
echo "  • A machine was lost or compromised"
echo "  • .env was accidentally committed"
echo "  • A team member left"
echo "  • You just want to be paranoid"
echo ""

read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo -e "${CYAN}Step 1: Revoke old API keys${NC}"
echo "───────────────────────────────────────────────────────────────"
echo "You MUST manually revoke the following keys in their provider dashboards:"
echo ""
[ -f "$ENV_FILE" ] && grep -E '^(OPENAI_API_KEY|ANTHROPIC_API_KEY|GOOGLE_API_KEY|MOONSHOT_API_KEY|GROQ_API_KEY|GITHUB_TOKEN|AWS_ACCESS_KEY_ID|DOCKER_REGISTRY_PASS)=' "$ENV_FILE" | sed 's/^/  → /' || echo "  (no .env found)"
echo ""
echo -e "${YELLOW}Go do that now. Do not continue until every key is revoked.${NC}"
read -p "Press Enter when done..."

echo ""
echo -e "${CYAN}Step 2: Generate new master secret${NC}"
echo "───────────────────────────────────────────────────────────────"
NEW_MASTER=$(openssl rand -base64 48 2>/dev/null || python3 -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(48)).decode())" 2>/dev/null || python3 -c "import os, base64; print(base64.b64encode(os.urandom(48)).decode())" 2>/dev/null)
if [ -z "$NEW_MASTER" ]; then
    echo "  ERROR: Could not generate a new master secret. Install openssl or python3."
    exit 1
fi
echo "  New ARKITEKT_MASTER_SECRET: ${NEW_MASTER:0:16}..."
echo ""

# Update .env if it exists
if [ -f "$ENV_FILE" ]; then
    _ARK_ROTATE_SECRET="$NEW_MASTER" python3 - "$ENV_FILE" << 'PYEOF'
import re, sys, os
with open(sys.argv[1], 'r') as f:
    content = f.read()
new_master = os.environ.get('_ARK_ROTATE_SECRET', '')
if new_master:
    content = re.sub(
        r'^ARKITEKT_MASTER_SECRET=.*$',
        'ARKITEKT_MASTER_SECRET=' + new_master,
        content,
        flags=re.MULTILINE
    )
    with open(sys.argv[1], 'w') as f:
        f.write(content)
PYEOF
    echo "  Updated .env with new master secret"
fi

echo ""
echo -e "${CYAN}Step 3: Generate new AGE key pair${NC}"
echo "───────────────────────────────────────────────────────────────"
read -p "Generate a new age key pair? This will invalidate ALL old .env.age files. (yes/no): " GEN_KEY
if [ "$GEN_KEY" = "yes" ]; then
    mkdir -p "${SCRIPT_DIR}/keys"
    OLD_KEYS="${SCRIPT_DIR}/keys"
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    mv "$OLD_KEYS" "${OLD_KEYS}_revoked_${TIMESTAMP}"
    mkdir -p "$OLD_KEYS"
    NEW_KEY_FILE="${OLD_KEYS}/primary.key"
    NEW_PUB_FILE="${OLD_KEYS}/primary.pub"
    age-keygen -o "$NEW_KEY_FILE" 2> "$NEW_PUB_FILE"
    NEW_PUB=$(grep -oE 'age1[0-9a-z]+' "$NEW_PUB_FILE" | head -n1)
    if [ -z "$NEW_PUB" ]; then
        echo "  ERROR: Could not extract public key from age-keygen output"
        exit 1
    fi
    echo "  Old keys archived to: keys_revoked_${TIMESTAMP}"
    echo "  New public key: $NEW_PUB"
    echo ""
    echo "  IMPORTANT: Add this key to recipients.txt now:"
    echo "    echo '$NEW_PUB' >> 04__INFRASTRUCTURE/SECRETS/recipients.txt"
fi

echo ""
echo -e "${CYAN}Step 4: Update provider keys${NC}"
echo "───────────────────────────────────────────────────────────────"
echo "Edit .env and replace ALL provider API keys with fresh ones:"
echo ""
echo "  1. OpenAI:     https://platform.openai.com/api-keys"
echo "  2. Anthropic:  https://console.anthropic.com/settings/keys"
echo "  3. Google:     https://aistudio.google.com/app/apikey"
echo "  4. Moonshot:   https://platform.moonshot.cn/console/api-keys"
echo "  5. Groq:       https://console.groq.com/keys"
echo "  6. GitHub:     https://github.com/settings/tokens"
echo "  7. AWS:        https://console.aws.amazon.com/iam/home#/security_credentials"
echo ""
read -p "Press Enter after you've updated .env with all new keys..."

echo ""
echo -e "${CYAN}Step 5: Re-encrypt and commit${NC}"
echo "───────────────────────────────────────────────────────────────"
bash "${SCRIPT_DIR}/encrypt.sh"

echo ""
echo -e "${CYAN}Step 6: Update other machines${NC}"
echo "───────────────────────────────────────────────────────────────"
echo "Every other machine must:"
echo "  1. Pull the updated repo"
echo "  2. Generate a new age key pair"
echo "  3. Give you the NEW public key"
echo "  4. You run: ./04__INFRASTRUCTURE/SECRETS/add_recipient.sh <their-new-key>"
echo "  5. They run: ./04__INFRASTRUCTURE/SECRETS/decrypt.sh"
echo ""

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗"
echo -e "║  ✅ ROTATION COMPLETE                                         ║"
echo -e "║  Old keys revoked. New keys active. .env.age re-sealed.       ║"
echo -e "╚═══════════════════════════════════════════════════════════════╝${NC}"
