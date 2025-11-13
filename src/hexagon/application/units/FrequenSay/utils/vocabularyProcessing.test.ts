import type { WordCount } from '@application/types/frequensay';
import {
  countVocabularyWords,
  filterWordsByUnknown,
} from '@application/units/FrequenSay/utils/vocabularyProcessing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('vocabularyProcessing', () => {
  beforeEach(() => {
    // Clear any previous mocks
    vi.clearAllMocks();
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
    });

    it('should convert all words to lowercase', () => {
      const text = 'Hola Mundo COMO';
      const [wordCounts] = countVocabularyWords(text);

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
      const [unknownWords, comprehension] = filterWordsByUnknown(
        wordCounts,
        knownWords,
      );

      expect(unknownWords).toHaveLength(2);
      expect(unknownWords.map((w) => w.word)).toEqual(['mundo', 'estas']);
      // expect(totalWords).toBe(5);
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
      const [unknownWords2, comprehension2] = filterWordsByUnknown(
        wordCounts,
        knownWords,
        customVocabulary,
        true,
      );

      expect(unknownWords2).toHaveLength(1);
      expect(unknownWords2[0].word).toBe('amigo');
      expect(comprehension2).toBe(50); // 2/4 known words = 50% comprehension
    });

    it('should handle empty word counts', () => {
      const [unknownWords, comprehension] = filterWordsByUnknown(
        [],
        ['hola', 'mundo'],
      );

      expect(unknownWords).toHaveLength(0);
      expect(comprehension).toBe(100);
    });
  });
});
