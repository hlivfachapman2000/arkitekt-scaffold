#!/usr/bin/env python3
"""
generate_build_spec.py — Generate a one-shot build specification
for the Arkitekt Universal Project Scaffold v3.1.

Run: python3 generate_build_spec.py
Output: 00__DOCUMENTATION/BUILD_SPEC.md
"""

import os
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).parent.resolve()
OUTPUT = PROJECT_ROOT / "00__DOCUMENTATION" / "BUILD_SPEC.md"

# Files that INIT_PROJECT.sh creates (we'll extract these by scanning the script)
BOOTSTRAP_FILES = set()

# Files that INIT_AGENT.sh creates per agent
AGENT_FILES = {
    "IDENTITY.md", "SOUL.md", "SKILLS.md", "MEMORY.md",
    "SCRATCHPAD.md", "KANBAN.md", "HEARTBEAT.md", "CLI_ASSIGNMENT.md"
}

# Read INIT_PROJECT.sh to find files it creates
init_project_path = PROJECT_ROOT / "INIT_PROJECT.sh"
if init_project_path.exists():
    content = init_project_path.read_text()
    # Extract cat > "path" and touch "path" lines
    import re
    for m in re.finditer(r'cat\s*>\s*"([^"]+)"', content):
        BOOTSTRAP_FILES.add(m.group(1))
    for m in re.finditer(r'touch\s+"([^"]+)"', content):
        BOOTSTRAP_FILES.add(m.group(1))
    for m in re.finditer(r'cat\s*>\s*\'([^\']+)\'', content):
        BOOTSTRAP_FILES.add(m.group(1))

# Normalize bootstrap paths
BOOTSTRAP_FILES = {f.lstrip("./") for f in BOOTSTRAP_FILES}

# Also add directories that INIT_PROJECT.sh creates via mkdir -p
BOOTSTRAP_DIRS = set()
if init_project_path.exists():
    content = init_project_path.read_text()
    for m in re.finditer(r'mkdir\s+-p\s+(.+?)(?:\n|\Z)', content):
        line = m.group(1)
        for part in line.split():
            part = part.strip().strip("{}").strip(",")
            if part and not part.startswith("-"):
                BOOTSTRAP_DIRS.add(part.lstrip("./"))

# ── SECURITY: files that must NEVER be embedded in BUILD_SPEC.md ────────────
SENSITIVE_NAMES = {
    ".env", ".env.local", ".env.development", ".env.staging",
    ".env.production", ".env.age", "recipients.txt",
}
SENSITIVE_DIRS = {"keys", "SECRETS"}


def is_sensitive(rel_path: str) -> bool:
    """Return True if the file should be excluded from BUILD_SPEC.md embedding."""
    parts = Path(rel_path).parts
    if any(p in SENSITIVE_DIRS for p in parts):
        return True
    if Path(rel_path).name in SENSITIVE_NAMES:
        return True
    return False


# Collect all actual files in the project (excluding .git and generated artifacts)
all_files = []
for root, dirs, files in os.walk(PROJECT_ROOT):
    # Skip .git and common generated dirs
    dirs[:] = [d for d in dirs if d not in {".git", "__pycache__", ".venv", "venv", "node_modules", "output", "SORTED", "UNSORTABLE", "QUARANTINE", "reports", "logs", "temp", "backups", "deprecated", ".claude"}]
    for f in files:
        if f in {".DS_Store", "generate_build_spec.py"}:
            continue
        rel_path = str(Path(root).relative_to(PROJECT_ROOT) / f)
        all_files.append(rel_path)

all_files.sort()

# Categorize files
delta_files = []
bootstrap_created = []
agent_created = []

for f in all_files:
    if any(f.startswith("05__AGENTS/AGENT__") and f.endswith(a) for a in AGENT_FILES):
        agent_created.append(f)
    elif f in BOOTSTRAP_FILES or any(f.startswith(d.rstrip("/") + "/") for d in BOOTSTRAP_DIRS):
        bootstrap_created.append(f)
    elif f == "INIT_PROJECT.sh":
        bootstrap_created.append(f)
    elif f == "10__SCRIPTS/INIT_AGENT.sh":
        bootstrap_created.append(f)
    else:
        delta_files.append(f)

