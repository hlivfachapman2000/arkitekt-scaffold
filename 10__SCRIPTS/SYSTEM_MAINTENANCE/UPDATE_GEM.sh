#!/bin/bash
# Update Ruby Gems

set -euo pipefail

echo "💎 Updating Ruby gems..."
gem update --system
gem update
gem cleanup
echo "✅ Gems updated."
