/* eslint-disable no-console */

import fs from 'node:fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const SRC_DIR = path.join(__dirname, 'src');
const EXCLUDED_DIRS = ['assets', 'hexagon'];
const OUTPUT_FILE = 'counting_files_outside_hexagon_RESULTS.txt';

// Data structures to store results
const filesByDirectory = {};
let totalFiles = 0;

/**
 * Check if a directory should be excluded
 */
function isExcludedDirectory(dirPath, basePath) {
  const relativePath = path.relative(basePath, dirPath);
  const pathParts = relativePath.split(path.sep);

  // Check if the first directory component is in the excluded list
  return EXCLUDED_DIRS.includes(pathParts[0]);
}

/**
 * Recursively traverse directory and collect files
 */
function traverseDirectory(dirPath, basePath = SRC_DIR) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (isExcludedDirectory(fullPath, basePath)) {
        continue;
      }
      // Recursively traverse subdirectories
      traverseDirectory(fullPath, basePath);
    } else if (stat.isFile()) {
      // Get relative path from src directory
      const relativePath = path.relative(basePath, dirPath);
      const directoryKey = relativePath || 'src (root)';

      // Initialize array if not exists
      if (!filesByDirectory[directoryKey]) {
        filesByDirectory[directoryKey] = [];
      }

      // Add file to the directory's list
      filesByDirectory[directoryKey].push(item);
      totalFiles++;
    }
  }
}

/**
 * Display summary to console
 */
function displaySummary() {
  console.log('\n========================================');
  console.log('FILES OUTSIDE HEXAGON - SUMMARY');
  console.log('========================================\n');

  console.log(`Total files outside hexagon: ${totalFiles}\n`);

  console.log('Breakdown by directory (2 levels deep):');
  console.log('----------------------------------------');

  // Aggregate files by first 2 directory levels
  const twoLevelCounts = {};

  for (const dir of Object.keys(filesByDirectory)) {
    // Get first 2 levels of directory path
    const pathParts = dir.split(path.sep);
    let twoLevelKey;

    if (dir === 'src (root)') {
      twoLevelKey = 'src (root)';
    } else if (pathParts.length === 1) {
      twoLevelKey = pathParts[0];
    } else {
      twoLevelKey = pathParts.slice(0, 2).join('/');
    }

    // Aggregate file counts
    if (!twoLevelCounts[twoLevelKey]) {
      twoLevelCounts[twoLevelKey] = 0;
    }
    twoLevelCounts[twoLevelKey] += filesByDirectory[dir].length;
  }

  // Sort and display
  const sortedKeys = Object.keys(twoLevelCounts).sort();

  for (const key of sortedKeys) {
    console.log(`${key}: ${twoLevelCounts[key]} files`);
  }

  console.log('\n========================================\n');
}

/**
 * Write detailed file list to output file
 */
function writeDetailedResults() {
  let output = '';

  output += '========================================\n';
  output += 'FILES OUTSIDE HEXAGON - DETAILED LIST\n';
  output += '========================================\n\n';
  output += `Total files: ${totalFiles}\n\n`;

  // Sort directories for better readability
  const sortedDirs = Object.keys(filesByDirectory).sort();

  for (const dir of sortedDirs) {
    output += `\n${dir}/\n`;
    output += `${'-'.repeat(dir.length + 1)}\n`;

    // Sort files within each directory
    const sortedFiles = filesByDirectory[dir].sort();

    for (const file of sortedFiles) {
      output += `  ${file}\n`;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
  console.log(`Detailed results written to: ${OUTPUT_FILE}\n`);
}

/**
 * Main execution
 */
function main() {
  console.log('Scanning files outside hexagon...\n');
  console.log(`Source directory: ${SRC_DIR}`);
  console.log(`Excluded directories: ${EXCLUDED_DIRS.join(', ')}\n`);

  // Check if src directory exists
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`Error: Source directory not found: ${SRC_DIR}`);
    require('node:process').exit(1);
  }

  // Traverse directory tree
  traverseDirectory(SRC_DIR);

  // Display results
  displaySummary();

  // Write detailed results to file
  writeDetailedResults();
}

// Run the script
main();
