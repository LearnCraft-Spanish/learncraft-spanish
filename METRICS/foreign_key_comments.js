// foreign_key_comments.js
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

/**
 * Scans the codebase for "Foreign Key lookup" comments
 * @param {string} targetDir - The directory to scan
 * @returns {object} Results containing comment statistics
 */
export async function scanForForeignKeyComments(targetDir = './src') {
  // Define regex to find "// Foreign Key lookup" comments (case insensitive)
  const FK_COMMENT_REGEX = /\/\/\s*foreign\s+key\s+lookup.*$/gim;

  // Stats counters
  let totalFKComments = 0;
  let fkCommentsWithQuestionMark = 0;
  const commentsByFile = {};

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      // Process each line individually for better context reporting
      lines.forEach((line, lineIndex) => {
        const matches = [...line.matchAll(FK_COMMENT_REGEX)];

        if (matches.length > 0) {
          // File tracking
          if (!commentsByFile[filePath]) {
            commentsByFile[filePath] = [];
          }

          matches.forEach((match) => {
            const comment = match[0].trim();
            totalFKComments++;

            // Check if comment ends with a question mark
            const endsWithQuestionMark = comment.endsWith('?');
            if (endsWithQuestionMark) {
              fkCommentsWithQuestionMark++;
            }

            // Store the comment for reporting
            commentsByFile[filePath].push({
              lineNumber: lineIndex + 1,
              comment,
              endsWithQuestionMark,
            });
          });
        }
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
    totalFKComments,
    fkCommentsWithQuestionMark,
    commentsByFile,
  };
}

/**
 * Main function to run the scanner and output results
 */
async function main() {
  const targetDir = './src';
  const results = await scanForForeignKeyComments(targetDir);

  // Print detailed results
  console.error(`\n🔍 Foreign Key Comment Analysis in ${targetDir}:\n`);

  // Print comments by file
  Object.entries(results.commentsByFile).forEach(([file, comments]) => {
    console.error(`\nFile: ${file} (${comments.length} comments)`);
    comments.forEach(({ lineNumber, comment, endsWithQuestionMark }) => {
      console.error(
        `  Line ${lineNumber}: ${comment}${endsWithQuestionMark ? ' 🔍' : ''}`,
      );
    });
  });

  // Print summary
  console.error(`\n📊 Summary:\n`);
  console.error(
    `- Total "Foreign Key lookup" comments: ${results.totalFKComments}`,
  );
  console.error(
    `- Comments ending with a question mark: ${results.fkCommentsWithQuestionMark}`,
  );
  console.error(
    `- Comments found in ${Object.keys(results.commentsByFile).length} files`,
  );
}

// Run if this is the main module
const currentFilePath = fileURLToPath(import.meta.url);
const isMainModule = process.argv[1] === currentFilePath;

if (isMainModule) {
  main().catch((err) => {
    console.error('Error:', err);
  });
}
