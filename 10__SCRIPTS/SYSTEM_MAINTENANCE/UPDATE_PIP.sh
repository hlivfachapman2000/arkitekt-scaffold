#!/bin/bash
# Update pip packages

set -euo pipefail

echo "🐍 Updating pip packages..."

PIP="pip3"
if ! command -v pip3 &> /dev/null; then
    PIP="pip"
fi

$PIP install --upgrade pip
$PIP list --outdated --format=columns 2>/dev/null || true

echo "✅ pip updated."
