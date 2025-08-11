import { execSync } from 'node:child_process';
import process from 'node:process';

// Extract PRs merged into main in the past N days (default 30) using git log
// Handles both merge commits ("Merge pull request #123 ...") and squash merges ("Title (#123)")

const DAYS_DEFAULT = 30;

function getSinceIsoDate(daysAgo = DAYS_DEFAULT) {
  const now = new Date();
  const since = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

function resolveTargetRef(preferred) {
  const candidates = [];
  if (preferred) {
    // Allow passing either 'main' or 'origin/main'
    candidates.push(
      preferred.includes('/') ? preferred : `origin/${preferred}`,
    );
    if (!preferred.includes('/')) candidates.push(preferred);
  }

  // Default to main
  candidates.push('origin/main', 'main');

  // Try remote default branch (origin/HEAD)
  try {
    const originHead = execSync('git rev-parse --abbrev-ref origin/HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .trim()
      .replace(/^origin\//, 'origin/');
    if (originHead) candidates.push(originHead);
  } catch {}

  // Other common names
  candidates.push(
    'origin/development',
    'development',
    'origin/master',
    'master',
  );

  for (const ref of candidates) {
    try {
      execSync(`git rev-parse --verify ${ref} --quiet`, {
        stdio: ['ignore', 'ignore', 'ignore'],
      });
      return ref;
    } catch {}
  }
  throw new Error(
    'Unable to resolve a target branch ref (tried main/development/master).',
  );
}

function runGitLog(sinceIso, ref) {
  // Use %x7C to render literal '|' to avoid shell piping
  const pretty = '%H%x7C%cI%x7C%s';
  const cmd = `git log --no-color --first-parent ${ref} --since='${sinceIso}' --pretty=format:${pretty}`;
  const output = execSync(cmd, { encoding: 'utf8' });
  return { output, usedRef: ref };
}

function parsePrsFromGitLog(logOutput) {
  const lines = logOutput
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const prs = [];
  const seen = new Set();

  for (const line of lines) {
    const [hash, isoDate, subject] = line.split('|');
    if (!hash || !isoDate || !subject) continue;

    // Detect PR numbers from common patterns
    // 1) Merge pull request #123 from ...
    const mergeMatch = subject.match(/^Merge pull request #(\d+)/);
    // 2) Squash merge commit: Some title (#123)
    const squashMatch = subject.match(/\(#(\d+)\)/);

    const prNumberStr = mergeMatch?.[1] ?? squashMatch?.[1] ?? null;
    if (!prNumberStr) continue;

    const prNumber = Number.parseInt(prNumberStr, 10);
    if (Number.isNaN(prNumber)) continue;

    const key = `${prNumber}-${isoDate}`;
    if (seen.has(key)) continue;
    seen.add(key);

    prs.push({
      prNumber,
      mergedAt: isoDate,
      subject,
      commit: hash,
    });
  }

  // Sort newest first
  prs.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
  return prs;
}

function main() {
  const daysArg = process.argv.find((arg) => arg.startsWith('--days='));
  const branchArg = process.argv.find((arg) => arg.startsWith('--branch='));
  const days = daysArg
    ? Number.parseInt(daysArg.split('=')[1], 10)
    : DAYS_DEFAULT;
  const preferredBranch = branchArg
    ? branchArg.split('=')[1]
    : process.env.GIT_TARGET_BRANCH;
  const sinceIso = getSinceIsoDate(Number.isFinite(days) ? days : DAYS_DEFAULT);

  const ref = resolveTargetRef(preferredBranch);
  const { output, usedRef } = runGitLog(sinceIso, ref);
  const prs = parsePrsFromGitLog(output);

  console.error(`Analyzing PRs merged into ${usedRef} since ${sinceIso}`);
  console.error(
    `Found ${prs.length} PR(s) in the last ${Number.isFinite(days) ? days : DAYS_DEFAULT} day(s).\n`,
  );

  for (const pr of prs) {
    const date = new Date(pr.mergedAt).toISOString().split('T')[0];
    console.error(`#${pr.prNumber}\t${date}\t${pr.subject}`);
  }
}

main();
