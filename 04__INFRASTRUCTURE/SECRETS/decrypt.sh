#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# decrypt.sh — Unseal .env.age back into .env
# Usage: ./04__INFRASTRUCTURE/SECRETS/decrypt.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

if ! command -v age &> /dev/null; then
    echo "ERROR: age not installed. Install with: brew install age  (macOS) or apt install age  (Linux)"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"
AGE_FILE="${PROJECT_ROOT}/.env.age"
KEYS_DIR="${SCRIPT_DIR}/keys"

# ── Validation ────────────────────────────────────────────────
if [ ! -f "$AGE_FILE" ]; then
    echo "❌ .env.age not found at: $AGE_FILE"
    echo "   Has this repo been initialized with secrets yet?"
    echo "   On the primary machine: cp .env.example .env && ./04__INFRASTRUCTURE/SECRETS/encrypt.sh"
    exit 1
fi

# Find available private keys
IDENTITIES=()
for key in "$KEYS_DIR"/*.key; do
    [ -e "$key" ] || continue
    IDENTITIES+=("$key")
done

if [ ${#IDENTITIES[@]} -eq 0 ]; then
    echo "❌ No age private key found in: $KEYS_DIR"
    echo "   Generate one: age-keygen -o 04__INFRASTRUCTURE/SECRETS/keys/primary.key"
    exit 1
fi

# Try each identity until one works
echo "🔓 Decrypting .env.age → .env"
DECRYPTED=0
for identity in "${IDENTITIES[@]}"; do
    echo "   Trying: $(basename "$identity")"
    if age -d -i "$identity" -o "$ENV_FILE" "$AGE_FILE" 2>/dev/null; then
        DECRYPTED=1
        echo "   Identity matched: $(basename "$identity")"
        break
    fi
done

if [ $DECRYPTED -eq 0 ]; then
    echo "❌ None of the ${#IDENTITIES[@]} key(s) could decrypt .env.age"
    echo "   Your machine may not be in recipients.txt."
    echo "   Ask the primary machine to run: add_recipient.sh <your-public-key>"
    exit 1
fi

# Secure the decrypted file
chmod 600 "$ENV_FILE"

echo "✅ Decrypted: $ENV_FILE"
echo "   Permissions: $(stat -f '%Lp' "$ENV_FILE" 2>/dev/null || stat -c '%a' "$ENV_FILE" 2>/dev/null || echo 'unknown')"
echo ""
echo "⚠️  .env is now LIVE. Do NOT commit it."
