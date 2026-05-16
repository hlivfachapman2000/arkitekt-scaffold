#!/usr/bin/env bash
#────────────────────────────────────────────────────────────
# INIT_AGENT.sh — Smart Agent Spawner
# Reads agent templates, auto-assigns CLI harness, sets up
# memory files, enforces token budget, validates conventions.
#────────────────────────────────────────────────────────────

set -euo pipefail

# Colors — define globals once, use everywhere
if [[ -t 1 ]]; then
  RED=$(printf '\u001b[31m'); GREEN=$(printf '\u001b[32m')
  YELLOW=$(printf '\u001b[33m'); BLUE=$(printf '\u001b[34m')
  BOLD=$(printf '\u001b[1m'); RESET=$(printf '\u001b[0m')
else
  RED=''; GREEN=''; YELLOW=''; BLUE=''; BOLD=''; RESET=''
fi
err()  { echo -e "${RED}[ERROR]${RESET}  $*" 2>&1; }
ok()   { echo -e "${GREEN}[OK]${RESET}    $*" 2>&1; }
warn(){ echo -e "${YELLOW}[WARN]${RESET}  $*" 2>&1; }
infor(){ echo -e "${BLUE}[INFO]${RESET}  $*" 2>&1; }

#────────────────────────────────────────────────────────────
# Usage
#────────────────────────────────────────────────────────────
usage() {
  cat <<'EOF'
USAGE:
  ./10__SCRIPTS/INIT_AGENT.sh <NAME> <ROLE> [OPTIONS]

ARGUMENTS:
  NAME    Agent name (e.g. CODER, RESEARCHER, BUG_HUNTER)
  ROLE    Template: coder | researcher | sniper | custom

OPTIONS:
  --template <path>   Custom template .md file
  --harness <cli>     Force CLI harness (overrides auto-route)
  --no-budget          Skip token budget check
  --dry-run            Print what would be done, don't create
  --force              Overwrite existing agent directory
  --swarm              Add to _ORCHESTRATOR routing table

EXAMPLES:
  ./10__SCRIPTS/INIT_AGENT.sh CODER coder
  ./10__SCRIPTS/INIT_AGENT.sh BUG_HUNTER custom --template ./my-template.md
  ./10__SCRIPTS/INIT_AGENT.sh RESEARCHER researcher --swarm

EOF
}

#────────────────────────────────────────────────────────────
# Parse arguments — collect options first, then positionals
#────────────────────────────────────────────────────────────
FORCE=false
DRY_RUN=false
SKIP_BUDGET=false
ADD_TO_SWARM=false
CUSTOM_TEMPLATE=''
HARNESS_OVERRIDE=''
POSITIONAL=()

while [[ $# -gt 0 ]]; do
  case $1 in
    --template)    CUSTOM_TEMPLATE=$2; shift 2 ;;
    --harness)     HARNESS_OVERRIDE=$2; shift 2 ;;
    --no-budget)   SKIP_BUDGET=true; shift ;;
    --dry-run)     DRY_RUN=true; shift ;;
    --force)       FORCE=true; shift ;;
    --swarm)       ADD_TO_SWARM=true; shift ;;
    --help|-h)     usage; exit 0 ;;
    --*)           echo -e 2>&1; exit 1 ;;
    *)             POSITIONAL+=($1); shift ;;
  esac
done

if [[ ${#POSITIONAL[@]} -lt 2 ]]; then
  usage; exit 1
fi
AGENT_NAME=${POSITIONAL[0]}
ROLE=${POSITIONAL[1]}

#────────────────────────────────────────────────────────────
# Validate name format
#────────────────────────────────────────────────────────────
if ! [[ $AGENT_NAME =~ ^[A-Z][A-Z0-9_-]*$ ]]; then
  err 2>&1; exit 1
fi

ROOT_DIR=$(cd . && pwd)
AGENTS_DIR=$ROOT_DIR/05__AGENTS
TEMPLATES_DIR=$ROOT_DIR/10__SCRIPTS/_TEMPLATES
BUDGET_FILE=$ROOT_DIR/11__TOKENS/BUDGETS/project_budget.yaml

#────────────────────────────────────────────────────────────
# Helpers
#────────────────────────────────────────────────────────────
require_file() {
  if [[ ! -f $1 ]]; then
    err 2>&1; exit 1
  fi
}
require_dir() {
  if [[ ! -d $1 ]]; then
    mkdir -p $1
    ok 2>&1
  fi
}

#────────────────────────────────────────────────────────────
# Route role → CLI harness
#────────────────────────────────────────────────────────────
route_harness() {
  case $1 in
    coder)           echo CLAUDE_CODE ;;
    researcher)      echo KIMI_CODE ;;
    sniper)          echo CODEX ;;
    creative|brainstorm) echo HERMES_AGENT ;;
    bug_hunt|recon)  echo CODEX ;;
    *)               echo CLAUDE_CODE ;;
  esac
}

