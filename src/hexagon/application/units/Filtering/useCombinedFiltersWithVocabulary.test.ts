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

interface LookupState {
  isLoading?: boolean;
  error?: Error | null;
}

const setVocabRequired = (
  state: LookupState & { lessonRangeVocabRequired?: number[] } = {},
): void => {
  mockUseLessonRangeVocabRequired.mockReturnValue({
    isLoading: false,
    error: null,
    ...state,
  });
};

const setVocabKnown = (
  state: LookupState & { lessonVocabKnown?: number[] } = {},
): void => {
  mockUseLessonVocabKnown.mockReturnValue({
    isLoading: false,
    error: null,
    ...state,
  });
};

const renderCombined = () =>
  renderHook(() => useCombinedFiltersWithVocabulary());

describe('useCombinedFiltersWithVocabulary', () => {
  beforeEach(() => {
    resetMockUseCombinedFilters();
    mockUseLessonRangeVocabRequired.mockReset();
    mockUseLessonVocabKnown.mockReset();
    setVocabRequired();
    setVocabKnown();
  });

  describe('vocabulary lookups', () => {
    it('looks up the vocabulary for the selected course and lesson range', () => {
      overrideMockUseCombinedFilters({
        courseId: 2,
        fromLessonNumber: 3,
        toLessonNumber: 9,
      });

      renderCombined();

      expect(mockUseLessonRangeVocabRequired).toHaveBeenCalledWith(2, 3, 9);
      expect(mockUseLessonVocabKnown).toHaveBeenCalledWith(2, 9);
    });

    it('looks up nothing while no course or lessons are selected', () => {
      renderCombined();

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
      overrideMockUseCombinedFilters({ fromLessonNumber: 3 });
      setVocabRequired({ lessonRangeVocabRequired: [7, 8] });
      setVocabKnown({ lessonVocabKnown: [1, 2, 7, 8] });

      const { result } = renderCombined();

      expect(result.current.filterStateWithVocabulary).toEqual({
        ...mockUseCombinedFilters.filterState,
        requiredVocabulary: [7, 8],
        allowedVocabulary: [1, 2, 7, 8],
      });
    });

    it('requires no vocabulary when no from lesson is selected', () => {
      setVocabRequired({ lessonRangeVocabRequired: [7, 8] });

      const { result } = renderCombined();

      expect(
        result.current.filterStateWithVocabulary.requiredVocabulary,
      ).toBeUndefined();
    });
  });

  describe('loading', () => {
    it.each([
      [
        'the combined filters',
        () => overrideMockUseCombinedFilters({ isLoading: true }),
      ],
      ['the required vocabulary', () => setVocabRequired({ isLoading: true })],
      ['the known vocabulary', () => setVocabKnown({ isLoading: true })],
    ])('is loading while %s are loading', (_source, startLoading) => {
      startLoading();

      const { result } = renderCombined();

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('error', () => {
    const error = new Error('lookup failed');

    it.each([
      ['the combined filters', () => overrideMockUseCombinedFilters({ error })],
      ['the required vocabulary', () => setVocabRequired({ error })],
      ['the known vocabulary', () => setVocabKnown({ error })],
    ])('surfaces a failure of %s', (_source, fail) => {
      fail();

      const { result } = renderCombined();

      expect(result.current.error).toBe(error);
    });
  });
});
