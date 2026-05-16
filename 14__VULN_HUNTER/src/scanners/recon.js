#!/usr/bin/env node
// recon.js — Bug Bounty Reconnaissance Tool
// Automated recon: discovers programs, finds exposed secrets, generates disclosure reports
// Usage: node recon.js discover | targets <p> | scan <target> | monitor

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const ROOT = join('..', '..', '..', '..');
const VULN_HUNTER_CLI = join(ROOT, '14__VULN_HUNTER', 'src', 'cli.js');
const REPORTS_DIR = join(ROOT, '14__VULN_HUNTER', 'reports');
const FINDINGS_DIR = join(ROOT, '14__VULN_HUNTER', 'findings');

const tty = process.stdout.isTTY;
const bold = tty ? '\u001b[1m' : '';
const reset = tty ? '\u001b[0m' : '';
const red = tty ? '\u001b[31m' : '';
const green = tty ? '\u001b[32m' : '';
const yellow = tty ? '\u001b[33m' : '';
const blue = tty ? '\u001b[34m' : '';
const dim = tty ? '\u001b[2m' : '';

const log = function(msg, type) {
  type = type || 'info';
  var icons = { info: '[+]', warn: '[!]', error: '[-]', meta: '[*]' };
  console.error(dim + (icons[type] || '[?]') + reset + ' ' + msg);
};

var PROGRAMS = {
  'youtube-dl': { name: 'youtube-dl', platform: 'email (direct)', scope: ['github.com/ytdl-org/youtube-dl'], bounty_range: '$0-$500', notes: 'No public program — report via GitHub issues' },
  'nodejs':     { name: 'Node.js', platform: 'HackerOne', url: 'https://hackerone.com/nodejs', scope: ['nodejs/node', 'nodejs/node-addon-api'], bounty_range: '$50-$500' },
  'python':     { name: 'Python', platform: 'HackerOne', url: 'https://hackerone.com/python', scope: ['python/cpython'], bounty_range: '$50-$500' },
  'ffmpeg':     { name: 'FFmpeg', platform: 'Open Bug Bounty', url: 'https://www.openbugbounty.org/program/FFmpeg/', scope: ['FFmpeg/FFmpeg'], bounty_range: '$50-$300' },
  'google-cloud': { name: 'Google Cloud', platform: 'Google VRP', scope: ['*.googleapis.com', '*.googleusercontent.com'], bounty_range: '$100-$31,337' },
  'aws':        { name: 'Amazon AWS', platform: 'HackerOne', url: 'https://hackerone.com/amazon', scope: ['aws/aws-cli', 'aws/aws-sdk-*'], bounty_range: '$1,000-$5,000' },
  'azure':      { name: 'Microsoft Azure', platform: 'MSRC', url: 'https://microsoft.com/msrc/bounty', scope: ['Azure/azure-sdk-for-*', 'Azure/azure-cli'], bounty_range: '$500-$10,000' },
  'github':     { name: 'GitHub', platform: 'HackerOne', url: 'https://hackerone.com/github', scope: ['github/github', 'github/visualstudio'], bounty_range: '$500-$20,000' },
  'gitlab':     { name: 'GitLab', platform: 'HackerOne', url: 'https://hackerone.com/gitlab', scope: ['gitlab-org/gitlabhq', 'gitlab-org/gitlab-*'], bounty_range: '$500-$10,000' },
  'stripe':     { name: 'Stripe', platform: 'HackerOne', url: 'https://hackerone.com/stripe', scope: ['stripe/stripe-*'], bounty_range: '$500-$10,000' },
  'paypal':     { name: 'PayPal', platform: 'Bugcrowd', url: 'https://bugcrowd.com/paypal', scope: ['paypal/*'], bounty_range: '$100-$5,000' },
  'chromium':   { name: 'Chromium', platform: 'Google VRP', scope: ['chromium/chromium'], bounty_range: '$500-$15,000' },
  'firefox':    { name: 'Mozilla Firefox', platform: 'Bugzilla', url: 'https://bugzilla.mozilla.org', scope: ['mozilla/firefox', 'mozilla/glean'], bounty_range: '$500-$10,000' },
  'chrome-extensions': { name: 'Chrome Extensions', platform: 'Open Bug Bounty', url: 'https://www.openbugbounty.org/', scope: [], bounty_range: '$50-$1,000', notes: 'Often have API key leaks in JS source' }
};

