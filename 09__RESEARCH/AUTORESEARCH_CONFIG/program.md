# AutoResearch Program

## Objective
{{RESEARCH_GOAL}}

## Constraints
- Do NOT modify: {{PROTECTED_FILES}}
- Max experiment duration: {{MAX_DURATION}}
- Success metric: {{METRIC}}

## Loop Config
- Checkpoints every: 5 minutes
- Auto-rollback on: metric degradation > 5%
- Git branch naming: `exp/YYYY-MM-DD__{topic}`
