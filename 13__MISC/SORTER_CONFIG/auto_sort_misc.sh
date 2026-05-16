#!/usr/bin/env bash
#────────────────────────────────────────────────────────────
# auto_sort_misc.sh — Functional Auto-Sorter
# Watches 13__MISC/INBOX/ and sorts files using rules.yaml.
# Runs once (cron-friendly) or continuously (--watch mode).
# Uses Python for YAML parsing (compatible with bash 3.2).
#────────────────────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
ROOT_DIR=$(cd $SCRIPT_DIR/../.. && pwd)
RULES_FILE=$SCRIPT_DIR/rules.yaml
ML_CLASSIFIER=$SCRIPT_DIR/ml_classifier.py
INBOX_DIR=$ROOT_DIR/13__MISC/INBOX

# Colors (cross-platform)
if [[ -t 1 ]]; then
  RED=$(printf '\u001b[31m'); GREEN=$(printf '\u001b[32m')
  YELLOW=$(printf '\u001b[33m'); BLUE=$(printf '\u001b[34m')
  BOLD=$(printf '\u001b[1m'); RESET=$(printf '\u001b[0m')
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; RESET=''
fi

err()  { echo -e 2>&1; }
ok()   { echo -e 2>&1; }
warn(){ echo -e 2>&1; }
inf(){ echo -e 2>&1; }

#────────────────────────────────────────────────────────────
# Usage
#────────────────────────────────────────────────────────────
usage() {
  cat <<'EOF'
USAGE:
  ./13__MISC/SORTER_CONFIG/auto_sort_misc.sh [OPTIONS]

OPTIONS:
  --watch         Run continuously (file system watcher)
  --dry-run       Preview moves without doing them
  --verbose       Show why each file was sorted
  --rules <file>  Use alternate rules.yaml
  --inbox <dir>   Use alternate inbox directory
  --help          Show this help

EXAMPLES:
  ./13__MISC/SORTER_CONFIG/auto_sort_misc.sh --dry-run
  ./13__MISC/SORTER_CONFIG/auto_sort_misc.sh --watch
  ./13__MISC/SORTER_CONFIG/auto_sort_misc.sh --verbose --dry-run

EOF
}

#────────────────────────────────────────────────────────────
# Parse arguments
#────────────────────────────────────────────────────────────
WATCH_MODE=false
DRY_RUN=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --watch)     WATCH_MODE=true; shift ;;
    --dry-run)   DRY_RUN=true; shift ;;
    --verbose)   VERBOSE=true; shift ;;
    --rules)     RULES_FILE=$2; shift 2 ;;
    --inbox)     INBOX_DIR=$2; shift 2 ;;
    --help|-h)   usage; exit 0 ;;
    *)           err; exit 1 ;;
  esac
done

#────────────────────────────────────────────────────────────
# Validate
#────────────────────────────────────────────────────────────
if [[ ! -f $RULES_FILE ]]; then
  err; exit 1
fi
if [[ ! -d $INBOX_DIR ]]; then
  err; exit 1
fi

inf
inf

