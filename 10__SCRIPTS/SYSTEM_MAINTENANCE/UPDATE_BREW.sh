#!/bin/bash
# Update Homebrew Formulas & Casks

set -euo pipefail

echo "🍺 Updating Homebrew..."
brew update
brew upgrade --greedy
brew cleanup
brew doctor || true
echo "✅ Homebrew updated."