# Build the spec document
lines = []

lines.append("# 🏗️ ARKITEKT UNIVERSAL PROJECT SCAFFOLD v3.1")
lines.append("## One-Shot Build Specification (BUILD_SPEC.md)")
lines.append("")
lines.append(f"**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
lines.append("**Purpose**: Any AI agent reading this can recreate the entire scaffold from scratch.")
lines.append("**Method**: Run bootstrap scripts → apply delta files → verify.")
lines.append("")
lines.append("---")
lines.append("")
lines.append("## 📊 AT A GLANCE")
lines.append("")
lines.append(f"| Metric | Count |")
lines.append(f"|--------|-------|")
lines.append(f"| Total files in scaffold | {len(all_files)} |")
lines.append(f"| Bootstrap-created (INIT_PROJECT.sh) | ~{len(bootstrap_created)} |")
lines.append(f"| Agent-created (INIT_AGENT.sh × N) | 8 sacred files per agent |")
lines.append(f"| Delta files (must be written manually) | {len(delta_files)} |")
lines.append("")
lines.append("---")
lines.append("")
lines.append("## 🚀 EXECUTION ORDER")
lines.append("")
lines.append("### Phase 1: Bootstrap (creates ~80% of files)")
lines.append("```bash")
lines.append("# 1. Create the two master scripts first")
lines.append("#    (see File Contents sections below for their full text)")
lines.append("")
lines.append("# 2. Run the project bootstrap")
lines.append("bash INIT_PROJECT.sh <PROJECT_NAME>")
lines.append("")
lines.append("# 3. Spawn the 3 system agents")
lines.append("bash 10__SCRIPTS/INIT_AGENT.sh _ORCHESTRATOR 'Meta-Agent — Routes, Delegates, Monitors'")
lines.append("bash 10__SCRIPTS/INIT_AGENT.sh _CRITIC 'Quality Gate — Reviews, Standards, Guardrails'")
lines.append("bash 10__SCRIPTS/INIT_AGENT.sh _MEMORY_KEEPER 'Cross-Agent Memory Sync Manager'")
lines.append("")
lines.append("# 4. Make all scripts executable")
lines.append("chmod +x INIT_PROJECT.sh")
lines.append("chmod +x 10__SCRIPTS/INIT_AGENT.sh")
lines.append("chmod +x 10__SCRIPTS/SYNC_MEMORY.sh")
lines.append("chmod +x 10__SCRIPTS/auto_sort_misc.sh")
lines.append("chmod +x 10__SCRIPTS/SYSTEM_MAINTENANCE/*.sh")
lines.append("chmod +x 07__MEMORY_SYSTEM/MEMORY_BRIDGE/*.py")
lines.append("chmod +x 12__CLI_HARNESSES/_SHARED/*.py")
lines.append("chmod +x 13__MISC/SORTER_CONFIG/*.sh")
lines.append("chmod +x 13__MISC/SORTER_CONFIG/*.py")
lines.append("```")
lines.append("")
lines.append("### Phase 2: Apply Delta Files")
lines.append("Overwrite or create each file listed in the Delta Files section below.")
lines.append("These files contain content that INIT_PROJECT.sh does NOT generate.")
lines.append("")
lines.append("### Phase 3: Verification")
lines.append("```bash")
lines.append("# Count total files")
lines.append("find . -type f -not -path './.git/*' | wc -l")
lines.append("")
lines.append("# List all shell scripts")
lines.append("find . -name '*.sh' | sort")
lines.append("")
lines.append("# Verify 3 system agents exist with all 8 sacred files")
lines.append("for agent in _ORCHESTRATOR _CRITIC _MEMORY_KEEPER; do")
lines.append("  echo \"=== $agent ===\"")
lines.append("  ls 05__AGENTS/$agent/")
lines.append("done")
lines.append("```")
lines.append("")
lines.append("---")
lines.append("")

# Phase 1: Bootstrap Scripts
lines.append("## PHASE 1: BOOTSTRAP SCRIPTS")
lines.append("")
lines.append("These two scripts do the heavy lifting. Write them first, then execute.")
lines.append("")

# Include INIT_PROJECT.sh
lines.append("### File: `INIT_PROJECT.sh`")
lines.append("```bash")
if init_project_path.exists():
    lines.append(init_project_path.read_text().rstrip())
lines.append("```")
lines.append("")

# Include INIT_AGENT.sh
init_agent_path = PROJECT_ROOT / "10__SCRIPTS" / "INIT_AGENT.sh"
lines.append("### File: `10__SCRIPTS/INIT_AGENT.sh`")
lines.append("```bash")
if init_agent_path.exists():
    lines.append(init_agent_path.read_text().rstrip())
lines.append("```")
lines.append("")

# Phase 2: Delta Files
lines.append("---")
lines.append("")
lines.append("## PHASE 2: DELTA FILES")
lines.append("")
lines.append("The following files exist in the complete scaffold but are NOT created by the bootstrap scripts above.")
lines.append("Create each file with the exact content shown.")
lines.append("")
lines.append(f"**Total delta files: {len(delta_files)}**")
lines.append("")

# Group delta files by directory for readability
from collections import defaultdict
by_dir = defaultdict(list)
for f in delta_files:
    dir_name = str(Path(f).parent) if "/" in f else "(root)"
    by_dir[dir_name].append(f)

for dir_name in sorted(by_dir.keys()):
    lines.append(f"### Directory: `{dir_name}`")
    lines.append("")
    for f in sorted(by_dir[dir_name]):
        lines.append(f"#### File: `{f}`")
        lines.append("```")
        if is_sensitive(f):
            lines.append("# [REDACTED — this file contains secrets and is never embedded in BUILD_SPEC.md]")
            lines.append("# Copy from a secure source after bootstrap.")
        else:
            try:
                content = (PROJECT_ROOT / f).read_text()
                lines.append(content.rstrip())
            except Exception as e:
                lines.append(f"# Error reading file: {e}")
        lines.append("```")
        lines.append("")

# Phase 3: Verification checklist
lines.append("---")
lines.append("")
lines.append("## PHASE 3: VERIFICATION CHECKLIST")
lines.append("")
lines.append("After running the bootstrap + applying all delta files, verify:")
lines.append("")
lines.append("- [ ] `find . -type f -not -path './.git/*' | wc -l` returns ≥ 100")
lines.append("- [ ] `05__AGENTS/_ORCHESTRATOR/` contains all 8 sacred files")
lines.append("- [ ] `05__AGENTS/_CRITIC/` contains all 8 sacred files")
lines.append("- [ ] `05__AGENTS/_MEMORY_KEEPER/` contains all 8 sacred files")
lines.append("- [ ] `10__SCRIPTS/SYSTEM_MAINTENANCE/` contains 16+ .sh scripts")
lines.append("- [ ] `docker-compose.yml` exists at root")
lines.append("- [ ] `.gitignore` exists at root")
lines.append("- [ ] `06__KNOWLEDGE_VAULT/99__META/schema.md` exists")
lines.append("- [ ] `07__MEMORY_SYSTEM/SQLITE/schema.sql` exists")
lines.append("- [ ] All .sh files are executable (`find . -name '*.sh' -not -perm +111` returns nothing)")
lines.append("")
lines.append("---")
lines.append("")
lines.append("## 📁 COMPLETE FILE TREE")
lines.append("")
lines.append("```")
for f in all_files:
    lines.append(f)
lines.append("```")
lines.append("")
lines.append("---")
lines.append("")
lines.append("*Generated by generate_build_spec.py — part of the Arkitekt Universal Project Scaffold v3.1*")

# Write output
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text("\n".join(lines))
print(f"✅ BUILD_SPEC.md generated: {OUTPUT}")
print(f"   Total files: {len(all_files)}")
print(f"   Bootstrap-created: {len(bootstrap_created)}")
print(f"   Delta files: {len(delta_files)}")
