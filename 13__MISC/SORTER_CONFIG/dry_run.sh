#!/bin/bash
# Preview what auto_sort_misc.sh would do without moving files
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
python3 "${SCRIPT_DIR}/ml_classifier.py" --dry-run 2>/dev/null || echo "ml_classifier.py not yet implemented. Rules-only preview."
