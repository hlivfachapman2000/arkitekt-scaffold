---
skill: WRITING_SKILLS
version: 1.0.0
source: obra/superpowers
applies_when: new repeatable pattern emerges
---

# ✍️ SKILL: WRITING_SKILLS

## Trigger
Activate when a new repeatable pattern, process, or technique proves useful.

## Method
1. **Extract** the pattern from a successful task
2. **Generalize** it so it applies to similar situations
3. **Document** it as a skill in `_SUPERPOWERS/SKILLS/`
4. **Share** it with all agents via broadcast

## Rules
- Every skill must have a clear trigger condition
- Skills should be < 200 lines of markdown
- Include an output format template
- Version the skill (semantic versioning)
- If a skill is wrong, deprecate it — don't silently ignore

## Output Format
```markdown
---
skill: {NAME}
version: 1.0.0
source: {agent_name} / obra/superpowers
applies_when: {trigger_condition}
---

# 🏷️ SKILL: {NAME}

## Trigger
...

## Method
...

## Rules
...

## Output Format
```markdown
...
```

## Integration
...
```

## Integration
- Store all skills in `05__AGENTS/_SUPERPOWERS/SKILLS/`
- Market-tested skills go to `05__AGENTS/_SUPERPOWERS/MARKETPLACE/`
- Announce new skills in `_COMMUNICATION_LOGS/` broadcast
