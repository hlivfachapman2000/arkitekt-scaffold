#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# auto_sort_misc.sh — The Junk Dump Sorter
# Scans 13__MISC/INBOX/ and moves files to their proper homes.
# Usage: ./auto_sort_misc.sh [--dry-run]
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
INBOX="${PROJECT_ROOT}/13__MISC/INBOX"
SORTED_DIR="${PROJECT_ROOT}/13__MISC/SORTED/$(date +%Y-%m-%d)"
UNSORTABLE_DIR="${PROJECT_ROOT}/13__MISC/UNSORTABLE"
QUARANTINE_DIR="${PROJECT_ROOT}/13__MISC/QUARANTINE"
RULES_FILE="${PROJECT_ROOT}/13__MISC/SORTER_CONFIG/rules.yaml"
REPORT_DIR="${PROJECT_ROOT}/13__MISC/SORTER_CONFIG/reports"
REPORT_FILE="${REPORT_DIR}/$(date +%Y-%m-%d).md"

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE — no files will be moved"
fi

# ── Ensure Directories Exist ────────────────────────────────
mkdir -p "$SORTED_DIR" "$UNSORTABLE_DIR" "$QUARANTINE_DIR" "$REPORT_DIR"
mkdir -p "${PROJECT_ROOT}/03__ASSETS/images" "${PROJECT_ROOT}/03__ASSETS/video" "${PROJECT_ROOT}/03__ASSETS/audio"
mkdir -p "${PROJECT_ROOT}/02__BACKEND/snippets" "${PROJECT_ROOT}/02__BACKEND/data"
mkdir -p "${PROJECT_ROOT}/01__FRONTEND/snippets"
mkdir -p "${PROJECT_ROOT}/00__DOCUMENTATION/imports" "${PROJECT_ROOT}/00__DOCUMENTATION/diagrams"
mkdir -p "${PROJECT_ROOT}/14__ARCHIVE/temp" "${PROJECT_ROOT}/14__ARCHIVE/backups"
mkdir -p "${PROJECT_ROOT}/07__MEMORY_SYSTEM/SQLITE/imports"

# ── Counters ────────────────────────────────────────────────
MOVED=0
QUARANTINED=0
UNSORTABLE=0
SKIPPED=0

declare -a LOG_ENTRIES

log_entry() {
    LOG_ENTRIES+=("$1")
}

move_file() {
    local src="$1"
    local dst="$2"
    local reason="$3"
    local basename_src
    basename_src="$(basename "$src")"

    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY] Would move: $basename_src -> $dst ($reason)"
    else
        mkdir -p "$dst"
        # Handle collisions with timestamp suffix
        if [ -e "${dst}/${basename_src}" ]; then
            local newname="${basename_src%.*}_$(date +%s)"
            if [ "$newname" = "_$(date +%s)" ]; then
                newname="${basename_src}_$(date +%s)"
            fi
            if [ "${basename_src}" != "${basename_src%.*}" ]; then
                newname="${newname}.${basename_src##*.}"
            fi
            mv "$src" "${dst}/${newname}"
            log_entry "| ${basename_src} | ${dst} | ${reason} | renamed to ${newname} |"
        else
            mv "$src" "$dst/"
            log_entry "| ${basename_src} | ${dst} | ${reason} | moved |"
        fi
    fi
    MOVED=$((MOVED + 1))
}

quarantine_file() {
    local src="$1"
    local reason="$2"
    local basename_src
    basename_src="$(basename "$src")"

    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY] Would QUARANTINE: $basename_src ($reason)"
    else
        mkdir -p "$QUARANTINE_DIR"
        mv "$src" "$QUARANTINE_DIR/"
        log_entry "| ${basename_src} | QUARANTINE | ${reason} | SECURITY HOLD |"
    fi
    QUARANTINED=$((QUARANTINED + 1))
}

unsortable_file() {
    local src="$1"
    local reason="$2"
    local basename_src
    basename_src="$(basename "$src")"

    if [ "$DRY_RUN" = true ]; then
        echo "  [DRY] Would UNSORTABLE: $basename_src ($reason)"
    else
        mkdir -p "$UNSORTABLE_DIR"
        mv "$src" "$UNSORTABLE_DIR/"
        log_entry "| ${basename_src} | UNSORTABLE | ${reason} | manual review |"
    fi
    UNSORTABLE=$((UNSORTABLE + 1))
}