function discoverPrograms() {
  var keys = Object.keys(PROGRAMS);
  console.log('\n' + bold + 'Bug Bounty Programs (' + keys.length + ' programs)' + reset + '\n');
  console.log('  ' + blue + '%-20s' + reset + '  ' + dim + '%-15s' + reset + '  ' + dim + '%-15s' + reset + '  %s', 'Program', 'Platform', 'Bounty Range', 'Scope');
  console.log('  ' + '-'.repeat(80));
  var i, prog, scope;
  for (i = 0; i < keys.length; i++) {
    prog = PROGRAMS[keys[i]];
    scope = prog.scope.length > 0 ? prog.scope.slice(0, 2).join(', ') + (prog.scope.length > 2 ? '...' : '') : 'N/A';
    console.log('  ' + green + '%-20s' + reset + '  ' + dim + '%-15s' + reset + '  ' + yellow + '%-15s' + reset + '  ' + dim + '%s' + reset, prog.name, prog.platform, prog.bounty_range, scope);
  }
  console.log('\n' + dim + 'Run: node recon.js targets <name>' + reset + '\n');
}

function listTargets(program) {
  var prog = PROGRAMS[program];
  if (!prog) {
    log('Unknown program: ' + program + '. Run discover to see available programs.', 'error');
    return;
  }
  console.log('\n' + bold + 'Targets: ' + prog.name + reset + ' (' + prog.platform + ')\n');
  if (prog.url) console.log('  URL: ' + dim + prog.url + reset);
  console.log('  Bounty: ' + yellow + prog.bounty_range + reset);
  if (prog.notes) console.log('  ' + yellow + prog.notes + reset + '\n');
  if (prog.scope.length === 0) {
    console.log('  ' + dim + 'No static scope — use scan to discover targets' + reset + '\n');
  } else {
    console.log('  ' + blue + 'In-scope:' + reset);
    for (var j = 0; j < prog.scope.length; j++) console.log('    - ' + prog.scope[j]);
    console.log('\n' + dim + '  Run: node recon.js scan <target>' + reset + '\n');
  }
}

function cloneAndScan(target) {
  log('Scanning: ' + target, 'info');

  var owner, repo, localPath;
  if (target.indexOf('http') === 0) {
    // Use RegExp constructor to avoid JS parser issues with escaped slashes
    var m = target.match(RegExp('github\\\\.com/([^/]+)/([^/]+)'));
    if (!m) { log('Cannot parse URL: ' + target, 'error'); return; }
    owner = m[1]; repo = m[2];
  } else if (target.charAt(0) === '/') {
    localPath = target;
  } else {
    var parts = target.split('/');
    owner = parts[0]; repo = parts[1];
  }

  if (!localPath) localPath = join('/tmp', 'recon-targets', owner + '-' + repo);

  if (!existsSync(localPath)) {
    var url = 'https://github.com/' + owner + '/' + repo + '.git';
    log('Cloning ' + owner + '/' + repo + '...', 'info');
    try {
      execSync('git clone --depth 1 ' + url + ' ' + localPath + ' 2>&1', { stdio: 'pipe', timeout: 60000 });
    } catch (e) {
      log('Clone failed: ' + e.message, 'error');
      return;
    }
  }

  if (!existsSync(VULN_HUNTER_CLI)) {
    log('vuln-hunter not found: ' + VULN_HUNTER_CLI, 'error');
    return;
  }

  log('Running vuln-hunter secrets scan...', 'info');
  try {
    var outFile = '/tmp/vuln-hunter-recon.json';
    var cmd = 'node ' + VULN_HUNTER_CLI + ' secrets ' + localPath + ' -o ' + outFile + ' 2>&1';
    var result = execSync(cmd, { encoding: 'utf8', timeout: 120000 });
    console.log(result);

    if (existsSync(outFile)) {
      try {
        var data = JSON.parse(readFileSync(outFile, 'utf8'));
        if (data.total > 0) {
          log('Found ' + data.total + ' potential secrets!', 'warn');
          for (var k = 0; k < data.findings.length; k++) {
            var f = data.findings[k];
            console.error('\n' + red + '[CRITICAL]' + reset + ' ' + f.type + ' in ' + f.file + ':' + f.line);
            console.error('  ' + dim + 'Value: ' + f.value + reset);
            console.error('  ' + dim + 'CVE: ' + f.cve + ' | Severity: ' + f.severity + reset);
            generateReport(f, target);
          }
        } else {
          log('No secrets found.', 'info');
        }
      } catch (e) { /* Not JSON */ }
    }
  } catch (e) {
    log('Scan failed: ' + e.message, 'error');
  }
}

