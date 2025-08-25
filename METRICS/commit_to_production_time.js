// commit_to_production_time.js
// Tracks the average time from commit creation to production deployment (merge to main)
import { execSync } from 'node:child_process';
import process from 'node:process';

const DAYS_DEFAULT = 30;

/**
 * Get the date for N days ago in ISO format
 * @param {number} daysAgo - Number of days to go back
 * @returns {string} - ISO date string
 */
function getSinceIsoDate(daysAgo = DAYS_DEFAULT) {
  const now = new Date();
  const since = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

/**
 * Resolve the target branch reference (main, origin/main, etc.)
 * @param {string} preferred - Preferred branch name
 * @returns {string} - Resolved branch reference
 */
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
  // candidates.push(
  //   'origin/development',
  //   'development',
  //   'origin/master',
  //   'master',
  // );

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

/**
 * Execute git log command to get PRs merged to main
 * @param {string} sinceIso - ISO date string for since parameter
 * @param {string} ref - Git reference (branch)
 * @returns {object} - Git log output and used reference
 */
function runGitLog(sinceIso, ref) {
  // Use %x7C to render literal '|' to avoid shell piping
  const pretty = '%H%x7C%cI%x7C%s';
  const cmd = `git log --no-color --first-parent ${ref} --since='${sinceIso}' --pretty=format:${pretty}`;
  const output = execSync(cmd, { encoding: 'utf8' });
  return { output, usedRef: ref };
}

/**
 * Parse PRs from git log output
 * @param {string} logOutput - Git log output
 * @returns {Array} - Array of PR objects
 */
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
      mergeCommit: hash,
    });
  }

  // Sort newest first
  prs.sort((a, b) => new Date(b.mergedAt) - new Date(a.mergedAt));
  return prs;
}

/**
 * Get all commits for a specific PR by analyzing git history
 * @param {number} prNumber - PR number
 * @param {string} mergeCommit - The merge commit hash
 * @returns {Array} - Array of commit objects with creation dates
 */
