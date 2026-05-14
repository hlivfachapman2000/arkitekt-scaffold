#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# add_recipient.sh — Authorize a new machine to decrypt secrets
# Usage: ./04__INFRASTRUCTURE/SECRETS/add_recipient.sh "age1..."
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RECIPIENTS="${SCRIPT_DIR}/recipients.txt"

NEW_KEY="${1:-}"

if [ -z "$NEW_KEY" ]; then
    echo "❌ Usage: $0 <age-public-key>"
    echo "   Example: $0 age1ql3z7h3gk..."
    exit 1
fi

# Validate key format
if [[ ! "$NEW_KEY" =~ ^age1[0-9a-z]+$ ]]; then
    echo "❌ Invalid age public key format: $NEW_KEY"
    echo "   Must start with 'age1' followed by alphanumeric characters."
    exit 1
fi

# Check for duplicates
if grep -Fxq "$NEW_KEY" "$RECIPIENTS" 2>/dev/null; then
    echo "⚠️  Key already present in recipients.txt — skipping"
    exit 0
fi

# Add the key
echo "$NEW_KEY" >> "$RECIPIENTS"
echo "✅ Added recipient: ${NEW_KEY:0:20}..."

# Re-encrypt so the new recipient can decrypt
echo "🔐 Re-encrypting .env.age with new recipient..."
bash "${SCRIPT_DIR}/encrypt.sh"

echo ""
echo "📋 Next steps:"
echo "   git add .env.age recipients.txt"
echo "   git commit -m 'Add new machine to secrets recipients'"
echo "   git push"
echo ""
echo "🖥️  On the new machine, pull and run:"
echo "   git pull"
echo "   ./04__INFRASTRUCTURE/SECRETS/decrypt.sh"
