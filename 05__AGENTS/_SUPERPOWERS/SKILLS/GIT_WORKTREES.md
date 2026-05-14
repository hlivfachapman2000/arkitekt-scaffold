---
skill: GIT_WORKTREES
version: 1.0.0
source: obra/superpowers
applies_when: parallel features, hotfixes, experiment branches
---

# 🌳 SKILL: GIT WORKTREES

## Trigger
Activate when working on parallel branches or long-running experiments.

## Method
1. **Identify** parallel workstreams
2. **Create** worktree per stream: `git worktree add ../project-feature feature-branch`
3. **Isolate** context: each worktree has its own node_modules, .env, IDE window
4. **Merge** back cleanly when done

## Rules
- Use worktrees instead of `git stash` for context switching
- Keep main worktree clean and stable
- Name worktree directories predictably: `../{project}-{feature}`
- Clean up worktrees after merge to avoid disk bloat

## Output Format
```markdown
## Worktree Setup: {feature_name}

| Worktree | Branch | Purpose | Status |
|----------|--------|---------|--------|
| ../project-core | main | stable base | clean |
| ../project-auth | feat/auth | authentication | WIP |
| ../project-db | feat/migration | schema change | ready |

### Cleanup Checklist
- [ ] Merged to main
- [ ] Tests pass in main
- [ ] Worktree removed: `git worktree remove ../project-auth`
```

## Integration
- Log worktree states in agent MEMORY.md
- Tag worktree branches in KANBAN.md for traceability
