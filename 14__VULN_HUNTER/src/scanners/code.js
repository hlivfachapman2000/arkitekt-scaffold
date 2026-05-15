import { readFileSync } from 'fs';
import { globSync } from 'glob';

// User input markers — indicate user-controlled data reaching the vulnerability
const USER_INPUT_MARKERS = [
  '${', 'request.', 'req.', 'params.', 'query.', 'body.', 'input.',
  'post(', 'get(', 'headers[', 'cookies.', 'session.', 'form.',
  'argv', 'sys.argv', 'process.argv',
  'user_', 'input_', 'data_', 'id=', 'ids=', 'url=', 'q=', 'search=',
];

// Skip comment lines — these describe vulnerabilities, they don't contain them
const SKIP_LINE_PREFIXES = ['//', '#', '*', '--', '/*', '<!--', '* ', 'TODO', 'FIXME', 'XXX', '>>>', '>>> '];

function hasUserInput(line) {
  const lower = line.toLowerCase();
  return USER_INPUT_MARKERS.some(m => lower.includes(m));
}

function isSkipLine(line) {
  const t = line.trim();
  for (const prefix of SKIP_LINE_PREFIXES) {
    if (t.startsWith(prefix)) return true;
  }
  return false;
}

function hasAssignment(line) {
  return line.match(/[a-zA-Z_$][\u0020\ta-zA-Z0-9_$]*[=:][\u0020\t]/);
}

// ─── LANGUAGE-SPECIFIC SQL INJECTION DETECTION ─────────────────────────────────

// Python uses % formatting and .format() for SAFE parameter binding in execute().
// We only flag when user input is directly concatenated with + into the SQL string.
function isPythonSQLInjection(line) {
  // Must have cursor.execute or similar DB call
  if (!line.includes('execute') && !line.includes('query(') && !line.includes('sql')) return false;
  
  // f-string with user input: cursor.execute(f'SELECT * FROM {user_input}')
  // This IS dangerous — user_input interpolated directly into SQL
  if (line.includes('f\u0022') || line.includes('f\u0027') || line.includes('f\"') || line.includes('f\u0027')) {
    return true;
  }
  
  // String concatenation with + and user input: cursor.execute('SELECT * FROM ' + user_input)
  // This IS dangerous — SQL built by concatenating user string
  const hasPlus = line.includes(' + ');
  const hasUserVar = hasUserInput(line);
  if (hasPlus && hasUserVar) return true;
  
  return false;
}

// JS/TS: check for template literal injection or string concatenation
function isJSSQLInjection(line) {
  if (!hasUserInput(line)) return false;
  // Template literal with user input in SQL: `SELECT * FROM ${userInput}`
  if (line.includes('${') && (line.includes('SELECT') || line.includes('query'))) return true;
  // String concatenation with +
  if (line.includes(' + ') && (line.includes('SELECT') || line.includes('query'))) return true;
  return false;
}

// Java/PHP/CS: similar to JS
function isGenericSQLInjection(line) {
  if (!hasUserInput(line)) return false;
  if (line.includes('${') && (line.includes('SELECT') || line.includes('query'))) return true;
  if (line.includes(' + ') && (line.includes('SELECT') || line.includes('query'))) return true;
  // Prepared statement parameter markers are safe, skip
  if (line.includes('?')) return false;
  return false;
}

// ─── VULNERABILITY SIGNATURES ──────────────────────────────────────────────────

