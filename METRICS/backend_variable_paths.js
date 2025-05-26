// backend_variable_paths.js
// Tracks backend calls with variable paths instead of hardcoded string literals
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Scans the codebase for backend API path usage patterns
 * @param {string} targetDir - The directory to scan
 * @returns {object} Results containing backend path usage statistics
 */
export async function scanForBackendPathUsage(targetDir = './src') {
  // Factory function patterns to look for
  const FACTORY_FUNCTIONS = [
    'getFactory',
    'postFactory',
    'deleteFactory',
    'newDeleteFactory',
    'newPostFactory',
    'newPutFactory',
  ];

  // Define regex patterns to find factory function calls with variable paths
  // Regular parameter version: getFactory<Type>(path, headers)
  const DIRECT_FACTORY_REGEX = new RegExp(
    `(${FACTORY_FUNCTIONS.join('|')})(?:\\s*<[^>]*>)?\\(\\s*(['"\`].+?['"\`])`,
    'g',
  );

  // Options object version: newPostFactory<Type>({ path: '...' })
  const OBJECT_FACTORY_REGEX = new RegExp(
    `(${FACTORY_FUNCTIONS.join('|')})(?:\\s*<[^>]*>)?\\(\\s*\\{[^}]*path\\s*:\\s*(['"\`].+?['"\`])`,
    'g',
  );

  // Variable path regex (excludes string literals) with TypeScript generics
  const VARIABLE_PATH_REGEX = new RegExp(
    `(${FACTORY_FUNCTIONS.join('|')})(?:\\s*<[^>]*>)?\\(\\s*(?!['"\`])([^,)\\s]+)`,
    'g',
  );

  // Variable path in object: { path: variable } with TypeScript generics
  const VARIABLE_PATH_OBJECT_REGEX = new RegExp(
    `(${FACTORY_FUNCTIONS.join('|')})(?:\\s*<[^>]*>)?\\(\\s*\\{[^}]*path\\s*:\\s*(?!['"\`])([^,}\\s]+)`,
    'g',
  );

  // Stats counters
  let totalFactoryCalls = 0;
  let literalPathCalls = 0;
  let variablePathCalls = 0;

  // Store results by file
  const literalPathsByFile = {};
  const variablePathsByFile = {};

  // Track by factory function type
  const factoryStats = {};
  FACTORY_FUNCTIONS.forEach((factory) => {
    factoryStats[factory] = {
      total: 0,
      literals: 0,
      variables: 0,
    };
  });

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');

      // Find string literal paths in direct parameter calls
      const directLiteralMatches = [...content.matchAll(DIRECT_FACTORY_REGEX)];
      directLiteralMatches.forEach((match) => {
        const [, factory, pathLiteral] = match;
        const lineNumber = content.slice(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNumber - 1].trim();

        literalPathCalls++;
        totalFactoryCalls++;
        factoryStats[factory].total++;
        factoryStats[factory].literals++;

        // Initialize file entry if not exists
        if (!literalPathsByFile[filePath]) {
          literalPathsByFile[filePath] = [];
        }

        // Store the literal path for reporting
        literalPathsByFile[filePath].push({
          factory,
          path: pathLiteral,
          lineNumber,
          code: line,
          type: 'literal',
        });
      });

      // Find string literal paths in object parameter calls
      const objectLiteralMatches = [...content.matchAll(OBJECT_FACTORY_REGEX)];
      objectLiteralMatches.forEach((match) => {
        const [, factory, pathLiteral] = match;
        const lineNumber = content.slice(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNumber - 1].trim();

        literalPathCalls++;
        totalFactoryCalls++;
        factoryStats[factory].total++;
        factoryStats[factory].literals++;

        // Initialize file entry if not exists
        if (!literalPathsByFile[filePath]) {
          literalPathsByFile[filePath] = [];
        }

        // Store the literal path for reporting
        literalPathsByFile[filePath].push({
          factory,
          path: pathLiteral,
          lineNumber,
          code: line,
          type: 'literal',
        });
      });

      // Find variable paths in direct parameter calls
      const directVariableMatches = [...content.matchAll(VARIABLE_PATH_REGEX)];
      directVariableMatches.forEach((match) => {
        const [, factory, pathVariable] = match;
        const lineNumber = content.slice(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNumber - 1].trim();

        // Skip if this is a false positive (like headers parameter)
        if (line.includes(`${factory}({`) || pathVariable.includes('{')) {
          return;
        }

        variablePathCalls++;
        totalFactoryCalls++;
        factoryStats[factory].total++;
        factoryStats[factory].variables++;

        // Initialize file entry if not exists
        if (!variablePathsByFile[filePath]) {
          variablePathsByFile[filePath] = [];
        }

        // Store the variable path for reporting
        variablePathsByFile[filePath].push({
          factory,
          pathVariable,
          lineNumber,
          code: line,
          type: 'variable',
        });
      });

      // Find variable paths in object parameter calls
      const objectVariableMatches = [
        ...content.matchAll(VARIABLE_PATH_OBJECT_REGEX),
      ];
      objectVariableMatches.forEach((match) => {
        const [, factory, pathVariable] = match;
        const lineNumber = content.slice(0, match.index).split('\n').length;
        const line = content.split('\n')[lineNumber - 1].trim();

        variablePathCalls++;
        totalFactoryCalls++;
        factoryStats[factory].total++;
        factoryStats[factory].variables++;

        // Initialize file entry if not exists
        if (!variablePathsByFile[filePath]) {
          variablePathsByFile[filePath] = [];
        }

        // Store the variable path for reporting
        variablePathsByFile[filePath].push({
          factory,
          pathVariable,
          lineNumber,
          code: line,
          type: 'variable',
        });
      });
    } catch (error) {
      console.error(`Error scanning file ${filePath}: ${error.message}`);
    }
  }

  function walkDir(dir) {
    fs.readdirSync(dir).forEach((file) => {
      const fullPath = path.join(dir, file);

      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (
        (fullPath.endsWith('.ts') ||
          fullPath.endsWith('.tsx') ||
          fullPath.endsWith('.js')) &&
        !/\.test\.(?:ts|tsx|js)$/.test(fullPath)
      ) {
        scanFile(fullPath);
      }
    });
  }

  walkDir(targetDir);

  // Return the results object
  return {
    totalFactoryCalls,
    literalPathCalls,
    variablePathCalls,
    literalPathsByFile,
    variablePathsByFile,
    factoryStats,
  };
}

