#!/bin/bash
# Update Cargo crates and Rustup

set -euo pipefail

echo "🦀 Updating Rustup and Cargo..."
rustup update
cargo install-update -a 2>/dev/null || echo "cargo-update not installed; skipping crate updates"
echo "✅ Cargo updated."