function generateReport(finding, target) {
  mkdirSync(FINDINGS_DIR, { recursive: true });
  mkdirSync(REPORTS_DIR, { recursive: true });

  var id = 'HACK-' + Date.now().toString(36).toUpperCase();
  var today = new Date().toISOString().split('T')[0];
  var platform = detectPlatform(target);
  var sev = (finding.severity || 'CRITICAL').toUpperCase();
  var cve = finding.cve || 'TBD';
  var ftype = finding.type;
  var ffile = finding.file;
  var fline = String(finding.line);
  var fvalue = finding.value;

  // Build steps using plain string concatenation
  var step1 = '1. Clone: git clone ' + target;
  var step2 = '2. Navigate to: ' + ffile;
  var step3 = '3. Line ' + fline + ': ' + fvalue;

  var lines = [
    '# Security Disclosure Report',
    '',
    '**Report ID:** ' + id,
    '**Date:** ' + today,
    '**Status:** Draft',
    '',
    '## Finding Summary',
    '',
    '| Field | Value |',
    '|-------|-------|',
    '| Type | ' + ftype + ' |',
    '| Severity | ' + sev + ' |',
    '| CVE | ' + cve + ' |',
    '| File | ' + ffile + ':' + fline + ' |',
    '| Target | ' + target + ' |',
    '',
    '## Description',
    '',
    'A ' + ftype.toLowerCase() + ' was found hardcoded in the source code of ' + target + '.',
    '',
    '## Steps to Reproduce',
    '',
    step1,
    step2,
    step3,
    '',
    '## Recommended Remediation',
    '',
    getRemediation(ftype),
    '',
    '## Disclosure Timeline',
    '',
    '| Date | Action |',
    '|------|--------|',
    '| ' + today + ' | Finding discovered |',
    '| ' + today + ' | Report drafted |',
    '| TBD | Submitted to ' + platform.name + ' |',
    '| TBD | Bounty awarded |',
    '',
    '## Metadata',
    '',
    '- **Scanner:** vuln-hunter',
    '- **Target:** ' + target,
    '- **Bounty Range:** ' + platform.bounty,
    '- **Platform:** ' + platform.name,
    '',
    '---',
    '*Generated by vuln-hunter recon.js*'
  ];

  var report = lines.join('\n');
  var reportPath = join(REPORTS_DIR, id + '.md');
  writeFileSync(reportPath, report);
  log('Report: ' + reportPath, 'info');

  var findingPath = join(FINDINGS_DIR, id + '.json');
  var findingData = { id: id };
  for (var key in finding) findingData[key] = finding[key];
  findingData.target = target;
  findingData.created = today;
  writeFileSync(findingPath, JSON.stringify(findingData, null, 2));
  log('Finding: ' + findingPath, 'info');
}

function detectPlatform(target) {
  var keys = Object.keys(PROGRAMS);
  for (var i = 0; i < keys.length; i++) {
    var prog = PROGRAMS[keys[i]];
    if (prog.scope) {
      for (var j = 0; j < prog.scope.length; j++) {
        if (target.indexOf(prog.scope[j].split('/')[0]) !== -1) {
          return { name: prog.platform, url: prog.url || 'N/A', bounty: prog.bounty_range };
        }
      }
    }
  }
  return { name: 'GitHub', url: 'N/A', bounty: '$500-$20,000' };
}

