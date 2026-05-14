---
skill: WRITING_PLANS
version: 1.0.0
source: obra/superpowers
applies_when: any task > 5 minutes of work
---

# 📝 SKILL: WRITING_PLANS

## Trigger
Activate for every task expected to take > 5 minutes.

## Method
1. **Decompose**: Break into 2-5 minute subtasks
2. **Sequence**: Determine dependencies and order
3. **Estimate**: Guess time per subtask (always overestimate)
4. **Checkpoint**: Define what "done" looks like for each step
5. **Escalate**: If total estimate > 30 minutes, consider subagent delegation

## Output Format
```markdown
## Plan: {task_name}

### Context
{brief description}

### Steps
1. [ ] {subtask} — ~{estimate} — done when: {criteria}
2. [ ] {subtask} — ~{estimate} — done when: {criteria}
3. [ ] {subtask} — ~{estimate} — done when: {criteria}

### Risks
- {risk} → mitigation: {action}

### Delegation Candidates
- {agent} could handle {subtask} if parallelization needed
```

## Integration
- Post plan to agent SCRATCHPAD.md before starting
- Update KANBAN.md as steps move TODO → DOING → DONE
