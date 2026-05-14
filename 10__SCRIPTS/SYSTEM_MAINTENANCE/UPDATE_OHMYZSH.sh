#!/bin/bash
# Update Oh My Zsh

set -euo pipefail

echo "🐚 Updating Oh My Zsh..."
if [ "$ZSH" = "" ]; then
    ZSH="${HOME}/.oh-my-zsh"
fi

if [ -f "${ZSH}/tools/upgrade.sh" ]; then
    env ZSH="$ZSH" sh "${ZSH}/tools/upgrade.sh"
else
    echo "Using omz update..."
    omz update || true
fi

echo "✅ Oh My Zsh updated."
