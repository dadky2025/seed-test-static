// Installs the git hooks after `pnpm install` — only in a git checkout, never in CI.
import { spawnSync } from 'node:child_process';

const inGitCheckout =
  spawnSync('git', ['rev-parse', '--git-dir'], { stdio: 'ignore' }).status === 0;

if (!inGitCheckout || process.env.CI) {
  process.exit(0);
}

const result = spawnSync('pnpm', ['exec', 'lefthook', 'install'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status ?? 1);
