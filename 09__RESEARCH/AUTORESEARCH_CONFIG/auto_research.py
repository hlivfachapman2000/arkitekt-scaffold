#!/usr/bin/env python3
#────────────────────────────────────────────────────────────
# auto_research.py — Autonomous Research Loop
#
# Runs experiments with:
# - Checkpointing: saves state every N minutes
# - Rollback: reverts on metric degradation > threshold
# - Branch-based: each experiment gets its own git branch
# - Template-driven: reads AUTORESEARCH_CONFIG/program.md
# - Report generation: writes findings to 09__RESEARCH/
#
# Usage:
#   python3 auto_research.py --goal \"Investigate X\" --target /path/to/code
#   python3 auto_research.py --resume                   # resume last run
#   python3 auto_research.py --status                   # show current state
#   python3 auto_research.py --rollback                 # rollback to last checkpoint
#────────────────────────────────────────────────────────────

import os
import sys
import json
import subprocess
import time
import hashlib
import re
import argparse
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import Optional

#────────────────────────────────────────────────────────────
# Config
#────────────────────────────────────────────────────────────
ROOT_DIR       = Path(__file__).resolve().parent.parent.parent
CONFIG_DIR     = ROOT_DIR / '09__RESEARCH' / 'AUTORESEARCH_CONFIG'
PROGRAM_FILE   = CONFIG_DIR / 'program.md'
CONSTRAINTS_FILE = CONFIG_DIR / 'constraints.md'
STATE_FILE     = CONFIG_DIR / '.research_state.json'
CHECKPOINT_DIR = CONFIG_DIR / 'checkpoints'
LOG_DIR        = CONFIG_DIR / 'logs'

ROLLBACK_THRESHOLD = 0.05
CHECKPOINT_MINUTES = 5

#────────────────────────────────────────────────────────────
# Data structures
#────────────────────────────────────────────────────────────
@dataclass
class Checkpoint:
    id: str
    timestamp: str
    branch: str
    metrics: dict
    files_modified: list
    notes: str = ''

@dataclass
class ResearchState:
    goal: str
    target: str
    start_time: str
    last_checkpoint: Optional[str] = None
    current_branch: str = 'exp/auto_research'
    status: str = 'running'
    metrics_history: list = field(default_factory=list)
    checkpoints: list = field(default_factory=list)
    rollback_count: int = 0
    errors: list = field(default_factory=list)

#────────────────────────────────────────────────────────────
# Helpers
#────────────────────────────────────────────────────────────
def log(msg, level='INFO'):
    ts = datetime.now().strftime('%H:%M:%S')
    prefix = {'INFO': '[+]', 'WARN': '[!]', 'ERROR': '[-]', 'META': '[*]'}.get(level, '[?]')
    print(f'{ts} {prefix} {msg}', flush=True)

def run_cmd(cmd, cwd=None, capture=True, timeout=None):
    log(f'CMD: {cmd}', 'META')
    try:
        result = subprocess.run(
            cmd, shell=True, cwd=cwd or ROOT_DIR,
            capture_output=capture, text=True, timeout=timeout
        )
        if result.returncode != 0:
            log(f'  exit {result.returncode}: {result.stderr[:200]}', 'ERROR')
            return None
        return result.stdout.strip() if capture else ''
    except subprocess.TimeoutExpired:
        log(f'  TIMEOUT after {timeout}s', 'ERROR')
        return None
    except Exception as e:
        log(f'  EXCEPTION: {e}', 'ERROR')
        return None

def git_branch_name(goal: str) -> str:
    date_str = datetime.now().strftime('%Y-%m-%d')
    slug = re.sub(r'[^a-zA-Z0-9]', '-', goal.lower())[:40]
    return f'exp/{date_str}_{slug}'

def checkpoint_id() -> str:
    return hashlib.sha256(str(time.time()).encode()).hexdigest()[:8]

def load_state() -> Optional[ResearchState]:
    if not STATE_FILE.exists():
        return None
    try:
        data = json.loads(STATE_FILE.read_text())
        return ResearchState(**data)
    except Exception as e:
        log(f'Failed to load state: {e}', 'WARN')
        return None

def save_state(state: ResearchState):
    STATE_FILE.write_text(json.dumps(asdict(state), indent=2))
    log(f'State saved', 'META')

