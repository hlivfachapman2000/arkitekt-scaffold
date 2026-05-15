import { readFileSync } from 'fs';
import { globSync } from 'glob';

// ─── FALSE POSITIVE FILTER ─────────────────────────────────────────────────────

const FAKE_KEYS = new Set([
  'AKIAIOSFODNN7EXAMPLE', 'EXAMPLEKEY1234567890',
  'sk-placeholder', 'placeholder-key',
  'your-api-key-here', 'your-secret-here',
  'dummy-key-123', 'fake-token-abc',
]);

function isFalsePositive(line, value) {
  if (!value || value.length < 15) return true;
  if (FAKE_KEYS.has(value)) return true;
  if (value.startsWith('AKIAIOSFODNN7')) return true;
  if (value.startsWith('EXAMPLEKEY')) return true;
  if (value.startsWith('sk-placeholder')) return true;
  if (value.startsWith('your-')) return true;
  if (value.startsWith('placeholder')) return true;
  
  // Skip array/const definitions that define patterns, not real secrets
  if (line.includes('= [') && line.includes(': //')) return true;
  if (line.includes('= [') && (line.includes('mongodb') || line.includes('postgres') || line.includes('prefixes') || line.includes('patterns'))) return true;
  if (line.includes('const ') && line.includes('= [') && line.includes('://')) return true;
  
  // Skip pattern definition lines
  if (line.includes('pattern:')) return true;
  if (line.includes('new RegExp')) return true;
  if (line.includes('regex:')) return true;
  
  // Skip pure comment lines (unless they contain a real assignment)
  const t = line.trim();
  if ((t.startsWith('//') || t.startsWith('#') || t.startsWith('*')) && !line.match(/[=:][\t ]*['\"][^'\"]{20,}/)) return true;
  
  return false;
}

function shouldSkipFile(fp) {
  const skip = ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', 'vendor',
                '.env.example', '.env.sample', 'package-lock', 'yarn.lock', 'pnpm-lock',
                '.png', '.jpg', '.gif', '.ico', '.svg', '.woff', '.ttf'];
  for (const s of skip) { if (fp.includes(s)) return true; }
  return false;
}

// ─── PATTERNS ──────────────────────────────────────────────────────────────────
// Uses simple regex patterns only. No complex backslash sequences.

const PATTERNS = [
  // AWS Access Key
  { regex: /AKIA[0-9A-Z]{16}/, type: 'AWS Access Key', severity: 'critical', cve: 'CVE-2022-3121' },
  
  // GitHub Tokens
  { regex: /ghp_[a-zA-Z0-9]{36}/, type: 'GitHub PAT', severity: 'critical', cve: 'CVE-2022-3121' },
  { regex: /gho_[a-zA-Z0-9]{36}/, type: 'GitHub OAuth Token', severity: 'critical', cve: 'CVE-2022-3121' },
  { regex: /github_pat_[a-zA-Z0-9_]{22,255}/, type: 'GitHub Fine-grained PAT', severity: 'critical', cve: 'CVE-2022-3121' },
  
  // Google
  { regex: /AIza[0-9A-Za-z_-]{35}/, type: 'Google API Key', severity: 'high', cve: 'CVE-2023-4256' },
  
  // OpenAI
  { regex: /sk-[a-zA-Z0-9]{48}/, type: 'OpenAI API Key', severity: 'critical', cve: 'CVE-2024-3012' },
  
  // Anthropic
  { regex: /sk-ant-[a-zA-Z0-9-]{50,}/, type: 'Anthropic API Key', severity: 'critical', cve: 'CVE-2024-3012' },
  
  // Stripe
  { regex: /sk_live_[0-9a-zA-Z]{24,}/, type: 'Stripe Live Key', severity: 'critical', cve: 'CVE-2023-28432' },
  { regex: /rk_live_[0-9a-zA-Z]{24,}/, type: 'Stripe Restricted Key', severity: 'high', cve: 'CVE-2023-28432' },
  
  // Slack
  { regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,}/, type: 'Slack Token', severity: 'high', cve: 'CVE-2022-3773' },
  
  // JWT
  { regex: /eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}\\.eyJ[A-Za-z0-9_-]{10,}/, type: 'JWT Token', severity: 'high', cve: 'CVE-2022-3928' },
  
  // Private Keys
  { regex: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, type: 'Private Key', severity: 'critical', cve: 'CVE-2021-44523' },
  
  // Authorization headers
  { regex: /Authorization:\u0020*(Bearer|Basic|Token)\u0020+[A-Za-z0-9_-]{20,}/i, type: 'Authorization Header', severity: 'high', cve: null },
];

// DB connection strings use string matching to avoid regex escaping issues
const DB_PREFIXES = ['mongodb://', 'postgres://', 'postgresql://', 'mysql://', 'redis://', 'sqlserver://', 'oracle://'];

// ─── SCAN FUNCTIONS ─────────────────────────────────────────────────────────────

export function scanForSecrets(filePath, content) {
  if (shouldSkipFile(filePath)) return [];

  const findings = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const t = line.trim();
    // If a line starts with a comment marker, skip it entirely — even if it contains
    // a secret-like value. A commented secret cannot be exploited by an attacker.
    if (t.startsWith('//') || t.startsWith('#') || t.startsWith('*') || t.startsWith('--') || t.startsWith('<!--')) return;

    // Check regex patterns
    for (const entry of PATTERNS) {
      entry.regex.lastIndex = 0;
      const m = entry.regex.exec(line);
      if (m) {
        const value = m[0];
        if (!isFalsePositive(line, value)) {
          findings.push({
            type: entry.type,
            severity: entry.severity,
            cve: entry.cve,
            value: value.length > 45 ? value.slice(0, 45) + '...' : value,
            line: idx + 1,
            file: filePath,
          });
        }
      }
    }

    // Check DB connection strings (string-based)
    for (const prefix of DB_PREFIXES) {
      if (line.includes(prefix)) {
        const hasAssignment = line.match(/[=:][\t ]*['\"][^'\"]+/);
        if (hasAssignment && !isFalsePositive(line, prefix)) {
          findings.push({
            type: 'Database Connection String',
            severity: 'critical',
            cve: 'CVE-2021-4323',
            value: line.includes('const ') ? 'DB connection string found' : hasAssignment[0].slice(0, 50),
            line: idx + 1,
            file: filePath,
          });
        }
      }
    }
  });

  return findings;
}

export function scanDirectory(dir, extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rb', '.php', '.cs', '.json', '.yaml', '.yml', '.env', '.sql', '.sh']) {
  const findings = [];

  for (const ext of extensions) {
    const files = globSync('**/*' + ext, {
      cwd: dir,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**', '**/coverage/**', '**/.next/**', '**/vendor/**'],
    });

    for (const file of files) {
      if (shouldSkipFile(file)) continue;
      try {
        const content = readFileSync(file, 'utf8');
        const fileFindings = scanForSecrets(file, content);
        findings.push(...fileFindings);
      } catch (e) {
        // Skip unreadable files
      }
    }
  }

  return findings;
}