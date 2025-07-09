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

console.log(`Total PRs in date range: ${filteredPRs.length}`);
console.log(
  `Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\n`,
);

// Generate weekly dates (Mondays) from start to end
const weeklyDates = [];
let currentDate = new Date(startDate);

while (currentDate <= endDate) {
  weeklyDates.push(new Date(currentDate));
  currentDate.setDate(currentDate.getDate() + 7);
}

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
console.log('Weekly 30-Day Rolling PR Closure Analysis:');
console.log('==========================================');
console.log('Week Start (Monday) | PRs in Last 30 Days | 30-Day Period Start');
console.log('-------------------|---------------------|-------------------');

weeklyStats.forEach((week) => {
  console.log(
    `${week.weekStart} | ${week.prsInLast30Days.toString().padStart(19)} | ${week.thirtyDayStart}`,
  );
});

console.log('\n==========================================');
console.log(`Total weeks analyzed: ${weeklyStats.length}`);
console.log(`Total PRs across all weeks: ${totalPRs}`);
console.log(`Average PRs per week (30-day rolling): ${averagePRs.toFixed(2)}`);

// Additional statistics
const nonZeroWeeks = weeklyStats.filter((week) => week.prsInLast30Days > 0);
const maxPRs = Math.max(...weeklyStats.map((week) => week.prsInLast30Days));
const minPRs = Math.min(...weeklyStats.map((week) => week.prsInLast30Days));

console.log(`\nAdditional Statistics:`);
console.log(`Weeks with PRs: ${nonZeroWeeks.length}/${weeklyStats.length}`);
console.log(`Maximum PRs in a 30-day period: ${maxPRs}`);
console.log(`Minimum PRs in a 30-day period: ${minPRs}`);

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
console.log('\nDetailed results saved to pr_analysis_results.json');