/**
 * Main function to run the scanner and output results
 */
async function main() {
  const targetDir = './src';
  const results = await scanForBackendPathUsage(targetDir);

  // Print detailed results for hardcoded literal paths
  console.error(`\n🔍 Backend API Path Analysis in ${targetDir}:\n`);

  console.error(`\n== HARDCODED STRING PATHS ==\n`);
  if (Object.keys(results.literalPathsByFile).length === 0) {
    console.error('No hardcoded string paths found.');
  } else {
    Object.entries(results.literalPathsByFile).forEach(([file, paths]) => {
      console.error(`\nFile: ${file} (${paths.length} hardcoded paths)`);
      paths.forEach(({ factory, path, lineNumber, code }) => {
        console.error(`  Line ${lineNumber}: ${factory} with path ${path}`);
        console.error(`    → ${code}`);
      });
    });
  }

  // Print detailed results for variable paths
  console.error(`\n== VARIABLE PATHS ==\n`);
  if (Object.keys(results.variablePathsByFile).length === 0) {
    console.error('No variable paths found.');
  } else {
    Object.entries(results.variablePathsByFile).forEach(([file, paths]) => {
      console.error(`\nFile: ${file} (${paths.length} variable paths)`);
      paths.forEach(({ factory, pathVariable, lineNumber, code }) => {
        console.error(
          `  Line ${lineNumber}: ${factory} with variable ${pathVariable}`,
        );
        console.error(`    → ${code}`);
      });
    });
  }

  // Print summary
  console.error(`\n📊 Summary:\n`);
  console.error(`- Total factory function calls: ${results.totalFactoryCalls}`);
  console.error(`- Calls with hardcoded paths: ${results.literalPathCalls}`);
  console.error(`- Calls with variable paths: ${results.variablePathCalls}`);
  console.error(
    `- Percentage using variables: ${(
      (results.variablePathCalls / results.totalFactoryCalls) *
      100
    ).toFixed(2)}%`,
  );
  console.error(
    `- Files with hardcoded paths: ${Object.keys(results.literalPathsByFile).length}`,
  );
  console.error(
    `- Files with variable paths: ${Object.keys(results.variablePathsByFile).length}`,
  );

  // Print by factory function
  console.error(`\n📊 Breakdown by Factory Function:\n`);
  Object.entries(results.factoryStats).forEach(([factory, stats]) => {
    if (stats.total > 0) {
      console.error(`- ${factory}:`);
      console.error(`  - Total calls: ${stats.total}`);
      console.error(`  - With literals: ${stats.literals}`);
      console.error(`  - With variables: ${stats.variables}`);
      console.error(
        `  - Percentage with variables: ${(
          (stats.variables / stats.total) *
          100
        ).toFixed(2)}%`,
      );
    }
  });
}

// Run if this is the main module
const currentFilePath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === currentFilePath;

if (isMainModule) {
  main().catch((err) => {
    console.error('Error:', err);
  });
}