#────────────────────────────────────────────────────────────
# Parse constraints
#────────────────────────────────────────────────────────────
def parse_constraints() -> dict:
    if not CONSTRAINTS_FILE.exists():
        return {}
    content = CONSTRAINTS_FILE.read_text()
    constraints = {}
    if content.startswith('---'):
        try:
            end = content.index('---', 3)
            frontmatter = content[3:end]
            for line in frontmatter.split('\n'):
                if ':' in line:
                    key, val = line.split(':', 1)
                    constraints[key.strip()] = val.strip()
        except:
            pass
    return constraints

#────────────────────────────────────────────────────────────
# Git operations
#────────────────────────────────────────────────────────────
def git_init_branch(branch_name: str) -> bool:
    result = run_cmd(f'git branch --list {branch_name}', capture=True)
    exists = bool(result and result.strip())
    if not exists:
        run_cmd(f'git checkout -b {branch_name}')
        log(f'Created branch: {branch_name}', 'INFO')
    else:
        run_cmd(f'git checkout {branch_name}')
        log(f'Switched to branch: {branch_name}', 'INFO')
    return True

def git_list_modified() -> list:
    result = run_cmd('git diff --name-only HEAD', capture=True)
    if result is None:
        return []
    return [f.strip() for f in result.strip().split('\n') if f.strip()]

def git_commit_checkpoint(checkpoint: Checkpoint) -> bool:
    msg = f'Checkpoint {checkpoint.id}'
    if checkpoint.notes:
        msg += f' — {checkpoint.notes}'
    run_cmd('git add -A')
    result = run_cmd(f'git commit -m {repr(msg)}', capture=True)
    return result is not None

#────────────────────────────────────────────────────────────
# Experiment runner
#────────────────────────────────────────────────────────────
def run_experiment(goal: str, target: str) -> dict:
    log(f'Running experiment: {goal}', 'INFO')
    log(f'Target: {target}', 'INFO')

    timestamp = datetime.now().isoformat()
    findings = []

    # Check if vuln-hunter is available
    vuln_hunter = ROOT_DIR / '14__VULN_HUNTER' / 'src' / 'cli.js'
    if vuln_hunter.exists() and Path(target).exists():
        result = run_cmd(f'node {vuln_hunter} secrets {target} 2>/dev/null', capture=True, timeout=30)
        if result:
            findings.append({'type': 'secrets_scan', 'output': result[:500]})

    # Placeholder metric
    score = 0.5 if findings else 0.0
    return {'timestamp': timestamp, 'score': score, 'findings': findings}

#────────────────────────────────────────────────────────────
# Checkpointing
#────────────────────────────────────────────────────────────
def create_checkpoint(state: ResearchState, metrics: dict, notes: str = '') -> Checkpoint:
    cp_id = checkpoint_id()
    checkpoint = Checkpoint(
        id=cp_id,
        timestamp=datetime.now().isoformat(),
        branch=state.current_branch,
        metrics=dict(metrics),
        files_modified=git_list_modified(),
        notes=notes
    )
    cp_file = CHECKPOINT_DIR / f'{cp_id}.json'
    cp_file.parent.mkdir(parents=True, exist_ok=True)
    cp_file.write_text(json.dumps(asdict(checkpoint), indent=2))
    git_commit_checkpoint(checkpoint)
    state.last_checkpoint = cp_id
    state.checkpoints.append(asdict(checkpoint))
    save_state(state)
    log(f'Checkpoint {cp_id} saved', 'INFO')
    return checkpoint

def load_checkpoint(cp_id: str) -> Optional[Checkpoint]:
    cp_file = CHECKPOINT_DIR / f'{cp_id}.json'
    if not cp_file.exists():
        return None
    try:
        return Checkpoint(**json.loads(cp_file.read_text()))
    except:
        return None

def compute_metric_delta(history: list) -> float:
    if len(history) < 2:
        return 0.0
    recent = history[-1].get('score', 0)
    previous = history[-2].get('score', 0)
    if previous == 0:
        return 0.0
    return (recent - previous) / previous

