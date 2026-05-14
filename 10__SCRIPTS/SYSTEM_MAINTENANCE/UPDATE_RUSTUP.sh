#!/bin/bash
# ── Rustup Toolchains ───────────────────────────────────────────
set -e

echo "🦀 Updating rustup..."
rustup self update

echo "🦀 Updating stable toolchain..."
rustup update stable

echo "🦀 Updating nightly (if installed)..."
rustup update nightly || true

echo "✅ Rustup complete"
