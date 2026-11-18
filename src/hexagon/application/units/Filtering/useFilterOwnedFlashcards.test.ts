import type { Example, Flashcard } from '@learncraft-spanish/shared';
import {
  mockUseCombinedFiltersWithVocabulary,
  overrideMockUseCombinedFiltersWithVocabulary,
  resetMockUseCombinedFiltersWithVocabulary,
} from '@application/units/Filtering/useCombinedFiltersWithVocabulary.mock';
import { useFilterOwnedFlashcards } from '@application/units/Filtering/useFilterOwnedFlashcards';
import {
  mockUseStudentFlashcards,
  overrideMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { SkillType } from '@learncraft-spanish/shared';
import { renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { createMockVocabulary } from '@testing/factories/vocabularyFactories';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/Filtering/useCombinedFiltersWithVocabulary',
  async () => {
    const { mockUseCombinedFiltersWithVocabulary: combinedFilters } =
      await import('@application/units/Filtering/useCombinedFiltersWithVocabulary.mock');
    return { useCombinedFiltersWithVocabulary: () => combinedFilters };
  },
);

/** Empty vocabulary keeps the shared vocabulary filter out of the way. */
const createFlashcard = (id: number, spanglish: boolean): Flashcard => {
  const flashcard = createMockFlashcard({ id });
  return {
    ...flashcard,
    id,
    example: { ...flashcard.example, id, spanglish, vocabulary: [] },
  };
};

/** A flashcard whose example is customised, e.g. with audio or vocabulary. */
const createFlashcardWithExample = (
  id: number,
  exampleOverrides: Partial<Example> & {
    vocabulary?: Flashcard['example']['vocabulary'];
  },
): Flashcard => {
  const flashcard = createMockFlashcard({ id });
  return {
    ...flashcard,
    id,
    example: {
      ...flashcard.example,
      id,
      spanglish: false,
      vocabulary: [],
      ...exampleOverrides,
    },
  };
};

const ownedFlashcards: Flashcard[] = [
  createFlashcard(1, false),
  createFlashcard(2, true),
];

const renderFilter = (filterOwnedFlashcards: boolean) =>
  renderHook(() => useFilterOwnedFlashcards(filterOwnedFlashcards));

describe('useFilterOwnedFlashcards', () => {
  beforeEach(() => {
    resetMockUseCombinedFiltersWithVocabulary();
    overrideMockUseStudentFlashcards({
      flashcards: ownedFlashcards,
      collectedExamples: ownedFlashcards.map((flashcard) => flashcard.example),
    });
  });

  it('returns the very combined-filters instance it subscribed to', () => {
    const { result } = renderFilter(false);

    expect(result.current.combinedFilters).toBe(
      mockUseCombinedFiltersWithVocabulary,
    );
  });

  it('returns the very student-flashcards instance it subscribed to', () => {
    const { result } = renderFilter(false);

    expect(result.current.flashcardsQuery).toBe(mockUseStudentFlashcards);
  });

  it('returns every owned flashcard when filtering is off', () => {
    const { result } = renderFilter(false);

    expect(result.current.filteredFlashcards).toEqual(ownedFlashcards);
  });

  it('applies the active filters to the owned flashcards when filtering is on', () => {
    overrideMockUseCombinedFiltersWithVocabulary({ excludeSpanglish: true });

    const { result } = renderFilter(true);

    expect(
      result.current.filteredFlashcards.map(
        (flashcard) => flashcard.example.id,
      ),
    ).toEqual([1]);
  });

  it('reports an empty list when the owned flashcards have not loaded', () => {
    overrideMockUseStudentFlashcards({
      flashcards: undefined,
      collectedExamples: undefined,
    });

    const { result } = renderFilter(false);

    expect(result.current.filteredFlashcards).toEqual([]);
  });

  it('reports an empty list when filtering is on and nothing has loaded', () => {
    overrideMockUseStudentFlashcards({
      flashcards: undefined,
      collectedExamples: undefined,
    });

    const { result } = renderFilter(true);

    expect(result.current.filteredFlashcards).toEqual([]);
  });

  it('surfaces the loading and error states of both subscriptions', () => {
    const error = new Error('failed to load owned flashcards');
    overrideMockUseCombinedFiltersWithVocabulary({ isLoading: true });
    overrideMockUseStudentFlashcards({ isLoading: true, error });

    const { result } = renderFilter(false);

    expect(result.current.studentFlashcardsLoading).toBe(true);
    expect(result.current.filteredFlashcardsLoading).toBe(true);
    expect(result.current.error).toBe(error);
  });

  describe('when filtering is on', () => {
    const owned = (flashcards: Flashcard[]) =>
      overrideMockUseStudentFlashcards({
        flashcards,
        collectedExamples: flashcards.map((flashcard) => flashcard.example),
      });
    const filteredIds = (filteredFlashcards: Flashcard[]) =>
      filteredFlashcards.map((flashcard) => flashcard.example.id);

    it('keeps only flashcards with audio when audio only is on', () => {
      owned([
        createFlashcardWithExample(1, {
          spanishAudio: 'https://audio.test/es.mp3',
          englishAudio: 'https://audio.test/en.mp3',
        }),
        createFlashcardWithExample(2, { spanishAudio: '', englishAudio: '' }),
      ]);
      overrideMockUseCombinedFiltersWithVocabulary({ audioOnly: true });

      const { result } = renderFilter(true);

      expect(filteredIds(result.current.filteredFlashcards)).toEqual([1]);
    });

    it('keeps only flashcards that practice a selected skill tag', () => {
      owned([
        createFlashcardWithExample(1, {
          vocabulary: [createMockVocabulary({ id: 10 })],
        }),
        createFlashcardWithExample(2, {
          vocabulary: [createMockVocabulary({ id: 11 })],
        }),
      ]);
      overrideMockUseCombinedFiltersWithVocabulary({
        selectedSkillTags: [
          {
            type: SkillType.Vocabulary,
            key: 'Vocabulary-10',
            name: 'word',
            descriptor: '',
            vocabularyId: 10,
            subcategoryName: 'Nouns',
            frequency: null,
          },
        ],
        lessonVocabKnown: [10, 11],
      });

      const { result } = renderFilter(true);

      expect(filteredIds(result.current.filteredFlashcards)).toEqual([1]);
    });

    it('drops flashcards using vocabulary the student has not reached yet', () => {
      owned([
        createFlashcardWithExample(1, {
          vocabulary: [createMockVocabulary({ id: 10 })],
        }),
        createFlashcardWithExample(2, {
          vocabulary: [createMockVocabulary({ id: 99 })],
        }),
      ]);
      overrideMockUseCombinedFiltersWithVocabulary({
        lessonVocabKnown: [10, 11],
      });

      const { result } = renderFilter(true);

      expect(filteredIds(result.current.filteredFlashcards)).toEqual([1]);
    });

    it('keeps only flashcards using vocabulary required by the lesson range', () => {
      owned([
        createFlashcardWithExample(1, {
          vocabulary: [createMockVocabulary({ id: 10 })],
        }),
        createFlashcardWithExample(2, {
          vocabulary: [createMockVocabulary({ id: 11 })],
        }),
      ]);
      overrideMockUseCombinedFiltersWithVocabulary({
        lessonVocabKnown: [10, 11],
        lessonRangeVocabRequired: [11],
      });

      const { result } = renderFilter(true);

      expect(filteredIds(result.current.filteredFlashcards)).toEqual([2]);
    });
  });
});