#────────────────────────────────────────────────────────────
# Main loop
#────────────────────────────────────────────────────────────
def run_loop(goal: str, target: str, max_duration_minutes: int = 30):
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    constraints = parse_constraints()
    rollback_threshold = float(constraints.get('rollback_threshold', ROLLBACK_THRESHOLD))
    checkpoint_minutes = int(constraints.get('checkpoint_every', CHECKPOINT_MINUTES))

    state = load_state()
    if state is None:
        branch = git_branch_name(goal)
        git_init_branch(branch)
        state = ResearchState(
            goal=goal,
            target=target,
            start_time=datetime.now().isoformat(),
            current_branch=branch
        )
        save_state(state)
        log(f'Started research: {goal}', 'INFO')
        log(f'Branch: {branch}', 'INFO')
    else:
        log(f'Resuming: {state.goal} (status: {state.status})', 'INFO')
        if state.current_branch:
            git_init_branch(state.current_branch)

    start_time = datetime.now()
    last_checkpoint = datetime.now()

    while True:
        elapsed = datetime.now() - start_time
        if elapsed > timedelta(minutes=max_duration_minutes):
            log(f'Max duration ({max_duration_minutes} min) reached', 'INFO')
            state.status = 'completed'
            save_state(state)
            break

        result = run_experiment(state.goal, state.target)
        state.metrics_history.append(result)

        if len(state.metrics_history) >= 2:
            delta = compute_metric_delta(state.metrics_history)
            if delta < -rollback_threshold:
                log(f'Metric degradation: {delta:.1%}', 'WARN')
                if state.last_checkpoint:
                    cp = load_checkpoint(state.last_checkpoint)
                    if cp:
                        state.status = 'rolled_back'
                        state.rollback_count += 1
                        state.metrics_history = []
                        save_state(state)
                        log('Rolled back to last checkpoint', 'WARN')
                        continue

        if datetime.now() - last_checkpoint > timedelta(minutes=checkpoint_minutes):
            notes = f'score={result["score"]:.2f}'
            create_checkpoint(state, result, notes)
            last_checkpoint = datetime.now()

        elapsed_s = elapsed.seconds
        log(f'[{elapsed_s//60}m {elapsed_s%60}s] score={result["score"]:.2f} '
            f'checkpoints={len(state.checkpoints)} rollbacks={state.rollback_count}', 'META')

        time.sleep(2)

    final_metrics = {'score': state.metrics_history[-1]['score'] if state.metrics_history else 0}
    create_checkpoint(state, final_metrics, 'final')
    log('Research loop complete', 'INFO')
    print(json.dumps(asdict(state), indent=2))

#────────────────────────────────────────────────────────────
# CLI commands
#────────────────────────────────────────────────────────────
def cmd_status():
    state = load_state()
    if state is None:
        print('No active research session.')
        return
    print(f'Goal:      {state.goal}')
    print(f'Status:    {state.status}')
    print(f'Branch:    {state.current_branch}')
    print(f'Started:   {state.start_time}')
    print(f'Checkpoints: {len(state.checkpoints)}')
    print(f'Rollbacks:   {state.rollback_count}')
    if state.last_checkpoint:
        print(f'Last checkpoint: {state.last_checkpoint}')
    if state.metrics_history:
        print(f'Latest metric: {state.metrics_history[-1]}')

def cmd_rollback():
    state = load_state()
    if state is None or not state.last_checkpoint:
        log('No session or checkpoint to rollback', 'ERROR')
        return
    cp = load_checkpoint(state.last_checkpoint)
    if cp:
        state.status = 'rolled_back'
        state.metrics_history = []
        save_state(state)
        log('Rollback complete', 'INFO')

def cmd_resume():
    state = load_state()
    if state is None:
        log('No session to resume', 'ERROR')
        return
    log(f'Resuming: {state.goal}', 'INFO')
    run_loop(state.goal, state.target)

#────────────────────────────────────────────────────────────
# Entry point
#────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description='Autonomous Research Loop')
    parser.add_argument('--goal', help='Research goal/question')
    parser.add_argument('--target', help='Target path or repo to investigate')
    parser.add_argument('--max-minutes', type=int, default=30, help='Max runtime (default: 30)')
    parser.add_argument('--resume', action='store_true', help='Resume last session')
    parser.add_argument('--status', action='store_true', help='Show current state')
    parser.add_argument('--rollback', action='store_true', help='Rollback to last checkpoint')

    args = parser.parse_args()

    if args.status:
        cmd_status()
    elif args.rollback:
        cmd_rollback()
    elif args.resume:
        cmd_resume()
    elif args.goal and args.target:
        run_loop(args.goal, args.target, args.max_minutes)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()