#────────────────────────────────────────────────────────────
# Token budget check
#────────────────────────────────────────────────────────────
check_budget() {
  if $SKIP_BUDGET; then return 0; fi
  if [[ ! -f $BUDGET_FILE ]]; then
    warn 2>&1; return 0
  fi
  ROLE_UPPER=$(echo $1 | tr '[:lower:]' '[:upper:]')
  MONTHLY=$(grep -A5 allocations: $BUDGET_FILE 2>/dev/null | grep -E $ROLE_UPPER 2>/dev/null | grep -oE '[0-9]+' | head -1 || echo 0)
  if [[ -z $MONTHLY || $MONTHLY -eq 0 ]]; then
    ok 2>&1; return 0
  fi
  ok 2>&1
}

#────────────────────────────────────────────────────────────
# skills_priority — execute case BEFORE heredoc, avoid nested ;;
#────────────────────────────────────────────────────────────
get_skills_priority() {
  local r=$1
  case $r in
    coder)      echo '1. TDD  2. WRITING_PLANS  3. SUBAGENT_DEV  4. SYSTEMATIC_DEBUG  5. GIT_WORKTREES' ;;
    researcher) echo '1. WRITING_PLANS  2. BRAINSTORMING  3. SUBAGENT_DEV  4. SYSTEMATIC_DEBUG' ;;
    sniper)     echo '1. WRITING_PLANS  2. TDD  3. SYSTEMATIC_DEBUG' ;;
    *)          echo '1. WRITING_PLANS  2. TDD  3. SYSTEMATIC_DEBUG' ;;
  esac
}

#────────────────────────────────────────────────────────────
# task_type for swarm routing
#────────────────────────────────────────────────────────────
get_task_type() {
  case $1 in
    coder)      echo Coding ;;
    researcher) echo Research ;;
    sniper)     echo Sniper ;;
    creative)   echo Creative ;;
    bug_hunt)   echo 'Bug Hunt' ;;
    *)          echo General ;;
  esac
}

#────────────────────────────────────────────────────────────
# Write a file using a heredoc, then substitute variables
# (uses <<-'EOF' so no expansion inside heredoc;
#  sed does the variable substitution afterward)
#────────────────────────────────────────────────────────────
write_file_from_heredoc() {
  local file=$1
  local content=$2
  printf '%s\n' 2>&1
  # Write content as-is (no variable expansion)
  printf '%s\n' 2>&1
  # Apply variable substitutions
  printf '%s\n' 2>&1
}

