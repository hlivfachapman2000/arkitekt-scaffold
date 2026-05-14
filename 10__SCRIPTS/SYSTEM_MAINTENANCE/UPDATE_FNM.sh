#!/bin/bash
# ── FNM Node Versions ───────────────────────────────────────────
set -e

echo "⬢ Updating FNM..."
if command -v fnm &> /dev/null; then
    echo "Installing latest LTS Node..."
    fnm install --lts
    fnm use lts-latest
    fnm default lts-latest
else
    echo "FNM not found, skipping"
    exit 0
fi

echo "✅ FNM complete"
