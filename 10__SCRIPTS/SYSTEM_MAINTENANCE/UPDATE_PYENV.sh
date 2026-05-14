#!/bin/bash
# ── Pyenv Python Versions ───────────────────────────────────────
set -e

echo "🐍 Updating pyenv..."
if command -v pyenv &> /dev/null; then
    echo "Updating pyenv itself..."
    cd "$(pyenv root)" && git pull || true

    echo "Installing latest Python..."
    LATEST=$(pyenv install --list | grep -E "^\s*3\.[0-9]+\.[0-9]+$" | tail -1 | tr -d ' ')
    if [ -n "$LATEST" ]; then
        echo "Latest available: $LATEST"
        pyenv install "$LATEST" || true
        pyenv global "$LATEST"
    fi
else
    echo "Pyenv not found, skipping"
    exit 0
fi

echo "✅ Pyenv complete"
