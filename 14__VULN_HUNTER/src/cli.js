#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { scanDirectory } from './scanners/secrets.js';
import { scanCode } from './scanners/code.js';
import { scanGitHubRepo, cleanupClone } from './scanners/github.js';
import { printReport, generateMarkdown, generateJSON, generateHTMLReport } from './reporters/html.js';

const program = new Command();

program
  .name('vuln-hunter')
  .description('AI-powered vulnerability scanner for bug bounty hunting')
  .version('1.0.0');

program
  .command('scan <path>')
  .description('Scan a local directory for vulnerabilities')
  .option('-s, --secrets-only', 'Only scan for secrets')
  .option('-c, --code-only', 'Only scan for code patterns')
  .option('-o, --output <file>', 'Save report to file')
  .option('-f, --format <format>', 'Output format: console, json, markdown, html', 'console')
  .action(async (path, options) => {
    console.log(chalk.bold.cyan('\n VulnHunter - Vulnerability Scanner'));
    console.log(chalk.gray('-'.repeat(50)));
    
    if (!existsSync(path)) {
      console.log(chalk.red(`Path does not exist: ${path}`));
      process.exit(1);
    }
    
    const allFindings = [];
    
    // Scan for secrets
    if (!options.codeOnly) {
      console.log(chalk.blue('\n Scanning for exposed secrets...'));
      const secretFindings = scanDirectory(path);
      if (secretFindings.length > 0) {
        console.log(chalk.red(`Found ${secretFindings.length} exposed secret(s)!`));
        printReport(secretFindings, 'secrets');
        allFindings.push(...secretFindings.map(f => ({ ...f, category: 'secret' })));
      } else {
        console.log(chalk.green('No exposed secrets found'));
      }
    }
    
    // Scan for code vulnerabilities
    if (!options.secretsOnly) {
      console.log(chalk.blue('\n Scanning for code vulnerabilities...'));
      const codeFindings = scanCode(path);
      if (codeFindings.length > 0) {
        console.log(chalk.red(`Found ${codeFindings.length} potential vulnerability(ies)!`));
        printReport(codeFindings, 'code');
        allFindings.push(...codeFindings.map(f => ({ ...f, category: 'code' })));
      } else {
        console.log(chalk.green('No code vulnerabilities found'));
      }
    }
    
    // Save report
    if (options.output) {
      if (options.format === 'json') {
        writeFileSync(options.output, generateJSON(allFindings));
      } else if (options.format === 'markdown') {
        writeFileSync(options.output, generateMarkdown(allFindings));
      } else if (options.format === 'html') {
        writeFileSync(options.output, generateHTMLReport(allFindings));
      }
      console.log(chalk.green(`\n Report saved to ${options.output}`));
    }
    
    // Summary
    console.log(chalk.bold.gray('\n-'.repeat(50)));
    if (allFindings.length === 0) {
      console.log(chalk.green('Scan complete - No vulnerabilities found!'));
    } else {
      const critical = allFindings.filter(f => f.severity === 'critical').length;
      const high = allFindings.filter(f => f.severity === 'high').length;
      console.log(chalk.red(`\n Scan complete - Found ${allFindings.length} vulnerability(ies)`));
      if (critical > 0) console.log(chalk.red(`  Critical: ${critical}`));
      if (high > 0) console.log(chalk.magenta(`  High: ${high}`));
      console.log(chalk.gray('\n Submit critical/high findings to bug bounty programs!'));
    }
  });

program
  .command('hunter <repo_url>')
  .description('Scan a GitHub repository URL for vulnerabilities')
  .option('-o, --output <file>', 'Save report to file')
  .option('-f, --format <format>', 'Output format: console, json, markdown, html', 'console')
  .action(async (repoUrl, options) => {
    console.log(chalk.bold.cyan('\n VulnHunter - GitHub Hunter Mode'));
    console.log(chalk.gray('-'.repeat(50)));
    
    const tmpPath = await scanGitHubRepo(repoUrl);
    if (!tmpPath) {
      console.log(chalk.red('Failed to clone repository'));
      process.exit(1);
    }
    
    // Scan the cloned repo
    console.log(chalk.blue('\n Scanning repository for vulnerabilities...'));
    const secretFindings = scanDirectory(tmpPath);
    const codeFindings = scanCode(tmpPath);
    
    const allFindings = [
      ...secretFindings.map(f => ({ ...f, category: 'secret' })),
      ...codeFindings.map(f => ({ ...f, category: 'code' })),
    ];
    
    // Print results BEFORE cleanup
    if (secretFindings.length > 0) {
      console.log(chalk.red(`\n Found ${secretFindings.length} exposed secret(s) in public repo!`));
      printReport(secretFindings, 'secrets');
    }
    
    if (codeFindings.length > 0) {
      console.log(chalk.red(`\n Found ${codeFindings.length} potential vulnerability(ies)!`));
      printReport(codeFindings, 'code');
    }
    
    // Cleanup after scan is complete
    cleanupClone(tmpPath);
    
    if (allFindings.length === 0) {
      console.log(chalk.green('\n No vulnerabilities found'));
    } else {
      console.log(chalk.bold.gray('\n-'.repeat(50)));
      console.log(chalk.red(`\n Total: ${allFindings.length} finding(s)`));
      console.log(chalk.gray('\n These are public vulnerabilities - report responsibly!\n'));
    }
    
    // Save report
    if (options.output) {
      writeFileSync(options.output, generateJSON(allFindings));
      console.log(chalk.green(`Report saved to ${options.output}`));
    }
  });

