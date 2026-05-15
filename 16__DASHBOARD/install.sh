#!/bin/bash
# 🏗️ Arkitekt Dashboard Installer
set -e

echo '🏗️ Installing Arkitekt Dashboard...'

# Check Python version
python3 --version || { echo '❌ Python 3 required'; exit 1; }

# Create virtual environment if needed
if [ ! -dvenv ]; then
    python3 -m venv venv
    source venv/bin/activate
fi

# Install dependencies
pip install textual rich click pyyaml requests --quiet

# Make executable
chmod +x main.py

echo '✅ Arkitekt Dashboard installed!'
echo ''
echo '🚀 Run with:'
echo '   source venv/bin/activate && python3 main.py'
echo '   or: ./main.py'