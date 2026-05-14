---
skill: SYSTEMATIC_DEBUG
version: 1.0.0
source: obra/superpowers
applies_when: bugs, errors, unexpected behavior, test failures
---

# 🐛 SKILL: SYSTEMATIC DEBUG

## Trigger
Activate when any error, bug, or unexpected behavior is encountered.

## Method — 4-Phase Root Cause Process
1. **OBSERVE**: Reproduce the issue. Document exact error messages, stack traces, and state.
2. **HYPOTHESIZE**: List 3+ possible causes. Rank by likelihood.
3. **EXPERIMENT**: Test the most likely hypothesis with minimal change.
4. **VERIFY**: Confirm the fix. Check for regressions. Document root cause.

## Rules
- Never fix a symptom without understanding the cause
- Change ONE thing at a time between tests
- If stuck after 3 hypotheses, escalate to `_CRITIC` or human
- Document all hypotheses in SCRATCHPAD.md, even wrong ones

## Output Format
```markdown
## Debug Session: {bug_id}

### Observe
- **Error**: ...
- **Repro Steps**: ...
- **Context**: ...

### Hypotheses
| # | Cause | Likelihood | Test |
|---|-------|------------|------|
| 1 | ... | High | ... |
| 2 | ... | Medium | ... |
| 3 | ... | Low | ... |

### Experiment
- **Hypothesis Tested**: #...
- **Change Made**: ...
- **Result**: PASS / FAIL

### Verify
- **Root Cause**: ...
- **Fix Applied**: ...
- **Regression Tests**: [x] ...
- **Prevention**: ... (how to avoid this class of bug)
```

## Integration
- Link debug sessions in MEMORY.md
- If root cause affects architecture, log in 06__KNOWLEDGE_VAULT/02__CONCEPTS/
