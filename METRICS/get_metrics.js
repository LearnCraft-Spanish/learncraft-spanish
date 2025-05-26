// get_metrics.js
// Master metrics function that runs all individual metrics functions
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { scanForBackendPathUsage } from './backend_variable_paths.js';
import { scanForForeignKeyComments } from './foreign_key_comments.js';

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
