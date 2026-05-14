#!/bin/bash
# Update global npm packages

set -euo pipefail

echo "📦 Updating global npm packages..."
npm update -g
npm outdated -g || true
echo "✅ npm updated."
