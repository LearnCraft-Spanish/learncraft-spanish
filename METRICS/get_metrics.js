// get_metrics.js
// Master metrics function that runs all individual metrics functions
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { scanForBackendPathUsage } from './backend_variable_paths.js';
import { analyzeCommitToProductionTime } from './commit_to_production_time.js';
import { scanForForeignKeyComments } from './foreign_key_comments.js';
import { analyzeLeadTime } from './lead-time/index.js';

async function runAllMetrics() {
  console.error('🔍 Running all metrics...\n');

  // Run Foreign Key Comments metrics
  const fkResults = await scanForForeignKeyComments();
  console.error(
    `Foreign Key Comments: ${fkResults.totalFKComments} comments found (${fkResults.fkCommentsWithQuestionMark} with questions) in ${Object.keys(fkResults.commentsByFile).length} files`,
  );

  // Run Backend Variable Paths metrics
  const pathResults = await scanForBackendPathUsage();
  console.error(
    `Backend Paths: ${pathResults.totalFactoryCalls} factory calls (${pathResults.variablePathCalls} with variables, ${((pathResults.variablePathCalls / pathResults.totalFactoryCalls) * 100).toFixed(2)}%) in ${Object.keys(pathResults.literalPathsByFile).length} files`,
  );

  // Run Lead Time metrics
  const leadTimeResults = await analyzeLeadTime();
  console.error(
    `Lead Time: ${leadTimeResults.totalFeatures} completed (${leadTimeResults.incompleteFeaturesCount} incomplete) features/hotfixes, ${(leadTimeResults.averageLeadTime / 24).toFixed(1)}d average`,
  );

  // Run Commit-to-Production Time metrics
  const commitProdResults = analyzeCommitToProductionTime();
  console.error(
    `Commit-to-Production: ${commitProdResults.totalCommits} commits across ${commitProdResults.totalPRs} PRs, ${(commitProdResults.averageLeadTimeHours / 24).toFixed(1)}d average`,
  );

  console.error('\n✅ All metrics completed.\n');
}

// Run if this is the main module
const currentFilePath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === currentFilePath;

if (isMainModule) {
  runAllMetrics().catch((err) => {
    console.error('Error running metrics:', err);
    process.exit(1);
  });
}

export { runAllMetrics };
