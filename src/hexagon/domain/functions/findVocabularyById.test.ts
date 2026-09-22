import type { Vocabulary } from '@learncraft-spanish/shared';
import { findVocabularyById } from '@domain/functions/findVocabularyById';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { describe, expect, it } from 'vitest';

describe('findVocabularyById', () => {
  const catalog: Vocabulary[] = [
    createMockVocabulary({ id: 1, word: 'por' }),
    createMockVocabulary({ id: 2, word: 'porque' }),
  ];

  it('returns the matching record', () => {
    expect(findVocabularyById(catalog, 2)?.word).toBe('porque');
  });

  it('returns null when no id matches', () => {
    expect(findVocabularyById(catalog, 999)).toBeNull();
  });

  it('returns null when id is null', () => {
    expect(findVocabularyById(catalog, null)).toBeNull();
  });

  it('returns null when the catalog has not loaded yet', () => {
    expect(findVocabularyById(undefined, 1)).toBeNull();
  });
});
