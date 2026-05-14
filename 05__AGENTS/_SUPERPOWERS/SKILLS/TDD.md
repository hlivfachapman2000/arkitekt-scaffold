---
skill: TDD
version: 1.0.0
source: obra/superpowers
applies_when: writing code, refactoring, bug fixes
---

# 🧪 SKILL: TDD (RED-GREEN-REFACTOR)

## Trigger
Activate when >1% chance of improving code quality.

## Method
1. **RED**: Write a failing test that describes the desired behavior
2. **GREEN**: Write the minimal code to make the test pass
3. **REFACTOR**: Clean up the code while keeping tests green
4. **REPEAT** until feature complete

## Rules
- Never write production code without a failing test first
- Tests should be fast (<100ms per test ideal)
- One concept per test
- Refactoring commits happen ONLY when tests are green

## Output Format
```markdown
## TDD Cycle: {feature_name}

### RED
- Test: `test_{behavior}`
- Expected: ...
- Actual: FAIL (assertion)

### GREEN
- Implementation: ...
- Commit: ...

### REFACTOR
- Change: ...
- Risk: ...
- Tests still green? [x]
```

## Integration
- Log cycle counts in agent KANBAN.md
- Flag to `_CRITIC` if test coverage < 80%
