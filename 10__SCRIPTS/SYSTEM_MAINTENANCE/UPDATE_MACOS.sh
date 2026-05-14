#!/bin/bash
# Update macOS System Software

set -euo pipefail

echo "🍎 Checking macOS system updates..."
softwareupdate -l
echo "⚠️  Run 'softwareupdate -ia' manually to install updates."
echo "✅ macOS update check complete."
