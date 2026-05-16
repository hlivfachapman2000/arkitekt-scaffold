#!/usr/bin/env bash
# submit-report.sh — Generate and submit bug bounty reports from VulnHunter findings
# Usage: ./submit-report.sh <json-report> <program-name> [--dry-run]

set -e

REPORT_FILE=${1:-vuln-report.json}
PROGRAM=${2:-}
DRY_RUN=false

if [[ ! -f $REPORT_FILE ]]; then
  echo -e '\n  \u001b[31mError: Report file not found: $REPORT_FILE\u001b[0m'
  exit 1
fi

if [[ -z $PROGRAM ]]; then
  echo -e '\n  \u001b[33mUsage: ./submit-report.sh <json-report> <program-name> [--dry-run]\u001b[0m'
  echo -e '  Example: ./submit-report.sh /tmp/ytdl-report.json youtube-dl'
  exit 1
fi

if [[ $3 == '--dry-run' ]]; then
  DRY_RUN=true
  echo -e '\n  \u001b[36mDRY RUN MODE - No data will be sent\u001b[0m\n'
fi

echo -e '\n  \u001b[36m VulnHunter Report Submission\u001b[0m'
echo -e '  \u001b[90m-------------------------------------\u001b[0m\n'

# Extract and display findings
CRITICAL=$(python3 -c \"import json; d=json.load(open('$REPORT_FILE')); print(len([f for f in d.get('findings',[]) if f['severity']=='critical']))\" 2>/dev/null || echo 0)
HIGH=$(python3 -c \"import json; d=json.load(open('$REPORT_FILE')); print(len([f for f in d.get('findings',[]) if f['severity']=='high']))\" 2>/dev/null || echo 0)

echo -e \"  Target Program: \u001b[33m$PROGRAM\u001b[0m\"
echo -e \"  Critical Findings: \u001b[31m$CRITICAL\u001b[0m\"
echo -e \"  High Findings: \u001b[35m$HIGH\u001b[0m\n\"

# Generate markdown report
TEMPLATE_FILE=$(dirname $0)/bug-bounty-report.md
DATE=$(date +%Y-%m-%d)

if [[ -f $TEMPLATE_FILE ]]; then
  sed -e \"s/\\$DATE/$DATE/g\" $TEMPLATE_FILE > /tmp/bug-bounty-$PROGRAM.md
  echo -e \"  \u001b[32m✓ Report generated: /tmp/bug-bounty-$PROGRAM.md\u001b[0m\n\"
else
  echo -e \"  \u001b[31m✗ Template not found: $TEMPLATE_FILE\u001b[0m\n\"
fi

# Output summary for each critical finding
echo -e \"  \u001b[31mCritical Findings:\u001b[0m\n\"
python3 -c \"
import json, sys
d = json.load(open('$REPORT_FILE'))
for f in d.get('findings', []):
  if f['severity'] == 'critical':
    print(f\"  ❌ {f.get('type', 'Unknown')} in {f.get('file', '?')}:{f.get('line', '?')}\")
    if 'value' in f:
      print(f\"     Value: {f['value'][:30]}...\")
    if f.get('cve'):
      print(f\"     CVE: {f['cve']}\")
    print()
\" 2>/dev/null || echo -e \"  \u001b[90m(No critical findings)\u001b[0m\n\"

# Next steps
echo -e \"  \u001b[36mNext Steps:\u001b[0m\n\"
echo -e \"  1. Review the generated report at: /tmp/bug-bounty-$PROGRAM.md\"
echo -e \"  2. Submit to the program's vulnerability disclosure page\"
echo -e \"  3. Check for duplicates before submitting\n\"
echo -e \"  \u001b[90mBug Bounty Platforms:\u001b[0m\n\"
echo -e \"  • HackerOne: https://hackerone.com/\"
echo -e \"  • Bugcrowd: https://bugcrowd.com/\"
echo -e \"  • Open Bug Bounty: https://openbugbounty.org/\n\"

if [[ $DRY_RUN == false ]]; then
  echo -e \"  \u001b[33mRun with --dry-run to preview without sending\u001b[0m\n\"
fi