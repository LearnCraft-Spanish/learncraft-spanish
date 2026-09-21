import type { Vocabulary } from '@learncraft-spanish/shared';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Index of the first whole-word, case-insensitive appearance of `word` in
 * `text`, or -1. Boundaries are Unicode-aware so "en" does not match inside
 * "encuentro" and "él" still matches "Él".
 */
function firstAppearanceIndex(text: string, word: string): number {
  const pattern = new RegExp(
    `(?<![\\p{L}\\p{N}])${escapeRegExp(word)}(?![\\p{L}\\p{N}])`,
    'iu',
  );
  return pattern.exec(text)?.index ?? -1;
}

/**
 * Orders vocabulary by where each word first appears in the card's Spanish
 * text, so the get-help chips read in sentence order. Words that do not
 * appear keep their original relative order at the end.
 */
export function orderVocabularyByAppearance(
  spanishText: string,
  vocabulary: Vocabulary[],
): Vocabulary[] {
  return vocabulary
    .map((vocab, index) => ({
      vocab,
      index,
      position: firstAppearanceIndex(spanishText, vocab.word),
    }))
    .sort((a, b) => {
      const aPosition =
        a.position === -1 ? Number.POSITIVE_INFINITY : a.position;
      const bPosition =
        b.position === -1 ? Number.POSITIVE_INFINITY : b.position;
      return aPosition - bPosition || a.index - b.index;
    })
    .map(({ vocab }) => vocab);
}