program
  .command('secrets <path>')
  .description('Quick scan for exposed secrets (API keys, tokens, credentials)')
  .option('-o, --output <file>', 'Save report to JSON file')
  .action(async (path, options) => {
    console.log(chalk.bold.cyan('\n Quick Secret Scan'));
    console.log(chalk.gray('-'.repeat(50)));
    
    if (!existsSync(path)) {
      console.log(chalk.red(`Path does not exist: ${path}`));
      process.exit(1);
    }
    
    const findings = scanDirectory(path);
    
    if (findings.length > 0) {
      console.log(chalk.red(`\n Found ${findings.length} exposed secret(s)!`));
      printReport(findings, 'secrets');
      
      if (options.output) {
        writeFileSync(options.output, generateJSON(findings));
        console.log(chalk.green(`\n Report saved to ${options.output}`));
      }
      
      console.log(chalk.bold.gray('\n Critical secrets = bug bounty money!\n'));
    } else {
      console.log(chalk.green('\n No exposed secrets found'));
    }
  });

// Demo command
program
  .command('demo')
  .description('Run demo scan to see sample output')
  .action(async () => {
    console.log(chalk.bold.cyan('\n VulnHunter Demo Mode'));
    console.log(chalk.gray('-'.repeat(50)));
    console.log(chalk.yellow('\n This is a DEMO - using synthetic test data\n'));
    
    const demoFindings = [
      {
        type: 'AWS Access Key',
        severity: 'critical',
        cve: 'CVE-2022-3121',
        value: 'AKIAIOSFODNN7EXAMPLE',
        file: 'config/production.js',
        line: 42,
      },
      {
        type: 'GitHub Personal Access Token',
        severity: 'critical',
        cve: 'CVE-2022-3121',
        value: 'ghp_xK4P3L9M8N2B7V5C4T1J6H8R9D0E3Q2W4Y6',
        file: 'src/github.js',
        line: 15,
      },
      {
        type: 'SQL Injection',
        severity: 'critical',
        cve: 'CVE-2024-21538',
        description: 'User input directly concatenated into SQL query',
        file: 'src/database/queries.js',
        line: 87,
        snippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
      },
      {
        type: 'Hardcoded Credentials',
        severity: 'critical',
        cve: 'CVE-2024-21753',
        description: 'Hardcoded database password in source code',
        file: 'src/config/db.js',
        line: 23,
        snippet: 'password: \"admin123!@#\",',
      },
      {
        type: 'JWT Algorithm Confusion',
        severity: 'critical',
        cve: 'CVE-2022-3920',
        description: 'JWT algorithm set to none allows token forgery',
        file: 'src/auth/jwt.js',
        line: 34,
        snippet: 'algorithm: \"none\",',
      },
      {
        type: 'SSRF',
        severity: 'critical',
        cve: 'CVE-2024-2928',
        description: 'Server makes requests to user-controlled URLs',
        file: 'src/webhook/processor.js',
        line: 56,
        snippet: 'await fetch(userProvidedUrl);',
      },
      {
        type: 'CORS Wildcard',
        severity: 'medium',
        cve: 'CVE-2023-49798',
        description: 'CORS allows all origins',
        file: 'src/middleware/cors.js',
        line: 12,
        snippet: 'Access-Control-Allow-Origin: *',
      },
    ];
    
    printReport(demoFindings, 'demo');
    
    console.log(chalk.bold.cyan('\n Potential Bounty Value:'));
    console.log(chalk.green('  Critical findings: $500 - $10,000+ each'));
    console.log(chalk.magenta('  High findings: $200 - $2,500 each'));
    console.log(chalk.yellow('  Medium findings: $100 - $500 each\n'));
    console.log(chalk.gray('Scan your own repos: vuln-hunter scan /path/to/repo'));
    console.log(chalk.gray('Scan GitHub repos: vuln-hunter hunter https://github.com/user/repo\n'));
  });

program.parse();