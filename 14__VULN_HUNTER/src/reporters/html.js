const SEVERITY_COLORS = {
  critical: '\u001b[31m',
  high: '\u001b[35m',
  medium: '\u001b[33m',
  low: '\u001b[36m',
  info: '\u001b[34m',
};

const RESET = '\u001b[0m';

export function printReport(findings, type = 'secrets') {
  if (findings.length === 0) {
    console.log(`\n  No ${type} vulnerabilities found!`);
    return;
  }

  console.log(`\n  Found ${findings.length} ${type} vulnerability(ies):\n`);
  
  // Group by severity
  const grouped = {};
  for (const f of findings) {
    grouped[f.severity] = grouped[f.severity] || [];
    grouped[f.severity].push(f);
  }
  
  // Print by severity
  for (const severity of ['critical', 'high', 'medium', 'low', 'info']) {
    if (!grouped[severity]) continue;
    
    const color = SEVERITY_COLORS[severity];
    console.log(`${color}${severity.toUpperCase()}${RESET} (${grouped[severity].length})`);
    
    for (const finding of grouped[severity]) {
      console.log(`  ${finding.file}:${finding.line}`);
      console.log(`  Type: ${finding.type}`);
      if (finding.cve) console.log(`  CVE: ${finding.cve}`);
      if (finding.description) console.log(`  ${finding.description}`);
      if (finding.value) console.log(`  Value: ${finding.value}`);
      if (finding.snippet) console.log(`  Code: ${finding.snippet}`);
      console.log();
    }
  }
}

export function generateMarkdown(findings, type = 'scan') {
  let md = `# VulnHunter Report - ${type}\n\n`;
  md += `Generated: ${new Date().toISOString()}\n\n`;
  
  const grouped = {};
  for (const f of findings) {
    grouped[f.severity] = grouped[f.severity] || [];
    grouped[f.severity].push(f);
  }
  
  const severities = ['critical', 'high', 'medium', 'low', 'info'];
  
  for (const severity of severities) {
    if (!grouped[severity]) continue;
    md += `## ${severity.toUpperCase()} (${grouped[severity].length})\n\n`;
    
    for (const f of grouped[severity]) {
      md += `### ${f.type}\n\n`;
      md += `| Field | Value |\n`;
      md += `|-------|-------|\n`;
      md += `| File | \n` + f.file + ` |\n`;
      md += `| Line | ${f.line} |\n`;
      if (f.cve) md += `| CVE | ${f.cve} |\n`;
      if (f.description) md += `| Description | ${f.description} |\n`;
      md += `\n`;
      if (f.snippet) {
        md += `**Code:**\n\n`;
        md += '```\n' + f.snippet + '\n```\n\n';
      }
    }
  }
  
  return md;
}

export function generateJSON(findings, type = 'scan') {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    type,
    total: findings.length,
    by_severity: {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
    },
    findings,
  }, null, 2);
}

export function generateHTMLReport(findings, type = 'scan') {
  const severities = ['critical', 'high', 'medium', 'low'];
  const severityColors = {
    critical: '#dc2626',
    high: '#d946ef',
    medium: '#f59e0b',
    low: '#06b6d4',
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset='UTF-8'>
  <title>VulnHunter Report - ${type}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 2rem; }
    h1 { color: #fff; border-bottom: 1px solid #333; padding-bottom: 1rem; margin-bottom: 2rem; }
    h1 span { color: #dc2626; }
    .meta { color: #888; margin-bottom: 2rem; }
    .summary { display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
    .summary-item { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1rem 1.5rem; text-align: center; min-width: 100px; }
    .summary-number { font-size: 2rem; font-weight: bold; }
    .severity-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 0.75rem; color: #fff; }
    .finding { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    .finding-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .type { font-weight: bold; font-size: 1.1rem; }
    .file { color: #888; font-family: monospace; font-size: 0.8rem; margin: 0.25rem 0; }
    .cve { color: #4ade80; font-family: monospace; font-size: 0.85rem; background: #1a2a1a; padding: 0.2rem 0.5rem; border-radius: 4px; }
    p { color: #aaa; margin: 0.5rem 0; line-height: 1.5; }
    code { background: #2a2a2a; padding: 0.75rem; border-radius: 6px; font-size: 0.85rem; display: block; overflow-x: auto; font-family: 'Fira Code', monospace; color: #e5e5e5; margin: 0.5rem 0; border: 1px solid #333; }
    .value { color: #f87171; }
    .footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #333; color: #666; font-size: 0.875rem; }
  </style>
</head>
<body>
  <h1>Vuln<span>Hunter</span> Report</h1>
  <p class='meta'>Generated: ${new Date().toLocaleString()} &nbsp;|&nbsp; Type: ${type}</p>
  
  <div class='summary'>
    ${severities.map(s => {
      const count = findings.filter(f => f.severity === s).length;
      return count > 0 ? `<div class='summary-item'><div class='summary-number' style='color:${severityColors[s]}'>${count}</div><span class='severity-badge' style='background:${severityColors[s]}'>${s}</span></div>` : '';
    }).join('')}
  </div>
  
  ${findings.map(f => `
    <div class='finding'>
      <div class='finding-header'>
        <span class='severity-badge' style='background:${severityColors[f.severity] || '#666'}'>${f.severity}</span>
        <span class='type'>${f.type}</span>
        ${f.cve ? `<span class='cve'>${f.cve}</span>` : ''}
      </div>
      <div class='file'>${f.file}:${f.line}</div>
      ${f.description ? `<p>${f.description}</p>` : ''}
      ${f.snippet ? `<code>${escapeHtml(f.snippet)}</code>` : ''}
      ${f.value ? `<p><strong>Exposed value:</strong> <code class='value'>${escapeHtml(f.value)}</code></p>` : ''}
    </div>
  `).join('')}
  
  <div class='footer'>
    VulnHunter v1.0.0 &mdash; AI-powered vulnerability scanner for bug bounty hunting
  </div>
</body>
</html>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/'/g, '&#x27;')
    .replace(/'/g, '&quot;');
}