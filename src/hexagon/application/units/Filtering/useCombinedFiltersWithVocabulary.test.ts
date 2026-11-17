import {
  mockUseCombinedFilters,
  overrideMockUseCombinedFilters,
  resetMockUseCombinedFilters,
} from '@application/units/Filtering/useCombinedFilters.mock';
import { useCombinedFiltersWithVocabulary } from '@application/units/Filtering/useCombinedFiltersWithVocabulary';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUseLessonRangeVocabRequired = vi.hoisted(() => vi.fn());
const mockUseLessonVocabKnown = vi.hoisted(() => vi.fn());

vi.mock('@application/units/Filtering/useCombinedFilters', async () => {
  const { mockUseCombinedFilters: combinedFilters } =
    await import('@application/units/Filtering/useCombinedFilters.mock');
  return { useCombinedFilters: () => combinedFilters };
});

vi.mock('@application/queries/useLessonWithVocab', () => ({
  useLessonRangeVocabRequired: mockUseLessonRangeVocabRequired,
  useLessonVocabKnown: mockUseLessonVocabKnown,
}));

const vocabRequiredResult = (
  overrides: {
    lessonRangeVocabRequired?: number[];
    isLoading?: boolean;
    error?: Error | null;
  } = {},
) => ({
  lessonRangeVocabRequired: undefined,
  isLoading: false,
  error: null,
  ...overrides,
});

const vocabKnownResult = (
  overrides: {
    lessonVocabKnown?: number[];
    isLoading?: boolean;
    error?: Error | null;
  } = {},
) => ({
  lessonVocabKnown: undefined,
  isLoading: false,
  error: null,
  ...overrides,
});

describe('useCombinedFiltersWithVocabulary', () => {
  beforeEach(() => {
    resetMockUseCombinedFilters();
    mockUseLessonRangeVocabRequired.mockReset();
    mockUseLessonRangeVocabRequired.mockReturnValue(vocabRequiredResult());
    mockUseLessonVocabKnown.mockReset();
    mockUseLessonVocabKnown.mockReturnValue(vocabKnownResult());
  });

  describe('vocabulary lookups', () => {
    it('looks up the vocabulary for the selected course and lesson range', () => {
      overrideMockUseCombinedFilters({
        courseId: 2,
        fromLessonNumber: 3,
        toLessonNumber: 9,
      });

      renderHook(() => useCombinedFiltersWithVocabulary());

      expect(mockUseLessonRangeVocabRequired).toHaveBeenCalledWith(2, 3, 9);
      expect(mockUseLessonVocabKnown).toHaveBeenCalledWith(2, 9);
    });

    it('looks up nothing while no course or lessons are selected', () => {
      renderHook(() => useCombinedFiltersWithVocabulary());

      expect(mockUseLessonRangeVocabRequired).toHaveBeenCalledWith(
        null,
        null,
        null,
      );
      expect(mockUseLessonVocabKnown).toHaveBeenCalledWith(null, null);
    });
  });

  describe('filterStateWithVocabulary', () => {
    it('adds the required and allowed vocabulary to the combined filter state', () => {
      overrideMockUseCombinedFilters({
        courseId: 2,
        fromLessonNumber: 3,
        toLessonNumber: 9,
        filterState: {
          ...mockUseCombinedFilters.filterState,
          audioOnly: true,
        },
      });
      mockUseLessonRangeVocabRequired.mockReturnValue(
        vocabRequiredResult({ lessonRangeVocabRequired: [7, 8] }),
      );
      mockUseLessonVocabKnown.mockReturnValue(
        vocabKnownResult({ lessonVocabKnown: [1, 2, 7, 8] }),
      );

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.filterStateWithVocabulary).toEqual({
        ...mockUseCombinedFilters.filterState,
        requiredVocabulary: [7, 8],
        allowedVocabulary: [1, 2, 7, 8],
      });
    });

    it('requires no vocabulary when no from lesson is selected', () => {
      overrideMockUseCombinedFilters({ courseId: 2, toLessonNumber: 9 });
      mockUseLessonRangeVocabRequired.mockReturnValue(
        vocabRequiredResult({ lessonRangeVocabRequired: [7, 8] }),
      );

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(
        result.current.filterStateWithVocabulary.requiredVocabulary,
      ).toBeUndefined();
    });

    it('allows no vocabulary until the known vocabulary has loaded', () => {
      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(
        result.current.filterStateWithVocabulary.allowedVocabulary,
      ).toEqual([]);
    });
  });

  describe('returned values', () => {
    it('passes through everything the combined filters return', () => {
      overrideMockUseCombinedFilters({
        excludeSpanglish: true,
        courseId: 2,
        isAdmin: true,
      });

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current).toMatchObject({
        excludeSpanglish: true,
        courseId: 2,
        isAdmin: true,
        updateAudioOnly: mockUseCombinedFilters.updateAudioOnly,
        filterState: mockUseCombinedFilters.filterState,
      });
    });

    it('exposes the required and known vocabulary it looked up', () => {
      mockUseLessonRangeVocabRequired.mockReturnValue(
        vocabRequiredResult({ lessonRangeVocabRequired: [7] }),
      );
      mockUseLessonVocabKnown.mockReturnValue(
        vocabKnownResult({ lessonVocabKnown: [1, 7] }),
      );

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.lessonRangeVocabRequired).toEqual([7]);
      expect(result.current.lessonVocabKnown).toEqual([1, 7]);
    });
  });

  describe('loading', () => {
    it('is not loading when nothing is loading', () => {
      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.isLoading).toBe(false);
    });

    it('is loading while the combined filters are loading', () => {
      overrideMockUseCombinedFilters({ isLoading: true });

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.isLoading).toBe(true);
    });

    it('is loading while the required vocabulary is loading', () => {
      mockUseLessonRangeVocabRequired.mockReturnValue(
        vocabRequiredResult({ isLoading: true }),
      );

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.isLoading).toBe(true);
    });

    it('is loading while the known vocabulary is loading', () => {
      mockUseLessonVocabKnown.mockReturnValue(
        vocabKnownResult({ isLoading: true }),
      );

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('error', () => {
    it('has no error when nothing failed', () => {
      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.error).toBeNull();
    });

    it('surfaces a combined-filters failure', () => {
      const error = new Error('filters failed');
      overrideMockUseCombinedFilters({ error });

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.error).toBe(error);
    });

    it('surfaces a required-vocabulary failure', () => {
      const error = new Error('required vocabulary failed');
      mockUseLessonRangeVocabRequired.mockReturnValue(
        vocabRequiredResult({ error }),
      );

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.error).toBe(error);
    });

    it('surfaces a known-vocabulary failure', () => {
      const error = new Error('known vocabulary failed');
      mockUseLessonVocabKnown.mockReturnValue(vocabKnownResult({ error }));

      const { result } = renderHook(() => useCombinedFiltersWithVocabulary());

      expect(result.current.error).toBe(error);
    });
  });
});