# ── Rule Engine ─────────────────────────────────────────────
apply_rules() {
    local file="$1"
    local ext="${file##*.}"
    ext="${ext,,}"  # lowercase

    case ".$ext" in
        .png|.jpg|.jpeg|.gif|.svg|.webp|.avif)
            move_file "$file" "${PROJECT_ROOT}/03__ASSETS/images" "image asset"
            return 0
            ;;
        .mp4|.mov|.avi|.webm|.mkv)
            move_file "$file" "${PROJECT_ROOT}/03__ASSETS/video" "video asset"
            return 0
            ;;
        .mp3|.wav|.flac|.aac|.ogg)
            move_file "$file" "${PROJECT_ROOT}/03__ASSETS/audio" "audio asset"
            return 0
            ;;
        .md|.txt|.rst|.org)
            move_file "$file" "${PROJECT_ROOT}/06__KNOWLEDGE_VAULT/00__INBOX" "text note"
            return 0
            ;;
        .py|.js|.ts|.jsx|.tsx|.rs|.go|.java|.kt|.swift|.c|.cpp|.h|.hpp|.rb|.php)
            move_file "$file" "${PROJECT_ROOT}/02__BACKEND/snippets" "code snippet"
            return 0
            ;;
        .log|.tmp|.temp|.cache)
            move_file "$file" "${PROJECT_ROOT}/14__ARCHIVE/temp" "temporary file"
            return 0
            ;;
        .zip|.tar|.gz|.tgz|.7z|.rar|.bz2)
            move_file "$file" "${PROJECT_ROOT}/14__ARCHIVE/backups" "compressed archive"
            return 0
            ;;
        .pdf|.doc|.docx|.xls|.xlsx|.ppt|.pptx|.odt|.ods)
            move_file "$file" "${PROJECT_ROOT}/00__DOCUMENTATION/imports" "imported document"
            return 0
            ;;
        .sql|.dump|.db|.sqlite|.sqlite3)
            move_file "$file" "${PROJECT_ROOT}/07__MEMORY_SYSTEM/SQLITE/imports" "database file"
            return 0
            ;;
        .json|.jsonl|.yaml|.yml|.toml|.xml|.csv|.parquet)
            move_file "$file" "${PROJECT_ROOT}/02__BACKEND/data" "data file"
            return 0
            ;;
        .html|.htm|.css|.scss|.less|.vue|.svelte)
            move_file "$file" "${PROJECT_ROOT}/01__FRONTEND/snippets" "frontend snippet"
            return 0
            ;;
        .drawio|.excalidraw|.puml|.mmd)
            move_file "$file" "${PROJECT_ROOT}/00__DOCUMENTATION/diagrams" "diagram"
            return 0
            ;;
        .pem|.key|.crt|.csr|.p12|.env|.secrets)
            quarantine_file "$file" "SECURITY RISK — potential secret"
            return 0
            ;;
    esac

    return 1
}

# ── Main Loop ───────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🗑️  MISC AUTO-SORTER                                   ║"
echo "║     $(date '+%Y-%m-%d %H:%M:%S')                                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ ! -d "$INBOX" ]; then
    echo "❌ INBOX directory not found: $INBOX"
    exit 1
fi

FILE_COUNT=$(find "$INBOX" -maxdepth 1 -type f | wc -l | tr -d ' ')

echo "📦 Files in INBOX: $FILE_COUNT"
echo ""

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "✅ INBOX is empty. Nothing to sort."
    echo ""
    exit 0
fi

for file in "$INBOX"/*; do
    [ -f "$file" ] || continue
    basename_file="$(basename "$file")"

    # Skip hidden files
    if [[ "$basename_file" == .* ]]; then
        echo "  ⏭️  Skipping hidden file: $basename_file"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    echo "  📄 Processing: $basename_file"

    if apply_rules "$file"; then
        continue
    fi

    # If we get here, no rule matched
    unsortable_file "$file" "no matching rule"
done

# ── Report Generation ───────────────────────────────────────
TOTAL=$((MOVED + QUARANTINED + UNSORTABLE))

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Moved: ${MOVED}  |  🛡️ Quarantined: ${QUARANTINED}  |  ❓ Unsortable: ${UNSORTABLE}  ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

if [ "$DRY_RUN" = false ] && [ "$TOTAL" -gt 0 ]; then
    cat > "$REPORT_FILE" <<EOF
# MISC Sorter Report — $(date +%Y-%m-%d)

**Run at**: $(date +%Y-%m-%dT%H:%M:%S%z)
**Mode**: ${DRY_RUN:+DRY RUN}live

## Summary

| Metric | Count |
|--------|-------|
| ✅ Moved | $MOVED |
| 🛡️ Quarantined | $QUARANTINED |
| ❓ Unsortable | $UNSORTABLE |
| ⏭️ Skipped | $SKIPPED |

## Details

| File | Destination | Reason | Action |
|------|-------------|--------|--------|
$(printf '%s\n' "${LOG_ENTRIES[@]}")

## Quarantine Review Required
EOF

    if [ "$QUARANTINED" -gt 0 ]; then
        echo "- ${QUARANTINE_DIR}/" >> "$REPORT_FILE"
    else
        echo "- None" >> "$REPORT_FILE"
    fi

    cat >> "$REPORT_FILE" <<EOF

## Unsortable Manual Review
EOF

    if [ "$UNSORTABLE" -gt 0 ]; then
        echo "- ${UNSORTABLE_DIR}/" >> "$REPORT_FILE"
    else
        echo "- None" >> "$REPORT_FILE"
    fi

    cat >> "$REPORT_FILE" <<EOF

---
*Generated by auto_sort_misc.sh*
EOF

    echo "📊 Report written to: $REPORT_FILE"
fi

echo ""