function getCommitsForPR(prNumber, mergeCommit) {
  try {
    // Get the parent commit of the merge (the commit before the merge)
    const parentCmd = `git rev-parse ${mergeCommit}^1`;
    const parentCommit = execSync(parentCmd, { encoding: 'utf8' }).trim();

    // Get all commits from the merge commit that are not reachable from the parent
    // This gives us all commits that were brought in by the PR
    const commitsCmd = `git rev-list ${mergeCommit} ^${parentCommit}`;
    const commitHashes = execSync(commitsCmd, { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    const commits = [];
    for (const hash of commitHashes) {
      try {
        // Get commit date (author date, not committer date for original creation time)
        const dateCmd = `git show -s --format="%aI" ${hash}`;
        const commitDate = execSync(dateCmd, { encoding: 'utf8' }).trim();

        // Get commit subject for reference
        const subjectCmd = `git show -s --format="%s" ${hash}`;
        const subject = execSync(subjectCmd, { encoding: 'utf8' }).trim();

        commits.push({
          hash,
          date: commitDate,
          subject,
        });
      } catch (error) {
        console.error(
          `Error getting details for commit ${hash}: ${error.message}`,
        );
      }
    }

    return commits;
  } catch (error) {
    console.error(
      `Error getting commits for PR #${prNumber}: ${error.message}`,
    );
    return [];
  }
}

/**
 * Calculate commit-to-production times for all commits in all PRs
 * @param {Array} prs - Array of PR objects
 * @returns {Array} - Array of commit lead times in hours
 */
function calculateCommitToProductionTimes(prs) {
  const commitLeadTimes = [];
  const prDetails = [];

  for (const pr of prs) {
    const commits = getCommitsForPR(pr.prNumber, pr.mergeCommit);
    const prMergeTime = new Date(pr.mergedAt);

    const prCommitTimes = [];

    for (const commit of commits) {
      const commitTime = new Date(commit.date);
      const leadTimeMs = prMergeTime - commitTime;
      const leadTimeHours = leadTimeMs / (1000 * 60 * 60);

      if (leadTimeHours >= 0) {
        // Only include valid times (commit before merge)
        commitLeadTimes.push(leadTimeHours);
        prCommitTimes.push({
          hash: commit.hash,
          subject: commit.subject,
          commitDate: commit.date,
          leadTimeHours,
        });
      }
    }

    if (prCommitTimes.length > 0) {
      const avgLeadTimeForPR =
        prCommitTimes.reduce((sum, c) => sum + c.leadTimeHours, 0) /
        prCommitTimes.length;

      prDetails.push({
        prNumber: pr.prNumber,
        mergedAt: pr.mergedAt,
        subject: pr.subject,
        commitCount: prCommitTimes.length,
        avgLeadTimeHours: avgLeadTimeForPR,
        commits: prCommitTimes,
      });
    }
  }

  return { commitLeadTimes, prDetails };
}

/**
 * Format duration in a human-readable format
 * @param {number} hours - Duration in hours
 * @returns {string} - Formatted duration string
 */
function formatDuration(hours) {
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}h`;
  }
}

/**
 * Main function to analyze commit-to-production lead time
 * @param {number} days - Number of days to analyze (default 30)
 * @param {string} branch - Target branch (default auto-detected)
 * @returns {object} - Analysis results
 */
export function analyzeCommitToProductionTime(
  days = DAYS_DEFAULT,
  branch = null,
) {
  const sinceIso = getSinceIsoDate(days);
  const ref = resolveTargetRef(branch);
  const { output } = runGitLog(sinceIso, ref);
  const prs = parsePrsFromGitLog(output);

  if (prs.length === 0) {
    return {
      totalPRs: 0,
      totalCommits: 0,
      averageLeadTimeHours: 0,
      medianLeadTimeHours: 0,
      minLeadTimeHours: 0,
      maxLeadTimeHours: 0,
      prDetails: [],
      analysisDate: new Date().toISOString(),
      analysisPeriodDays: days,
      targetBranch: ref,
    };
  }

  const { commitLeadTimes, prDetails } = calculateCommitToProductionTimes(prs);

  if (commitLeadTimes.length === 0) {
    return {
      totalPRs: prs.length,
      totalCommits: 0,
      averageLeadTimeHours: 0,
      medianLeadTimeHours: 0,
      minLeadTimeHours: 0,
      maxLeadTimeHours: 0,
      prDetails: [],
      analysisDate: new Date().toISOString(),
      analysisPeriodDays: days,
      targetBranch: ref,
    };
  }

  // Calculate statistics
  const averageLeadTimeHours =
    commitLeadTimes.reduce((sum, time) => sum + time, 0) /
    commitLeadTimes.length;

  // Calculate median
  const sortedTimes = [...commitLeadTimes].sort((a, b) => a - b);
  const medianLeadTimeHours =
    sortedTimes.length % 2 === 0
      ? (sortedTimes[sortedTimes.length / 2 - 1] +
          sortedTimes[sortedTimes.length / 2]) /
        2
      : sortedTimes[Math.floor(sortedTimes.length / 2)];

  const minLeadTimeHours = Math.min(...commitLeadTimes);
  const maxLeadTimeHours = Math.max(...commitLeadTimes);

  return {
    totalPRs: prDetails.length,
    totalCommits: commitLeadTimes.length,
    averageLeadTimeHours,
    medianLeadTimeHours,
    minLeadTimeHours,
    maxLeadTimeHours,
    prDetails,
    analysisDate: new Date().toISOString(),
    analysisPeriodDays: days,
    targetBranch: ref,
  };
}

/**
 * Get the current date (today)
 * @returns {Date} - Current date object
 */
function getCurrentDate() {
  const now = new Date();
  // Set to end of day
  now.setHours(23, 59, 59, 999);
  return now;
}

/**
 * Get the date for N days before a specific date in ISO format
 * @param {Date} endDate - The end date to count back from
 * @param {number} daysBack - Number of days to go back
 * @returns {string} - ISO date string
 */
function getSinceIsoDateFromEnd(endDate, daysBack = DAYS_DEFAULT) {
  const since = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return since.toISOString();
}

/**
 * Modified git log function that takes an end date
 * @param {string} sinceIso - ISO date string for since parameter
 * @param {string} untilIso - ISO date string for until parameter
 * @param {string} ref - Git reference (branch)
 * @returns {object} - Git log output and used reference
 */
function runGitLogWithDateRange(sinceIso, untilIso, ref) {
  // Use %x7C to render literal '|' to avoid shell piping
  const pretty = '%H%x7C%cI%x7C%s';
  const cmd = `git log --no-color --first-parent ${ref} --since='${sinceIso}' --until='${untilIso}' --pretty=format:${pretty}`;
  const output = execSync(cmd, { encoding: 'utf8' });
  return { output, usedRef: ref };
}

/**
 * Analyze commit-to-production time for a specific date range
 * @param {Date} endDate - The end date for the analysis period
 * @param {number} days - Number of days to analyze before the end date
 * @param {string} branch - Target branch (default auto-detected)
 * @returns {object} - Analysis results
 */
function analyzeCommitToProductionTimeForPeriod(
  endDate,
  days = DAYS_DEFAULT,
  branch = null,
) {
  const sinceIso = getSinceIsoDateFromEnd(endDate, days);
  const untilIso = endDate.toISOString();
  const ref = resolveTargetRef(branch);
  const { output } = runGitLogWithDateRange(sinceIso, untilIso, ref);
  const prs = parsePrsFromGitLog(output);

  if (prs.length === 0) {
    return {
      totalPRs: 0,
      totalCommits: 0,
      averageLeadTimeHours: 0,
      medianLeadTimeHours: 0,
      minLeadTimeHours: 0,
      maxLeadTimeHours: 0,
      prDetails: [],
      analysisDate: endDate.toISOString(),
      analysisPeriodDays: days,
      targetBranch: ref,
      periodStart: sinceIso,
      periodEnd: untilIso,
    };
  }

  const { commitLeadTimes, prDetails } = calculateCommitToProductionTimes(prs);

  if (commitLeadTimes.length === 0) {
    return {
      totalPRs: prs.length,
      totalCommits: 0,
      averageLeadTimeHours: 0,
      medianLeadTimeHours: 0,
      minLeadTimeHours: 0,
      maxLeadTimeHours: 0,
      prDetails: [],
      analysisDate: endDate.toISOString(),
      analysisPeriodDays: days,
      targetBranch: ref,
      periodStart: sinceIso,
      periodEnd: untilIso,
    };
  }

  // Calculate statistics
  const averageLeadTimeHours =
    commitLeadTimes.reduce((sum, time) => sum + time, 0) /
    commitLeadTimes.length;

  // Calculate median
  const sortedTimes = [...commitLeadTimes].sort((a, b) => a - b);
  const medianLeadTimeHours =
    sortedTimes.length % 2 === 0
      ? (sortedTimes[sortedTimes.length / 2 - 1] +
          sortedTimes[sortedTimes.length / 2]) /
        2
      : sortedTimes[Math.floor(sortedTimes.length / 2)];

  const minLeadTimeHours = Math.min(...commitLeadTimes);
  const maxLeadTimeHours = Math.max(...commitLeadTimes);

  return {
    totalPRs: prDetails.length,
    totalCommits: commitLeadTimes.length,
    averageLeadTimeHours,
    medianLeadTimeHours,
    minLeadTimeHours,
    maxLeadTimeHours,
    prDetails,
    analysisDate: endDate.toISOString(),
    analysisPeriodDays: days,
    targetBranch: ref,
    periodStart: sinceIso,
    periodEnd: untilIso,
  };
}

/**
 * Main function to get this week's lead time
 */
function main() {
  console.error('📊 Analyzing commit-to-production lead time...\n');

  // Get today's date
  const today = getCurrentDate();

  // Analyze with 30-day rolling window ending today
  const results = analyzeCommitToProductionTimeForPeriod(
    today,
    DAYS_DEFAULT,
    null,
  );

  const todayDate = today.toISOString().split('T')[0];
  console.error(
    `Analysis date ${todayDate}: ${formatDuration(results.averageLeadTimeHours)}`,
  );
  console.error(
    `(${results.totalCommits} commits from ${results.totalPRs} PRs in ${DAYS_DEFAULT}-day window)`,
  );

  // Output the raw average lead time in hours
  console.error(
    `\nAverage lead time: ${results.averageLeadTimeHours.toFixed(2)} hours`,
  );
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