#────────────────────────────────────────────────────────────
# spawn_agent — create all memory files for an agent
#────────────────────────────────────────────────────────────
spawn_agent() {
  local name=$1 role=$2 harness=$3
  local agent_dir=$AGENTS_DIR/$name
  local today=$(date +%Y-%m-%d)
  local ts=$(date -Iseconds)

  if $FORCE && [[ -d $agent_dir ]]; then
    warn 2>&1
  elif [[ -d $agent_dir ]]; then
    err 2>&1; exit 1
  fi

  if $DRY_RUN; then
    infor "[DRY RUN] Would create agent: ${BOLD}$name${RESET}"
    return 0
  fi

  require_dir $agent_dir

  # ── IDENTITY.md ─────────────────────────────────────────
  # Use <<-'EOF' — no expansion inside; sed replaces afterwards
  cat > $agent_dir/IDENTITY.md <<-'IDENTITY_EOF'
---
name: __NAME__
role: __ROLE__
version: 1.0.0
created: __TODAY__
author: arkitekt
superpowers_version: 2.0.0
---

# __NAME__

## Public Identity
- **Name**: __NAME__
- **Role**: Agent — see template
- **Comms Style**: Per role template
- **Harness**: __HARNESS__

## Version History
- v1.0.0 — Spawned via INIT_AGENT.sh on __TODAY__
IDENTITY_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__ROLE__/'$role'/g' -e 's/__TODAY__/'$today'/g' -e 's/__HARNESS__/'$harness'/g' $agent_dir/IDENTITY.md

  # ── KANBAN.md ────────────────────────────────────────────
  cat > $agent_dir/KANBAN.md <<-'KANBAN_EOF'
---
agent: __NAME__
created: __TODAY__
---

# KANBAN — __NAME__

## Columns
| Column  | WIP Limit | Description |
|---------|-----------|-------------|
| BACKLOG | —         | Pending tasks |
| DOING   | 1         | Active task (SNIPER: always 1) |
| REVIEW  | 2         | Awaiting _CRITIC |
| DONE    | —         | Completed, merged, tested |

## Board
<!-- Auto-managed by _ORCHESTRATOR -->
KANBAN_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__TODAY__/'$today'/g' $agent_dir/KANBAN.md

  # ── HEARTBEAT.md ─────────────────────────────────────────
  cat > $agent_dir/HEARTBEAT.md <<-'HEARTBEAT_EOF'
---
agent: __NAME__
last_ping: __TS__
health: healthy
load: idle
---

# HEARTBEAT — __NAME__

## Status
- **Health**: healthy
- **Load**: idle
- **Last ping**: __TS__

## Metrics
| Metric         | Value |
|----------------|-------|
| Tasks done     | 0 |
| Tokens used    | 0 |
| Tokens budget  | see 11__TOKENS/ |
| Success rate   | — |

## Health Rules
- Unhealthy if load > 90% for > 5 min
- Escalate to _ORCHESTRATOR on unhealthy
HEARTBEAT_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__TS__/'$ts'/g' $agent_dir/HEARTBEAT.md

  # ── MEMORY.md ─────────────────────────────────────────────
  cat > $agent_dir/MEMORY.md <<-'MEMORY_EOF'
# MEMORY — __NAME__

## Agent Facts
- **Name**: __NAME__
- **Role**: __ROLE__
- **CLI Harness**: __HARNESS__
- **Spawned**: __TODAY__

## Project Conventions
<!-- Fill in as you learn them -->

## Key Learnings
<!-- Document decisions, patterns, gotchas -->

## Stack Info
<!-- Language, frameworks, tools used in this project -->
MEMORY_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__ROLE__/'$role'/g' -e 's/__TODAY__/'$today'/g' -e 's/__HARNESS__/'$harness'/g' $agent_dir/MEMORY.md

  # ── SCRATCHPAD.md ─────────────────────────────────────────
  cat > $agent_dir/SCRATCHPAD.md <<-'SCRATCHPAD_EOF'
# SCRATCHPAD — __NAME__
<!-- Ephemeral working notes — cleared after each task -->

## Current Task
*none*

## In-Progress Notes
-

## Todo
- [ ]
SCRATCHPAD_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' $agent_dir/SCRATCHPAD.md

  # ── CLI_ASSIGNMENT.md ─────────────────────────────────────
  local fallback
  fallback=$([[ $harness == CLAUDE_CODE ]] && echo CODEX || echo CLAUDE_CODE)
  cat > $agent_dir/CLI_ASSIGNMENT.md <<-'CLI_EOF'
---
agent: __NAME__
harness: __HARNESS__
fallback: __FALLBACK__
---

# CLI Assignment — __NAME__

## Primary Harness
**__HARNESS__** — auto-routed for role '__ROLE__'

## Harness Setup
Source: \"./12__CLI_HARNESSES/__HARNESS__/ALIASES.sh\"

## Fallback Chain
__HARNESS__ → __FALLBACK__ → GEMINI_CLI
CLI_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__ROLE__/'$role'/g' -e 's/__HARNESS__/'$harness'/g' -e 's/__FALLBACK__/'$fallback'/g' $agent_dir/CLI_ASSIGNMENT.md

  # ── SKILLS.md ─────────────────────────────────────────────
  # Compute skills priority OUTSIDE heredoc to avoid ;; nesting issues
  local skills_pri
  skills_pri=$(get_skills_priority $role)
  cat > $agent_dir/SKILLS.md <<-'SKILLS_EOF'
# SKILLS — __NAME__

## Available Skills
See: 05__AGENTS/_SUPERPOWERS/SKILLS/

## Priority Order (per role)
__SKILLS_PRI__

## Loading a Skill
Use the \"/skill <name>\" command in Codebuff to load a skill.
SKILLS_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__SKILLS_PRI__/'$skills_pri'/g' $agent_dir/SKILLS.md

  # ── SOUL.md ───────────────────────────────────────────────
  cat > $agent_dir/SOUL.md <<-'SOUL_EOF'
---
name: __NAME__
version: 1.0.0
created: __TODAY__
---

# SOUL — __NAME__

## Core Directives
1. Ship working code — not perfect code
2. Always write a plan before > 5 min tasks
3. Document decisions in MEMORY.md
4. Respect token budgets in 11__TOKENS/
5. Escalate to _ORCHESTRATOR on blockers

## Behavioral Guardrails
- Check KANBAN.md before picking up new tasks
- Keep SCRATCHPAD.md clean after each task
- Never commit secrets to the repo
- _CRITIC must approve REVIEW items

## Sacred Lines
- \"Make it work, make it right, make it fast — in that order.\"
- \"If it's not tested, it's broken.\"
SOUL_EOF
  sed -i '' -e 's/__NAME__/'$name'/g' -e 's/__TODAY__/'$today'/g' $agent_dir/SOUL.md

  ok 2>&1
}