const VULN_SIGNATURES = [
  // Code Injection: eval() with user input
  {
    keywords: ['eval('],
    type: 'Code Injection via eval()',
    severity: 'critical', cve: 'CVE-2024-28847',
    description: 'User input passed to eval() — allows arbitrary code execution',
    languages: ['js', 'ts', 'py', 'php'],
    check: (line, lang) => hasUserInput(line) && hasAssignment(line),
  },

  // SQL Injection: language-specific checking
  {
    keywords: ['execute(', 'query(', 'SELECT ', 'cursor.execute', 'sql +=', 'query +'],
    type: 'SQL Injection',
    severity: 'critical', cve: 'CVE-2024-21538',
    description: 'User input concatenated into SQL query — allows data extraction/modification',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs', 'go'],
    check: (line, lang) => {
      if (lang === 'py') return isPythonSQLInjection(line);
      if (lang === 'js' || lang === 'ts') return isJSSQLInjection(line);
      return isGenericSQLInjection(line);
    },
  },

  // XSS: DOM insertion with user input
  {
    keywords: ['innerHTML', 'outerHTML', 'document.write', 'dangerouslySetInnerHTML'],
    type: 'Cross-Site Scripting (XSS)',
    severity: 'high', cve: 'CVE-2024-24989',
    description: 'User input directly assigned to dangerous DOM property',
    languages: ['js', 'ts'],
    check: (line) => hasUserInput(line) && hasAssignment(line),
  },

  // Command Injection: exec/spawn with user input
  {
    keywords: ['exec(', 'spawn(', 'execSync', 'system(', 'popen', 'subprocess', 'os.system', 'shell=True'],
    type: 'OS Command Injection',
    severity: 'critical', cve: 'CVE-2024-21539',
    description: 'User input passed to system command — allows server compromise',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs', 'go'],
    check: (line) => hasUserInput(line),
  },

  // SSRF: fetch with user-controlled URL
  {
    keywords: ['fetch(', 'axios', 'requests.', 'urllib', 'HttpClient', 'urlopen', '.get(', 'http://'],
    type: 'Server-Side Request Forgery (SSRF)',
    severity: 'critical', cve: 'CVE-2024-2928',
    description: 'User-controlled URL passed to server-side HTTP request — allows internal network access',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs', 'go'],
    check: (line) => hasUserInput(line),
  },

  // Path Traversal: file ops with user input
  {
    keywords: ['readFile(', 'open(', 'FileInputStream', 'include(', 'require(', 'fopen', 'readline', 'Path(', 'resolve('],
    type: 'Path Traversal',
    severity: 'high', cve: 'CVE-2024-27198',
    description: 'User input used in file path operations — allows arbitrary file access',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs', 'go'],
    check: (line) => hasUserInput(line),
  },

  // Insecure Deserialization
  {
    keywords: ['unserialize', 'pickle.loads', 'marshal.loads', 'readObject', 'yaml.load', 'eval('],
    type: 'Insecure Deserialization',
    severity: 'critical', cve: 'CVE-2024-2961',
    description: 'Deserializing untrusted data — can lead to remote code execution',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs'],
    check: (line, lang) => lang === 'py' ? line.includes('pickle') || line.includes('yaml') : true,
  },

  // Hardcoded Credentials: password/secret with string assignment
  {
    keywords: ['password', 'passwd', 'pwd', 'secret', 'token', 'api_key', 'apikey', 'access_key'],
    type: 'Hardcoded Credentials',
    severity: 'critical', cve: 'CVE-2024-21753',
    description: 'Sensitive credentials hardcoded in source code',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs', 'go', 'rb'],
    check: (line) => hasAssignment(line) && /[=:]\u0020*['\"][^'\"]{6,}/.test(line),
  },

  // JWT 'none' algorithm
  {
    keywords: ['algorithm', 'none', 'jwt'],
    type: 'JWT Algorithm Confusion (none)',
    severity: 'critical', cve: 'CVE-2022-3920',
    description: 'JWT algorithm set to none — allows token forgery',
    languages: ['js', 'ts', 'py'],
    check: (line) => line.includes('none') && line.match(/algorithm.*none|algorithm.*:\u0020*['\"]?none/i),
  },

  // CORS wildcard
  {
    keywords: ['Access-Control-Allow-Origin'],
    type: 'CORS Misconfiguration',
    severity: 'medium', cve: 'CVE-2023-49798',
    description: 'CORS allows wildcard origin — sensitive data accessible from any site',
    languages: ['js', 'ts'],
    check: (line) => line.includes('\u002a') && hasAssignment(line),
  },

  // XXE
  {
    keywords: ['parseXML', 'XMLReader', 'DocumentBuilder', 'ElementTree.parse'],
    type: 'XML External Entity (XXE)',
    severity: 'critical', cve: 'CVE-2024-24817',
    description: 'XML parser processes external entities — allows file reading and SSRF',
    languages: ['js', 'ts', 'java', 'php', 'cs', 'py'],
    check: () => true,
  },

  // Weak crypto
  {
    keywords: ['MD5', 'SHA1', 'RC4', 'DES'],
    type: 'Weak Cryptographic Algorithm',
    severity: 'medium', cve: 'CVE-2024-3144',
    description: 'Weak cryptographic algorithm used',
    languages: ['js', 'ts', 'py', 'java', 'php', 'cs', 'go'],
    check: (line) => line.match(/[=:]\u0020*['\"][A-Fa-f0-9]{24,}/),
  },
];

const SKIP_DIRS = [
  'node_modules', '.git', 'dist', 'build', 'coverage', '.next',
  '__pycache__', 'vendor', 'target', '.gradle', 'venv', '.venv',
  '.pytest_cache', '.tox', 'venv38',
];

// ─── SCAN FUNCTION ─────────────────────────────────────────────────────────────

export function scanCode(directory) {
  const findings = [];

  for (const sig of VULN_SIGNATURES) {
    for (const lang of sig.languages) {
      const files = globSync('**/*.' + lang, {
        cwd: directory,
        absolute: true,
        ignore: SKIP_DIRS.map(d => '**/' + d + '/**'),
      });

      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf8');
          const lines = content.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip comment lines
            if (isSkipLine(line)) continue;

            // Check vulnerability keywords
            const lowerLine = line.toLowerCase();
            const hasKeyword = sig.keywords.some(k => lowerLine.includes(k.toLowerCase()));
            if (!hasKeyword) continue;

            // Run signature-specific check
            if (!sig.check(line, lang)) continue;

            const trimmed = line.trim();
            findings.push({
              type: sig.type,
              severity: sig.severity,
              cve: sig.cve,
              description: sig.description,
              file,
              line: i + 1,
              snippet: trimmed.length > 120 ? trimmed.slice(0, 120) + '...' : trimmed,
            });
          }
        } catch (e) {
          // Skip unreadable files
        }
      }
    }
  }

  return findings;
}