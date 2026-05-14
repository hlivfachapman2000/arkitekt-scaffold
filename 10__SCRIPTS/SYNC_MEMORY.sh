#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# SYNC_MEMORY.sh — Cross-Agent Memory Synchronization
# Syncs file-based memory to SQLite and optionally Qdrant.
# Usage: ./SYNC_MEMORY.sh [--full]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MEMORY_DIR="${PROJECT_ROOT}/07__MEMORY_SYSTEM"
VAULT_DIR="${PROJECT_ROOT}/06__KNOWLEDGE_VAULT"
AGENTS_DIR="${PROJECT_ROOT}/05__AGENTS"
DB_PATH="${MEMORY_DIR}/SQLITE/agent_state.db"

FULL_SYNC=false
if [ "${1:-}" = "--full" ]; then
    FULL_SYNC=true
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🧠 MEMORY SYNC ENGINE                                   ║"
echo "║     $(date '+%Y-%m-%d %H:%M:%S')                                    ║"
MODE_TEXT="Incremental"
if [ "$FULL_SYNC" = true ]; then
    MODE_TEXT="FULL      "
fi
echo "║     Mode: ${MODE_TEXT}                                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ── Ensure SQLite DB ────────────────────────────────────────
if [ ! -f "$DB_PATH" ]; then
    echo "📦 Initializing SQLite database..."
    mkdir -p "$(dirname "$DB_PATH")"
    sqlite3 "$DB_PATH" < "${MEMORY_DIR}/SQLITE/schema.sql"
    echo "✅ Database initialized."
fi

# ── Agent Registry Sync ─────────────────────────────────────
echo "🤖 Syncing agent registry..."

for agent_dir in "$AGENTS_DIR"/AGENT__*/; do
    [ -d "$agent_dir" ] || continue
    agent_name="$(basename "$agent_dir")"
    agent_name="${agent_name#AGENT__}"

    role="unknown"
    if [ -f "${agent_dir}/IDENTITY.md" ]; then
        role=$(grep -m1 '^- \*\*Role\*\*:' "${agent_dir}/IDENTITY.md" | sed 's/.*: //' || echo "unknown")
    fi

    # Escape single quotes for safe SQL interpolation
    agent_escaped="${agent_name//\'/''}"
    role_escaped="${role//\'/''}"
    sqlite3 "$DB_PATH" <<EOF
INSERT OR REPLACE INTO agents (id, name, role, last_active)
VALUES ('${agent_escaped}', '${agent_escaped}', '${role_escaped}', datetime('now'));
EOF
    echo "  ✓ ${agent_name} (${role})"
done

# ── Memory Archive Sync ─────────────────────────────────────
if [ "$FULL_SYNC" = true ]; then
    echo "📚 Full vault sync to Qdrant (stub)..."
    python3 "${MEMORY_DIR}/MEMORY_BRIDGE/sync_from_vault.py" 2>/dev/null || echo "  ⚠️ Vault sync script not yet implemented."

    echo "📊 Full memory sync to Qdrant (stub)..."
    python3 "${MEMORY_DIR}/MEMORY_BRIDGE/sync_to_qdrant.py" 2>/dev/null || echo "  ⚠️ Qdrant sync script not yet implemented."
fi

# ── CLI Session Log Rotation ────────────────────────────────
echo "📝 Rotating CLI session logs..."
mkdir -p "${MEMORY_DIR}/CLI_SESSIONS/CLAUDE_CODE/$(date +%Y-%m)"
mkdir -p "${MEMORY_DIR}/CLI_SESSIONS/CODEX/$(date +%Y-%m)"
mkdir -p "${MEMORY_DIR}/CLI_SESSIONS/HERMES_AGENT/$(date +%Y-%m)"

# ── Conflict Detection ────────────────────────────────────────
echo "🔍 Checking for memory conflicts..."
CONFLICTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM memory_bridge_log WHERE conflicts > 0 AND date(synced_at) = date('now');" 2>/dev/null || echo "0")
if [ "$CONFLICTS" -gt 0 ] 2>/dev/null; then
    echo "  ⚠️  ${CONFLICTS} conflict(s) detected today. Review: 07__MEMORY_SYSTEM/MEMORY_BRIDGE/conflict_resolver.py"
else
    echo "  ✓ No conflicts detected."
fi

# ── Report ──────────────────────────────────────────────────
echo ""
echo "✅ Memory sync complete."
echo ""
echo "📊 Current State:"
echo "  Agents: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM agents;" 2>/dev/null || echo "N/A")"
echo "  Memories: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM memories;" 2>/dev/null || echo "N/A")"
echo "  Sessions: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sessions;" 2>/dev/null || echo "N/A")"
echo ""
