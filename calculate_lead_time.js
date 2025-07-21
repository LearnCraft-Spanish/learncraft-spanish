#!/usr/bin/env node

import { execSync } from 'node:child_process';

function calculateLeadTime() {
  try {
    // Get the most recent merge commit (PR #135)
    const mergeCommit = 'f08f96e';
    const firstCommit = 'c81efe7';

    // Get timestamps
    const firstCommitTime = execSync(
      `git show -s --format="%ad" --date=iso ${firstCommit}`,
      { encoding: 'utf8' },
    ).trim();
    const mergeCommitTime = execSync(
      `git show -s --format="%ad" --date=iso ${mergeCommit}`,
      { encoding: 'utf8' },
    ).trim();

    console.error('=== Lead Time for Changes Analysis ===');
    console.error(`PR: #135 (D-HotFix-1)`);
    console.error(`First Commit: ${firstCommit} at ${firstCommitTime}`);
    console.error(`Merge Commit: ${mergeCommit} at ${mergeCommitTime}`);

    console.error('firstCommitTime', firstCommitTime);

    // Calculate time difference
    const firstDate = new Date(firstCommitTime);
    const mergeDate = new Date(mergeCommitTime);
    const timeDiff = mergeDate - firstDate;

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    console.error(`\nLead Time: ${hours} hours and ${minutes} minutes`);
    console.error(`Total minutes: ${Math.floor(timeDiff / (1000 * 60))}`);

    return {
      pr: '#135',
      tag: 'D-HotFix-1',
      firstCommit,
      firstCommitTime,
      mergeCommit,
      mergeCommitTime,
      leadTimeMinutes: Math.floor(timeDiff / (1000 * 60)),
      leadTimeHours: hours,
      leadTimeMinutesRemainder: minutes,
    };
  } catch (error) {
    console.error('Error calculating lead time:', error.message);
    return null;
  }
}

// Run the calculation
const result = calculateLeadTime();

if (result) {
  console.error('\n=== Summary ===');
  console.error(
    `PR ${result.pr} (${result.tag}) took ${result.leadTimeHours}h ${result.leadTimeMinutesRemainder}m from first commit to merge`,
  );
}

export { calculateLeadTime };
