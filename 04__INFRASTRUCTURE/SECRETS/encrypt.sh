#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# encrypt.sh — Seal .env into .env.age (safe to commit & share)
# Usage: ./04__INFRASTRUCTURE/SECRETS/encrypt.sh
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"
AGE_FILE="${PROJECT_ROOT}/.env.age"
RECIPIENTS="${SCRIPT_DIR}/recipients.txt"

# ── Validation ────────────────────────────────────────────────
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env not found at: $ENV_FILE"
    echo "   Copy from template: cp .env.example .env"
    exit 1
fi

if [ ! -f "$RECIPIENTS" ]; then
    echo "❌ recipients.txt not found at: $RECIPIENTS"
    echo "   Add at least one age public key first."
    exit 1
fi

# Extract non-comment, non-empty lines
ACTIVE_KEYS=$(grep -v '^#' "$RECIPIENTS" | grep -v '^$' || true)
if [ -z "$ACTIVE_KEYS" ]; then
    echo "❌ No active recipients in recipients.txt"
    echo "   Add your age public keys (one per line, uncommented)."
    exit 1
fi

# ── Encryption ────────────────────────────────────────────────
echo "🔐 Encrypting .env → .env.age"
echo "   Recipients: $(echo "$ACTIVE_KEYS" | wc -l | tr -d ' ') machine(s)"

# Build recipient args (array to handle spaces safely)
RECIPIENT_ARGS=()
while IFS= read -r line; do
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue
    RECIPIENT_ARGS+=("-r" "$line")
done < "$RECIPIENTS"

# Encrypt
age "${RECIPIENT_ARGS[@]}" -o "$AGE_FILE" "$ENV_FILE"

# Secure the encrypted file
chmod 644 "$AGE_FILE"

echo "✅ Encrypted: $AGE_FILE"
echo "   Size: $(du -h "$AGE_FILE" | cut -f1)"
echo ""
echo "📋 Next steps:"
echo "   git add .env.age"
echo "   git commit -m 'Rotate secrets'"
echo "   git push"
echo ""
echo "⚠️  .env itself remains UNCOMMITTED (gitignored)"
