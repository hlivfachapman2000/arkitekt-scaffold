#!/bin/bash
# Update VS Code Extensions

set -euo pipefail

echo "📝 Updating VS Code extensions..."
code --update-extensions
echo "✅ VS Code extensions updated."
