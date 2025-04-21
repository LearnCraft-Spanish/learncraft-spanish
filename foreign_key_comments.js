// foreign_key_comments.js
import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = './src';

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

walkDir(TARGET_DIR);

// Print detailed results
console.error(`\n🔍 Foreign Key Comment Analysis in ${TARGET_DIR}:\n`);

// Print comments by file
Object.entries(commentsByFile).forEach(([file, comments]) => {
  console.error(`\nFile: ${file} (${comments.length} comments)`);
  comments.forEach(({ lineNumber, comment, endsWithQuestionMark }) => {
    console.error(
      `  Line ${lineNumber}: ${comment}${endsWithQuestionMark ? ' 🔍' : ''}`,
    );
  });
});

// Print summary
console.error(`\n📊 Summary:\n`);
console.error(`- Total "Foreign Key lookup" comments: ${totalFKComments}`);
console.error(
  `- Comments ending with a question mark: ${fkCommentsWithQuestionMark}`,
);
console.error(
  `- Comments found in ${Object.keys(commentsByFile).length} files`,
);

// Optional: Write results to JSON for further analysis
// fs.writeFileSync('fk-comments-report.json', JSON.stringify({
//   totalFKComments,
//   fkCommentsWithQuestionMark,
//   commentsByFile
// }, null, 2));
