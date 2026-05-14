#!/bin/bash
# Update Mac App Store apps

set -euo pipefail

echo "🛍️ Updating Mac App Store apps..."
mas upgrade
echo "✅ Mac App Store updated."
