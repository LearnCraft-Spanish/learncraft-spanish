import type { WordCount } from '../../../types/frequensay';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  countVocabularyWords,
  filterWordsByUnknown,
} from './vocabularyProcessing';

// Create a proper iterable segments object that works with spread operator
class MockSegments {
  private segments: Array<{ segment: string; isWordLike: boolean }>;

  constructor(text: string) {
    // Split the text into words and create segment objects
    this.segments = text
      .split(/\s+/)
      .filter((word: string) => word.length > 0)
      .map((word) => ({ segment: word, isWordLike: true }));
  }

  // This makes the object iterable with for...of and spread
  [Symbol.iterator]() {
    let index = 0;
    const segments = this.segments;

    return {
      next() {
        if (index < segments.length) {
          return { value: segments[index++], done: false };
        }
        return { value: undefined, done: true };
      },
    };
  }
}

describe('vocabularyProcessing', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();

    // Set up a proper Segmenter mock
    vi.spyOn(globalThis.Intl, 'Segmenter').mockImplementation(() => {
      return {
        segment: (text: string) => new MockSegments(text),
      } as unknown as Intl.Segmenter;
    });
  });

  describe('countVocabularyWords', () => {
    it('should count words correctly in a simple text', () => {
      const text = 'hola mundo hola como estas';
      const [wordCounts, totalWords] = countVocabularyWords(text);

      expect(totalWords).toBe(5);
      expect(wordCounts).toHaveLength(4);

      // Check 'hola' appears twice
      const holaWord = wordCounts.find((w) => w.word === 'hola');
      expect(holaWord).toBeDefined();
      expect(holaWord?.count).toBe(2);

      // Other words appear once
      expect(wordCounts.find((w) => w.word === 'mundo')?.count).toBe(1);
      expect(wordCounts.find((w) => w.word === 'como')?.count).toBe(1);
      expect(wordCounts.find((w) => w.word === 'estas')?.count).toBe(1);
    });

    it('should convert all words to lowercase', () => {
      const text = 'Hola Mundo COMO';
      const [wordCounts] = countVocabularyWords(text);

      expect(wordCounts).toHaveLength(3);
      expect(wordCounts.map((w) => w.word)).toEqual(['hola', 'mundo', 'como']);
    });

    it('should sort words by frequency (most frequent first)', () => {
      const text = 'hola mundo hola como hola mundo';
      const [wordCounts] = countVocabularyWords(text);

      expect(wordCounts[0].word).toBe('hola');
      expect(wordCounts[0].count).toBe(3);
      expect(wordCounts[1].word).toBe('mundo');
      expect(wordCounts[1].count).toBe(2);
      expect(wordCounts[2].word).toBe('como');
      expect(wordCounts[2].count).toBe(1);
    });

    it('should skip numbers', () => {
      const text = 'hola 123 mundo';
      const [wordCounts] = countVocabularyWords(text);

      expect(wordCounts).toHaveLength(2);
      expect(wordCounts.map((w) => w.word)).toEqual(['hola', 'mundo']);
    });

    it('should handle empty text', () => {
      const text = '';
      const [wordCounts, totalWords] = countVocabularyWords(text);

      expect(wordCounts).toHaveLength(0);
      expect(totalWords).toBe(0);
    });
  });

  describe('filterWordsByUnknown', () => {
    it('should filter known words correctly', () => {
      const wordCounts: WordCount[] = [
        { word: 'hola', count: 2 },
        { word: 'mundo', count: 1 },
        { word: 'como', count: 1 },
        { word: 'estas', count: 1 },
      ];

      const knownWords = ['hola', 'como'];
      const [unknownWords, totalWords, comprehension] = filterWordsByUnknown(
        wordCounts,
        knownWords,
      );

      expect(unknownWords).toHaveLength(2);
      expect(unknownWords.map((w) => w.word)).toEqual(['mundo', 'estas']);
      expect(totalWords).toBe(5);
      expect(comprehension).toBe(60); // 3/5 known words = 60% comprehension
    });

    it('should include custom vocabulary when useCustomVocabulary is true', () => {
      const wordCounts: WordCount[] = [
        { word: 'hola', count: 1 },
        { word: 'mundo', count: 1 },
        { word: 'amigo', count: 2 },
      ];

      const knownWords = ['hola'];
      const customVocabulary: WordCount[] = [{ word: 'mundo', count: 1 }];

      // First without custom vocabulary
      const [unknownWords1] = filterWordsByUnknown(
        wordCounts,
        knownWords,
        customVocabulary,
        false,
      );

      expect(unknownWords1).toHaveLength(2);
      expect(unknownWords1.map((w) => w.word)).toEqual(['mundo', 'amigo']);

      // Then with custom vocabulary
      const [unknownWords2, , comprehension2] = filterWordsByUnknown(
        wordCounts,
        knownWords,
        customVocabulary,
        true,
      );

      expect(unknownWords2).toHaveLength(1);
      expect(unknownWords2[0].word).toBe('amigo');
      expect(comprehension2).toBe(50); // 2/4 known words = 50% comprehension
    });

    it('should handle all words known', () => {
      const wordCounts: WordCount[] = [
        { word: 'hola', count: 2 },
        { word: 'mundo', count: 1 },
      ];

      const knownWords = ['hola', 'mundo'];
      const [unknownWords, totalWords, comprehension] = filterWordsByUnknown(
        wordCounts,
        knownWords,
      );

      expect(unknownWords).toHaveLength(0);
      expect(totalWords).toBe(3);
      expect(comprehension).toBe(100);
    });

    it('should handle all words unknown', () => {
      const wordCounts: WordCount[] = [
        { word: 'hola', count: 2 },
        { word: 'mundo', count: 1 },
      ];

      const knownWords: string[] = [];
      const [unknownWords, totalWords, comprehension] = filterWordsByUnknown(
        wordCounts,
        knownWords,
      );

      expect(unknownWords).toHaveLength(2);
      expect(totalWords).toBe(3);
      expect(comprehension).toBe(0);
    });

    it('should handle empty word counts', () => {
      const [unknownWords, totalWords, comprehension] = filterWordsByUnknown(
        [],
        ['hola', 'mundo'],
      );

      expect(unknownWords).toHaveLength(0);
      expect(totalWords).toBe(0);
      expect(comprehension).toBe(100);
    });
  });
});