#────────────────────────────────────────────────────────────
# Add agent to _ORCHESTRATOR routing table
#────────────────────────────────────────────────────────────
add_to_swarm() {
  local name=$1 role=$2 harness=$3
  local orchestrator=$AGENTS_DIR/_ORCHESTRATOR/IDENTITY.md

  if [[ ! -f $orchestrator ]]; then
    warn 2>&1; return 0
  fi

  if grep -q $name $orchestrator 2>/dev/null; then
    ok 2>&1; return 0
  fi

  local task_type; task_type=$(get_task_type $role)
  local new_row; new_row=$(printf '| %-18s | %-12s | %s (%s) |' $name $task_type $name $harness)
  sed -i '' '/| Task Type | Default Agent | Notes |/a '${new_row} $orchestrator

  ok 2>&1
}

#────────────────────────────────────────────────────────────
# Validate project structure
#────────────────────────────────────────────────────────────
validate_conventions() {
  local missing=0
  for dir in 05__AGENTS 08__PROMPTS 10__SCRIPTS 11__TOKENS; do
    if [[ ! -d $ROOT_DIR/$dir ]]; then
      err 2>&1; missing=1
    fi
  done
  if [[ $missing -eq 1 ]]; then
    err 2>&1; exit 1
  fi
  ok 2>&1
}

#────────────────────────────────────────────────────────────
# Main
#────────────────────────────────────────────────────────────
main() {
  infor "INIT_AGENT.sh — Smart Agent Spawner"
  infor ""

  validate_conventions

  # Resolve template path
  local template_file=$ROLE
  case $ROLE in
    coder|researcher|sniper)
      local cand=$TEMPLATES_DIR/$(echo $ROLE | tr '[:lower:]' '[:upper:]').md
      if [[ -f $cand ]]; then
        template_file=$cand; ok 2>&1
      else
        local lc_cand=$TEMPLATES_DIR/$(echo $ROLE | tr '[:upper:]' '[:lower:]').md
        if [[ -f $lc_cand ]]; then
          template_file=$lc_cand; ok 2>&1
        else
          warn 2>&1; template_file=$ROLE
        fi
      fi
      ;;
    custom)
      if [[ -z $CUSTOM_TEMPLATE ]]; then
        err 2>&1; exit 1
      fi
      require_file $CUSTOM_TEMPLATE
      template_file=$CUSTOM_TEMPLATE
      ;;
  esac

  local harness=${HARNESS_OVERRIDE:-$(route_harness $ROLE)}
  check_budget $ROLE

  if $DRY_RUN; then
    infor "[DRY RUN] Would create agent: ${BOLD}$AGENT_NAME${RESET}"
    infor "  Role:     $ROLE"
    infor "  Harness:  $harness"
    infor "  Template: $template_file"
    $ADD_TO_SWARM && infor "  Swarm:    YES — adding to _ORCHESTRATOR routing table"
    infor ""
    infor "Run without --dry-run to actually create the agent."
    return 0
  fi

  spawn_agent $AGENT_NAME $ROLE $harness $template_file

  if $ADD_TO_SWARM; then
    add_to_swarm $AGENT_NAME $ROLE $harness
  fi

  echo -e 2>&1
}

main