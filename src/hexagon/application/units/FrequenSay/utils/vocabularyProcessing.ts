import type { WordCount } from '../../../types/frequensay';

/**
 * Counts vocabulary words in a string and returns word counts and total word count
 */
export function countVocabularyWords(text: string): [WordCount[], number] {
  const segmenter = new Intl.Segmenter([], { granularity: 'word' });
  const segmentedText = segmenter.segment(text);

  const sanitizedArray = [...segmentedText]
    .filter((s) => s.isWordLike)
    .map((s) => s.segment.toLowerCase());

  let u = 0;
  const localWordCount: WordCount[] = [];

  while (u < sanitizedArray.length) {
    const thisWord = sanitizedArray[u];
    const wordFound = localWordCount.find((word) => word.word === thisWord);
    if (wordFound) {
      wordFound.count++;
    } else if (Number.isNaN(Number.parseFloat(thisWord))) {
      localWordCount.push({ word: thisWord, count: 1 });
    }
    u++;
  }

  localWordCount.sort((a, b) => b.count - a.count);
  return [localWordCount, sanitizedArray.length];
}

/**
 * Filters word counts to only include unknown words based on known spellings and custom vocabulary
 */
export function filterWordsByUnknown(
  wordCount: WordCount[],
  knownSpellings: string[] = [],
  customVocabulary: WordCount[] = [],
  useCustomVocabulary: boolean = false,
): [WordCount[], number, number] {
  function isUnknown(word: WordCount): boolean {
    if (knownSpellings.includes(word.word)) {
      return false;
    } else if (
      useCustomVocabulary &&
      customVocabulary.some((w) => w.word === word.word)
    ) {
      return false;
    }
    return true;
  }

  const unknownWords = wordCount.filter(isUnknown);

  // Calculate total words unknown
  let totalWordsUnknown = 0;
  unknownWords.forEach((count) => {
    totalWordsUnknown += count.count;
  });

  // Calculate total words in the passage
  let totalWords = 0;
  wordCount.forEach((count) => {
    totalWords += count.count;
  });

  // Calculate comprehension percentage
  const comprehensionPercentage =
    totalWords > 0
      ? 100 - Math.floor((totalWordsUnknown / totalWords) * 100)
      : 100;

  return [unknownWords, totalWords, comprehensionPercentage];
}
