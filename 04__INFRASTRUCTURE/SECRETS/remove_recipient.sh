#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# remove_recipient.sh — Revoke a machine's access to secrets
# Usage: ./04__INFRASTRUCTURE/SECRETS/remove_recipient.sh "age1..."
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RECIPIENTS="${SCRIPT_DIR}/recipients.txt"
TMP_FILE="${RECIPIENTS}.tmp.$$"

OLD_KEY="${1:-}"

trap 'rm -f "${TMP_FILE:-}"' EXIT

if [ -z "$OLD_KEY" ]; then
    echo "❌ Usage: $0 <age-public-key>"
    echo "   Example: $0 age1ql3z7h3gk..."
    exit 1
fi

if [ ! -f "$RECIPIENTS" ]; then
    echo "❌ recipients.txt not found"
    exit 1
fi

# Check if key exists
if ! grep -Fxq "$OLD_KEY" "$RECIPIENTS"; then
    echo "⚠️  Key not found in recipients.txt — nothing to remove"
    exit 0
fi

# Remove the key
grep -Fxv "$OLD_KEY" "$RECIPIENTS" > "${RECIPIENTS}.tmp" && mv "${RECIPIENTS}.tmp" "$RECIPIENTS"
echo "✅ Removed recipient: ${OLD_KEY:0:20}..."

# Count remaining recipients
REMAINING=$(grep -v '^#' "$RECIPIENTS" | grep -v '^$' | wc -l | tr -d ' ')
if [ "$REMAINING" -eq 0 ]; then
    echo "⚠️  WARNING: No remaining recipients! You won't be able to decrypt .env.age."
    echo "   Add at least one key before committing, or you'll lock yourself out."
    exit 1
fi

# Re-encrypt (the removed machine can no longer decrypt)
echo "🔐 Re-encrypting .env.age without revoked recipient..."
bash "${SCRIPT_DIR}/encrypt.sh"

echo ""
echo "🚨 IMPORTANT: The revoked machine still has a local copy of .env!"
echo "   Rotate ALL secrets in .env if this was an emergency revocation:"
echo "   ./04__INFRASTRUCTURE/SECRETS/rotate.sh"
echo ""
echo "📋 Next steps:"
echo "   git add .env.age recipients.txt"
echo "   git commit -m 'Revoke machine access to secrets'"
echo "   git push"
