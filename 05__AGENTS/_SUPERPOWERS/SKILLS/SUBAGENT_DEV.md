---
skill: SUBAGENT_DEV
version: 1.0.0
source: obra/superpowers
applies_when: code changes > 50 lines or complex logic
---

# 👥 SKILL: SUBAGENT-DRIVEN DEVELOPMENT

## Trigger
Activate when code changes exceed ~50 lines or logic is complex.

## Method — Two-Stage Review
1. **STAGE 1 — Build**: Subagent implements the change
   - Provide SPEC.md with context, constraints, tests
   - Subagent writes code + tests
   - Subagent runs tests, fixes failures

2. **STAGE 2 — Review**: Another agent (or `_CRITIC`) reviews
   - Verify tests cover edge cases
   - Check for regressions
   - Confirm style conventions
   - Approve or reject with feedback

3. **MERGE**: Only merge after Stage 2 approval

## Output Format
```markdown
## Subagent Dev: {feature}

### SPEC.md
{requirements, constraints, acceptance criteria}

### Stage 1 — Build
- Subagent: {agent_name}
- Implementation: {files changed}
- Tests: {test files}
- Status: PASS / FAIL

### Stage 2 — Review
- Reviewer: {agent_name}
- Findings: {list}
- Verdict: APPROVE / REJECT

### Merge
- Commit: {hash}
- Branch: {name}
```

## Integration
- Log both stages in `_COMMUNICATION_LOGS/`
- Update agent HEARTBEAT.md with build/review metrics
