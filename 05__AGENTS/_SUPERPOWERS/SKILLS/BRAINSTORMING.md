---
skill: BRAINSTORMING
version: 1.0.0
source: obra/superpowers
applies_when: creative work, ambiguous problems, design decisions
---

# 🧠 SKILL: BRAINSTORMING

## Trigger
Activate when >1% chance of improving a creative or ambiguous task.

## Method — Socratic Design Refinement
1. **Diverge**: Generate 5+ wild ideas without judgment
2. **Constrain**: Apply project constraints (stack, time, budget)
3. **Converge**: Select top 3 viable ideas
4. **Pressure-test**: For each viable idea, identify the fatal flaw
5. **Synthesize**: Combine the best elements into 1 recommendation

## Output Format
```markdown
## Brainstorm: {topic}

### Wild Ideas
1. ...
2. ...
3. ...
4. ...
5. ...

### Constrained Shortlist
- **Idea A**: ... (pros/cons)
- **Idea B**: ... (pros/cons)
- **Idea C**: ... (pros/cons)

### Recommendation
**Go with**: ...
**Because**: ...
**Risk**: ...
**Mitigation**: ...
```

## Integration
- Log brainstorm sessions in `_COMMUNICATION_LOGS/`
- If uncertainty > 30%, escalate to `_ORCHESTRATOR` for delegation
