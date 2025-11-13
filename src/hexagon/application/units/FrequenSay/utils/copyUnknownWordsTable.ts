import type { WordCount } from '@application/types/frequensay';

export function copyUnknownWordsTable(unknownWordCount: WordCount[]) {
  const headers = 'Word\tCount\n';
  const table = unknownWordCount
    .map((word) => `${word.word}\t${word.count}`)
    .join('\n');

  const copiedText = headers + table;
  navigator.clipboard.writeText(copiedText);
}
