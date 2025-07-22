// lead_time_tracker.js
// Tracks lead time for features and hotfixes by analyzing git commits with I- and D- tags
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Executes a git command and returns the result
 * @param {string} command - The git command to execute
 * @returns {string} - The command output
 */
function executeGitCommand(command) {
  try {
    return execSync(command, {
      cwd: join(__dirname, '..'),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    console.error(`Error executing git command: ${command}`);
    console.error(`Error: ${error.message}`);
    return '';
  }
}

/**
 * Extracts feature/hotfix type and number from tag name
 * @param {string} tagName - Git tag name
 * @param {string} prefix - Tag prefix (I- or D-)
 * @returns {object|null} - Object with type and number, or null if not found
 */
function extractFeatureInfo(tagName, prefix) {
  const regex = new RegExp(`${prefix}(Feature|HotFix)-([0-9]+)`, 'i');
  const match = tagName.match(regex);
  return match ? { type: match[1], number: match[2] } : null;
}

/**
 * Gets git tags with their commit information for the past 30 days
 * @returns {Array} - Array of parsed tag objects
 */
function getGitTagsForPast30Days() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sinceDate = thirtyDaysAgo.toISOString().split('T')[0];

  // Get all tags with their commit hashes
  const command = `git for-each-ref --format='%(refname:short)%n%(objectname)' refs/tags --sort=-creatordate`;
  const output = executeGitCommand(command);

  if (!output) return [];

  const entries = output.split('\n');
  const tags = [];

  entries.forEach((entry) => {
    if (entry.trim()) {
      const parts = entry.split('%n');
      if (parts.length === 2) {
        const tagName = parts[0];
        const commitHash = parts[1];

        // Get the commit date for this tag
        const commitDateCommand = `git log -1 --format="%aI" ${commitHash}`;
        const commitDateStr = executeGitCommand(commitDateCommand);

        if (commitDateStr) {
          const commitDate = new Date(commitDateStr);
          const cutoffDate = new Date(sinceDate);

          // Check if the commit was made within the past 30 days
          if (commitDate >= cutoffDate) {
            tags.push({
              name: tagName,
              date: commitDate,
              commitHash,
            });
          }
        }
      }
    }
  });
  return tags;
}

/**
 * Groups tags by feature/hotfix number
 * @param {Array} tags - Array of tag objects
 * @returns {object} - Object with feature numbers as keys and tag objects as values
 */
function groupTagsByFeature(tags) {
  const grouped = {};

  tags.forEach((tag) => {
    // Check for I- tags (start)
    const startInfo = extractFeatureInfo(tag.name, 'I-');
    if (startInfo) {
      const key = `${startInfo.type}-${startInfo.number}`;
      if (!grouped[key]) {
        grouped[key] = {
          start: null,
          end: null,
          type: startInfo.type,
          number: startInfo.number,
        };
      }
      grouped[key].start = tag;
    }

    // Check for D- tags (end/merge)
    const endInfo = extractFeatureInfo(tag.name, 'D-');
    if (endInfo) {
      const key = `${endInfo.type}-${endInfo.number}`;
      if (!grouped[key]) {
        grouped[key] = {
          start: null,
          end: null,
          type: endInfo.type,
          number: endInfo.number,
        };
      }
      grouped[key].end = tag;
    }
  });

  return grouped;
}

/**
 * Calculates lead time in hours between start and end commits
 * @param {object} startCommit - Start commit object
 * @param {object} endCommit - End commit object
 * @returns {number|null} - Lead time in hours or null if invalid
 */
function calculateLeadTime(startCommit, endCommit) {
  if (!startCommit || !endCommit) return null;

  const startTime = startCommit.date.getTime();
  const endTime = endCommit.date.getTime();

  if (endTime < startTime) return null; // End before start

  const diffMs = endTime - startTime;
  const diffHours = diffMs / (1000 * 60 * 60);

  return diffHours;
}

/**
 * Formats duration in a human-readable format
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
 * Main function to analyze lead time metrics
 * @returns {object} - Lead time analysis results
 */
export async function analyzeLeadTime() {
  const tags = getGitTagsForPast30Days();
  const groupedFeatures = groupTagsByFeature(tags);
  const featureNumbers = Object.keys(groupedFeatures);

  const leadTimes = [];
  const incompleteFeatures = [];
  const completedFeatures = [];

  featureNumbers.forEach((key) => {
    const feature = groupedFeatures[key];
    const leadTime = calculateLeadTime(feature.start, feature.end);

    if (leadTime !== null) {
      leadTimes.push(leadTime);
      completedFeatures.push({
        number: feature.number,
        startDate: feature.start.date,
        endDate: feature.end.date,
        leadTime,
        type: feature.type,
      });
    } else {
      incompleteFeatures.push({
        number: feature.number,
        hasStart: !!feature.start,
        hasEnd: !!feature.end,
        type: feature.type,
      });
    }
  });

  // Calculate statistics
  const totalFeatures = completedFeatures.length;
  const averageLeadTime =
    totalFeatures > 0
      ? leadTimes.reduce((a, b) => a + b, 0) / totalFeatures
      : 0;
  const minLeadTime = totalFeatures > 0 ? Math.min(...leadTimes) : 0;
  const maxLeadTime = totalFeatures > 0 ? Math.max(...leadTimes) : 0;

  // Group by type
  const features = completedFeatures.filter((f) => f.type === 'Feature');
  const hotfixes = completedFeatures.filter((f) => f.type === 'HotFix');

  const avgFeatureTime =
    features.length > 0
      ? features.reduce((sum, f) => sum + f.leadTime, 0) / features.length
      : 0;
  const avgHotfixTime =
    hotfixes.length > 0
      ? hotfixes.reduce((sum, f) => sum + f.leadTime, 0) / hotfixes.length
      : 0;

  const results = {
    totalFeatures: completedFeatures.length,
    incompleteFeaturesCount: incompleteFeatures.length,
    averageLeadTime,
    minLeadTime,
    maxLeadTime,
    features: {
      count: features.length,
      averageTime: avgFeatureTime,
    },
    hotfixes: {
      count: hotfixes.length,
      averageTime: avgHotfixTime,
    },
    completedFeatures,
    incompleteFeatures,
  };

  return results;
}

/**
 * Main function to run the lead time analysis and output results
 */
async function main() {
  console.error('📊 Analyzing lead time metrics for the past 30 days...\n');

  const results = await analyzeLeadTime();

  console.error(
    `Found ${results.completedFeatures.length + results.incompleteFeatures.length} features/hotfixes with tags`,
  );

  // Print detailed results
  console.error(`\n📈 Lead Time Analysis Results:`);
  console.error(
    `   Total completed features/hotfixes: ${results.totalFeatures}`,
  );
  console.error(
    `   Incomplete features/hotfixes: ${results.incompleteFeaturesCount}`,
  );
  console.error(
    `   Overall average lead time: ${formatDuration(results.averageLeadTime)}`,
  );
  console.error(`   Min lead time: ${formatDuration(results.minLeadTime)}`);
  console.error(`   Max lead time: ${formatDuration(results.maxLeadTime)}`);

  if (results.features.count > 0) {
    console.error(
      `   Features (${results.features.count}): ${formatDuration(results.features.averageTime)} average`,
    );
  }

  if (results.hotfixes.count > 0) {
    console.error(
      `   Hotfixes (${results.hotfixes.count}): ${formatDuration(results.hotfixes.averageTime)} average`,
    );
  }

  if (results.completedFeatures.length > 0) {
    console.error(`\n📋 Completed Features/Hotfixes:`);
    results.completedFeatures.forEach((feature) => {
      console.error(
        `   ${feature.type}-${feature.number}: ${formatDuration(feature.leadTime)} (${feature.startDate.toLocaleDateString()} → ${feature.endDate.toLocaleDateString()})`,
      );
    });
  }

  if (results.incompleteFeatures.length > 0) {
    console.error(`\n⚠️  Incomplete Features/Hotfixes:`);
    results.incompleteFeatures.forEach((feature) => {
      const status =
        feature.hasStart && feature.hasEnd
          ? 'Invalid dates'
          : feature.hasStart
            ? 'Missing D- tag'
            : 'Missing I- tag';
      console.error(`   ${feature.type}-${feature.number}: ${status}`);
    });
  }
}

// Run if this is the main module
const currentFilePath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === currentFilePath;

if (isMainModule) {
  main().catch((err) => {
    console.error('Error analyzing lead time:', err);
    process.exit(1);
  });
}
