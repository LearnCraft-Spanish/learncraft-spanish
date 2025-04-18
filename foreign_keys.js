// // fk-scanner.js
// import fs from 'node:fs';
// import path from 'node:path';

// const TARGET_DIR = './src'; // change to your frontend source folder
// const REGEX =
//   /\.(find|map|filter)\s*\(\s*(?:\(\s*)?\w+\s*(?:\)\s*)?=>[^)]*\.(related[A-Z]\w*|currentLesson)[^)]*\)/g;

// const results = [];

// function scanFile(filePath) {
//   const content = fs.readFileSync(filePath, 'utf-8');
//   const matches = [...content.matchAll(REGEX)];

//   matches.forEach((match) => {
//     const lineNumber = content.slice(0, match.index).split('\n').length;
//     results.push({ file: filePath, line: lineNumber, match: match[0] });
//   });
// }

// function walkDir(dir) {
//   fs.readdirSync(dir).forEach((file) => {
//     const fullPath = path.join(dir, file);
//     if (fs.statSync(fullPath).isDirectory()) {
//       walkDir(fullPath);
//     } else if (
//       (fullPath.endsWith('.ts') ||
//         fullPath.endsWith('.tsx') ||
//         fullPath.endsWith('.js')) &&
//       !/\.test\.(ts|tsx|js)$/.test(fullPath) // <-- ignores test files
//     ) {
//       scanFile(fullPath);
//     }
//   });
// }

// walkDir(TARGET_DIR);

// console.log(`\n🔍 Found ${results.length} potential foreign key lookups:\n`);
// results.forEach(({ file, line, match }) => {
//   console.log(`- ${file}:${line}\n  → ${match.trim()}`);
// });
// fk-scanner.js
import fs from 'node:fs';
import path from 'node:path';

const TARGET_DIR = './src'; // adjust this to your frontend root
const REGEX =
  /\.(related[A-Z]\w*|currentlLesson|vocabIncluded|vocabKnown|lessons)\b/g;
const results = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, i) => {
    const matches = [...line.matchAll(REGEX)];
    matches.forEach((match) => {
      results.push({
        file: filePath,
        line: i + 1,
        match: match[0],
        code: line.trim(),
      });
    });
  });
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
      !/\.test\.(ts|tsx|js)$/.test(fullPath)
    ) {
      scanFile(fullPath);
    }
  });
}

walkDir(TARGET_DIR);

console.log(
  `\n🔍 Found ${results.length} matches for foreign key-like traits in ${TARGET_DIR}:\n`,
);
results.forEach(({ file, line, match, code }) => {
  console.log(`- ${file}:${line}\n  → ${match.trim()}\n  → ${code.trim()}`);
});
