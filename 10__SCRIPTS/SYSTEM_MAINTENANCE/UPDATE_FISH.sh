#!/bin/bash
# Update Fish Plugins

set -euo pipefail

echo "🐟 Updating Fish plugins..."
if command -v fisher &> /dev/null; then
    fish -c 'fisher update'
else
    echo "fisher not installed; skipping"
fi

echo "✅ Fish plugins updated."
