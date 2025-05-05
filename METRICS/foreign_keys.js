// fk-scanner.js
import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = './src';

// Define regex patterns to find foreign key patterns
const PROPERTY_REGEX =
  /\.(related[A-Z]\w*|currentLesson|vocabIncluded|vocabKnown|lessons)\b/g;

// Specific helper functions from useCoaching.ts that perform foreign key operations
const SPECIFIC_HELPER_FUNCTIONS = [
  'getCoachFromMembershipId',
  'getCourseFromMembershipId',
  'getStudentFromMembershipId',
  'getAttendeeWeeksFromGroupSessionId',
  'getGroupSessionsFromWeekRecordId',
  'getAssignmentsFromWeekRecordId',
  'getMembershipFromWeekRecordId',
  'getPrivateCallsFromWeekRecordId',
  'getAttendeesFromGroupSessionId',
  'getGroupSessionsAndAttendeesForWeek',
];

// Create regex pattern for the specific helper functions
const SPECIFIC_HELPERS_REGEX = new RegExp(
  `\\b(${SPECIFIC_HELPER_FUNCTIONS.join('|')})\\b`,
  'g',
);

// Group results by pattern to help identify common patterns
const resultsByPattern = {};
const results = [];

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Process for property access patterns
    const propertyMatches = [...content.matchAll(PROPERTY_REGEX)];

    propertyMatches.forEach((match) => {
      const lineNumber = content.slice(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1];
      const result = {
        file: filePath,
        line: lineNumber,
        match: match[0],
        type: 'property',
        code: line.trim(),
      };

      results.push(result);

      // Group by match pattern
      if (!resultsByPattern[match[0]]) {
        resultsByPattern[match[0]] = [];
      }
      resultsByPattern[match[0]].push(result);
    });

    // Process for specific helper functions from useCoaching
    const specificHelperMatches = [...content.matchAll(SPECIFIC_HELPERS_REGEX)];

    specificHelperMatches.forEach((match) => {
      const lineNumber = content.slice(0, match.index).split('\n').length;
      const line = content.split('\n')[lineNumber - 1];
      const result = {
        file: filePath,
        line: lineNumber,
        match: match[0],
        type: 'specific_helper',
        code: line.trim(),
      };

      results.push(result);

      // Group by match pattern
      if (!resultsByPattern[match[0]]) {
        resultsByPattern[match[0]] = [];
      }
      resultsByPattern[match[0]].push(result);
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
console.error(
  `\n🔍 Found ${results.length} matches for foreign key-like traits in ${TARGET_DIR}:\n`,
);
results.forEach(({ file, line, match, type, code }) => {
  console.error(
    `- ${file}:${line}\n  → ${match.trim()} (${type})\n  → ${code.trim()}`,
  );
});

// Print summary by pattern type
console.error(`\n📊 Summary by pattern type:\n`);
Object.entries(resultsByPattern).forEach(([pattern, matches]) => {
  console.error(`- ${pattern}: ${matches.length} occurrences`);
});

// Summary by category
const propertyPatterns = results.filter((r) => r.type === 'property').length;
const specificHelperPatterns = results.filter(
  (r) => r.type === 'specific_helper',
).length;
console.error(`\n📊 Summary by category:\n`);
console.error(`- Property access patterns: ${propertyPatterns} occurrences`);
console.error(
  `- Specific helper function patterns: ${specificHelperPatterns} occurrences`,
);

console.error(
  `\n🔍 Found ${results.length} total matches for foreign key-like traits in ${TARGET_DIR}.\n`,
);

// Optionally export to JSON for further analysis
// fs.writeFileSync('foreign-keys-report.json', JSON.stringify({ results, resultsByPattern }, null, 2));