#────────────────────────────────────────────────────────────
# Parse rules.yaml using Python (macOS bash 3.2 compatible)
# Outputs lines: destination|action|pattern|description
#────────────────────────────────────────────────────────────
parse_rules_to_file() {
  local out=$(mktemp)
  python3 -c '
import sys, yaml, os, re

ROOT = os.environ.get(
    if __name__ == \"__main__\":
    sys.exit(1)

rules_path = os.environ.get(\"RULES_FILE\", \"rules.yaml\")
root_dir   = os.environ.get(\"ROOT_DIR\", \".\")

try:
    with open(rules_path) as f:
        data = yaml.safe_load(f)
except Exception as e:
    print(f\"ERROR: could not parse {rules_path}: {e}\", file=sys.stderr)
    sys.exit(1)

if not data or \"rules\" not in data:
    print(\"ERROR: no rules section found in YAML\", file=sys.stderr)
    sys.exit(1)

for rule in data[\"rules\"]:
    pattern     = rule.get(\"pattern\", \"\")
    dest        = rule.get(\"destination\", \"\")
    desc        = rule.get(\"description\", \"\")
    action      = rule.get(\"action\", \"move\")
    if pattern and dest:
        # Escape glob special chars for bash case matching
        safe_pattern = pattern.replace(\"*\", \"*?\").replace(\"?\", \"?*\")
        print(f\"{dest}|{action}|{pattern}|{desc}\")
' 2>&1 || { err; return 1; }
  echo $out
}

#────────────────────────────────────────────────────────────
# Classify a single file — returns destination or empty
#────────────────────────────────────────────────────────────
classify_file() {
  local file=$1
  local filename=$(basename $file)

  # Try rules first
  while IFS='|' read -r dest action pattern desc; do
    # Use bash glob matching
    case $filename in
      $pattern)
        echo $dest
        echo $action
        echo $desc
        return 0
        ;;
    esac
  done < <(parse_rules_to_file)

  return 1
}

#────────────────────────────────────────────────────────────
# Classify using ML classifier (stub)
#────────────────────────────────────────────────────────────
classify_by_ml() {
  if [[ ! -x $ML_CLASSIFIER ]]; then return 1; fi
  python3 $ML_CLASSIFIER --classify $1 2>/dev/null | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
    dest = d.get(\"destination\", \"\")
    conf = d.get(\"confidence\", 0)
    if dest and dest != \"UNKNOWN\" and conf >= 0.8:
        print(dest)
        sys.exit(0)
except:
    pass
sys.exit(1)
'
}

#────────────────────────────────────────────────────────────
# Sort a single file
#────────────────────────────────────────────────────────────
sort_file() {
  local file=$1
  local filename=$(basename $file)

  [[ -f $file ]] || return 1

  # Get classification: dest, action, desc
  local result; result=$(classify_file $file 2>&1) || {
    $VERBOSE && inf
    return 0
  }

  local dest action desc
  IFS='|' read -r dest action desc <<< $result

  [[ -z $dest ]] && return 1

  local abs_dest=$ROOT_DIR/$dest

  $VERBOSE && inf

  case $action in
    quarantine)
      if $DRY_RUN; then
        inf
      else
        local qname=${filename}.quarantined_$(date +%Y%m%d_%H%M%S)
        mkdir -p $abs_dest
        mv $file $abs_dest/$qname && ok || err
      fi
      ;;
    move|*)
      if $DRY_RUN; then
        inf
      else
        mkdir -p $abs_dest
        mv $file $abs_dest/ && ok || err
      fi
      ;;
  esac
}

require_dir() {
  if [[ ! -d $1 ]]; then
    mkdir -p $1
    ok
  fi
}

#────────────────────────────────────────────────────────────
# Process entire inbox once
#────────────────────────────────────────────────────────────
process_inbox() {
  local count=0 moved=0 skipped=0

  inf

  local files=()
  while IFS= read -r f; do
    [[ -f $f ]] && files+=($f)
  done < <(find $INBOX_DIR -maxdepth 1 -type f 2>/dev/null || true)

  if [[ ${#files[@]} -eq 0 ]]; then
    inf
    return 0
  fi

  inf

  for file in ${files[@]}; do
    count=$((count+1))
    local result
    result=$(classify_file $file 2>/dev/null) || result=''
    if [[ -n $result ]]; then
      sort_file $file && moved=$((moved+1)) || true
    else
      skipped=$((skipped+1))
    fi
  done

  inf
  inf
}

#────────────────────────────────────────────────────────────
# Run once (cron mode)
#────────────────────────────────────────────────────────────
run_once() {
  process_inbox
}

#────────────────────────────────────────────────────────────
# Watch mode
#────────────────────────────────────────────────────────────
run_watch() {
  inf

  if command -v fswatch &>/dev/null; then
    inf
    fswatch -o $INBOX_DIR | while read -r; do
      sleep 0.5
      local files=()
      while IFS= read -r f; do [[ -f $f ]] && files+=($f); done < <(find $INBOX_DIR -maxdepth 1 -type f 2>/dev/null || true)
      for file in ${files[@]}; do
        local result; result=$(classify_file $file 2>/dev/null) || continue
        [[ -n $result ]] && sort_file $file 2>/dev/null || continue
      done
    done

  elif command -v inotifywait &>/dev/null; then
    inf
    inotifywait -m -e create -e moved_to $INBOX_DIR 2>/dev/null | while read -r dir action file; do
      sleep 0.3
      local fpath=$INBOX_DIR/$file
      [[ -f $fpath ]] || continue
      local result; result=$(classify_file $fpath 2>/dev/null) || continue
      [[ -n $result ]] && sort_file $fpath 2>/dev/null || continue
    done

  else
    # Polling fallback — check every 30 seconds
    inf
    while true; do
      process_inbox
      sleep 30
    done
  fi
}

#────────────────────────────────────────────────────────────
# Main
#────────────────────────────────────────────────────────────
main() {
  if $WATCH_MODE; then
    run_watch
  else
    run_once
  fi
}

main