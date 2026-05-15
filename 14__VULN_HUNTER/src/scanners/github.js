import simpleGit from 'simple-git';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import chalk from 'chalk';
import axios from 'axios';

export async function scanGitHubRepo(repoUrl, options = {}) {
  const tmpPath = join(tmpdir(), `vuln-hunter-${Date.now()}`);
  const git = simpleGit();
  
  console.log(chalk.blue(`\n📥 Cloning ${repoUrl}...`));
  
  try {
    await git.clone(repoUrl, tmpPath, ['--depth', '1', '--quiet']);
    console.log(chalk.green('✓ Repository cloned'));
    
    return tmpPath;
  } catch (error) {
    console.log(chalk.red(`✗ Failed to clone: ${error.message}`));
    return null;
  }
}

export async function checkGitHubSecrets(token) {
  // Check own repos for exposed secrets using GitHub API
  console.log(chalk.blue('\n🔍 Checking your GitHub repositories for exposed secrets...'));
  
  try {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
      params: { per_page: 100, sort: 'updated' },
    });
    
    const repos = response.data.map(r => r.full_name);
    console.log(chalk.green(`✓ Found ${repos.length} repositories`));
    
    return repos;
  } catch (error) {
    console.log(chalk.red(`✗ GitHub API error: ${error.message}`));
    return [];
  }
}

export async function findExposedSecretsInOrg(orgName, token) {
  // Scan all repos in an organization for exposed secrets
  console.log(chalk.blue(`\n🔍 Scanning organization: ${orgName}`));
  
  try {
    const response = await axios.get(`https://api.github.com/orgs/${orgName}/repos`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json',
      },
      params: { per_page: 100, type: 'public' },
    });
    
    const repos = response.data.map(r => r.full_name);
    console.log(chalk.green(`✓ Found ${repos.length} public repositories`));
    
    return repos;
  } catch (error) {
    console.log(chalk.red(`✗ GitHub API error: ${error.message}`));
    return [];
  }
}

export function cleanupClone(tmpPath) {
  if (tmpPath && tmpPath.startsWith(tmpdir())) {
    try {
      rmSync(tmpPath, { recursive: true, force: true });
    } catch (e) {
      // Cleanup failed, ignore
    }
  }
}