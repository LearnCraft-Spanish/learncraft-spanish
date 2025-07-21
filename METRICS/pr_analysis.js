import fs from 'node:fs';

// Read the PR data
const prData = JSON.parse(fs.readFileSync('temp.json', 'utf8'));

// Convert dates to Date objects and filter by date range
const startDate = new Date('2024-09-07T00:00:00Z'); // Monday September 7, 2024
const endDate = new Date('2025-07-07T23:59:59Z'); // Monday July 7, 2025

const filteredPRs = prData
  .map((pr) => new Date(pr.closedAt))
  .filter((date) => date >= startDate && date <= endDate)
  .sort((a, b) => a - b);

console.error(`Total PRs in date range: ${filteredPRs.length}`);
console.error(
  `Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`,
);

// Generate weekly dates (Mondays) from start to end
const weeklyDates = [];
// const currentDate = new Date(startDate);

// TODO: fix this
// while (currentDate <= endDate) {
//   weeklyDates.push(new Date(currentDate));
//   currentDate.setDate(currentDate.getDate() + 7);
// }

// Calculate 30-day rolling average for each week
const weeklyStats = weeklyDates.map((weekDate) => {
  const thirtyDaysAgo = new Date(weekDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Count PRs closed in the past 30 days from this week's Monday
  const prsInLast30Days = filteredPRs.filter(
    (prDate) => prDate >= thirtyDaysAgo && prDate <= weekDate,
  ).length;

  return {
    weekStart: weekDate.toISOString().split('T')[0],
    prsInLast30Days,
    thirtyDayStart: thirtyDaysAgo.toISOString().split('T')[0],
  };
});

// Calculate overall average
const totalPRs = weeklyStats.reduce(
  (sum, week) => sum + week.prsInLast30Days,
  0,
);
const averagePRs = totalPRs / weeklyStats.length;

// Display results
console.error('Weekly 30-Day Rolling PR Closure Analysis:');
console.error('==========================================');
console.error(
  'Week Start (Monday) | PRs in Last 30 Days | 30-Day Period Start',
);
console.error('-------------------|---------------------|-------------------');

weeklyStats.forEach((week) => {
  console.error(
    `${week.weekStart} | ${week.prsInLast30Days.toString().padStart(19)} | ${week.thirtyDayStart}`,
  );
});

console.error('\n==========================================');
console.error(`Total weeks analyzed: ${weeklyStats.length}`);
console.error(`Total PRs across all weeks: ${totalPRs}`);
console.error(
  `Average PRs per week (30-day rolling): ${averagePRs.toFixed(2)}`,
);

// Additional statistics
const nonZeroWeeks = weeklyStats.filter((week) => week.prsInLast30Days > 0);
const maxPRs = Math.max(...weeklyStats.map((week) => week.prsInLast30Days));
const minPRs = Math.min(...weeklyStats.map((week) => week.prsInLast30Days));

console.error(`\nAdditional Statistics:`);
console.error(`Weeks with PRs: ${nonZeroWeeks.length}/${weeklyStats.length}`);
console.error(`Maximum PRs in a 30-day period: ${maxPRs}`);
console.error(`Minimum PRs in a 30-day period: ${minPRs}`);

// Save results to file
const results = {
  summary: {
    totalWeeks: weeklyStats.length,
    totalPRs,
    averagePRs: Number.parseFloat(averagePRs.toFixed(2)),
    maxPRs,
    minPRs,
    weeksWithPRs: nonZeroWeeks.length,
  },
  weeklyData: weeklyStats,
};

fs.writeFileSync('pr_analysis_results.json', JSON.stringify(results, null, 2));
console.error('\nDetailed results saved to pr_analysis_results.json');