function getRemediation(type) {
  var map = {
    'AWS Access Key': '1. Rotate the key immediately in AWS IAM\n2. Use environment variables or AWS Secrets Manager\n3. Enable CloudTrail monitoring\n4. Never commit credentials to version control',
    'GitHub Token': '1. Revoke the token in GitHub settings\n2. Use GitHub Actions secrets for CI/CD\n3. Enable token expiration and scoped access',
    'Private Key': '1. Generate a new key pair immediately\n2. Use a secrets manager\n3. Implement certificate rotation\n4. Never store private keys in source code',
    'Database Connection String': '1. Rotate database credentials\n2. Use environment variables\n3. Enable database audit logging',
    'Stripe API Key': '1. Rotate the key in Stripe Dashboard\n2. Use restricted API keys with minimal scope\n3. Use webhook signatures for verification'
  };
  return map[type] || '1. Remove the hardcoded credential\n2. Use environment variables or secrets management\n3. Implement credential rotation\n4. Add pre-commit hooks to prevent future leaks';
}

function runMonitorLoop() {
  log('Starting continuous recon loop (5 min intervals)...', 'info');
  var stateFile = join(ROOT, '14__VULN_HUNTER', '.recon_state.json');
  var state = {};
  try { state = JSON.parse(readFileSync(stateFile, 'utf8')); } catch (e) { /* ignore */ }

  var scanned = {};
  if (state.scanned) {
    for (var i = 0; i < state.scanned.length; i++) scanned[state.scanned[i]] = true;
  }
  function scannedHas(t) { return Object.prototype.hasOwnProperty.call(scanned, t); }
  var targets = [
    'ytdl-org/youtube-dl', 'aws/aws-cli', 'stripe/stripe-node',
    'github/github', 'nodejs/node', 'python/cpython', 'tensorflow/tensorflow'
  ];

  var cycle = 0;
  var tick = function() {
    cycle++;
    log('Cycle ' + cycle + ' started', 'meta');
    for (var j = 0; j < targets.length; j++) {
      var t = targets[j];        if (!scannedHas(t)) {
            log('Scanning: ' + t, 'info');
            cloneAndScan(t);
            scanned[t] = true;
          }
    }
    state.scanned = Object.keys(scanned);
    writeFileSync(stateFile, JSON.stringify(state));
    log('Cycle ' + cycle + ' complete. Next in 5 min.', 'meta');
    setTimeout(tick, 300000);
  };
  tick();
}

var args = process.argv;
var command = args[2];
var restArgs = args.slice(3);

var HELP = [
  '',
  bold + 'Bug Bounty Recon Tool' + reset,
  dim + 'Integrates with vuln-hunter for automated vulnerability discovery' + reset,
  '',
  'USAGE:',
  '  node recon.js discover                   List programs',
  '  node recon.js targets <program>          List targets',
  '  node recon.js scan <target>              Scan a repo (owner/repo or URL)',
  '  node recon.js monitor                    Continuous recon loop',
  '',
  'EXAMPLES:',
  '  node recon.js discover',
  '  node recon.js targets youtube-dl',
  '  node recon.js scan ytdl-org/youtube-dl',
  '  node recon.js scan https://github.com/aws/aws-cli',
  ''
].join('\n');

if (!command) { console.log(HELP); process.exit(0); }

if (command === 'discover') {
  discoverPrograms();
} else if (command === 'targets') {
  if (!restArgs[0]) { log('Usage: node recon.js targets <program>', 'error'); process.exit(1); }
  listTargets(restArgs[0]);
} else if (command === 'scan') {
  if (!restArgs[0]) { log('Usage: node recon.js scan <target>', 'error'); process.exit(1); }
  cloneAndScan(restArgs[0]);
} else if (command === 'monitor') {
  runMonitorLoop();
} else {
  log('Unknown command: ' + command, 'error');
  process.exit(1);
}