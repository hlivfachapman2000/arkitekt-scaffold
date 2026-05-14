#!/bin/bash
# ── NVM Node Versions ───────────────────────────────────────────
set -e

echo "⬢ Updating NVM..."
if [ -d "$HOME/.nvm" ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    echo "Installing latest LTS Node..."
    nvm install --lts
    nvm use --lts
    nvm alias default lts/*
else
    echo "NVM not found, skipping"
    exit 0
fi

echo "✅ NVM complete"
