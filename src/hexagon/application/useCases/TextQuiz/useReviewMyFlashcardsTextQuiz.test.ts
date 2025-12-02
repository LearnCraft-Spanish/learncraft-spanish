import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockUseStudentFlashcardUpdates,
  overrideMockUseStudentFlashcardUpdates,
  resetMockUseStudentFlashcardUpdates,
} from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates.mock';
import {
  mockUseTextQuiz,
  overrideMockUseTextQuiz,
  resetMockUseTextQuiz,
} from '@application/units/useTextQuiz/useTextQuiz.mock';
import { useReviewMyFlashcardsTextQuiz } from '@application/useCases/TextQuiz/useReviewMyFlashcardsTextQuiz';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@application/units/studentFlashcardUpdates', () => ({
  useStudentFlashcardUpdates: () => mockUseStudentFlashcardUpdates,
}));

vi.mock('@application/units/useTextQuiz/useTextQuiz', () => ({
  useTextQuiz: () => mockUseTextQuiz,
}));

describe('useReviewMyFlashcardsTextQuiz', () => {
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList()(3);
  const mockCleanupFunction = vi.fn();
  const mockNextExample = vi.fn();

  const defaultProps = {
    examples: mockExamples,
    startWithSpanish: false,
    cleanupFunction: mockCleanupFunction,
  };

  beforeEach(() => {
    mockCleanupFunction.mockClear();
    mockNextExample.mockClear();
    resetMockUseStudentFlashcardUpdates();
    resetMockUseTextQuiz();

    // Set up useTextQuiz mock with current example
    overrideMockUseTextQuiz({
      currentExample: mockExamples[0],
      nextExample: mockNextExample,
      cleanupFunction: mockCleanupFunction,
      isQuizComplete: false,
    });
  });

  describe('enhanced nextExample', () => {
    it('should mark example as viewed when navigating if not reviewed', () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue(null);

      overrideMockUseStudentFlashcardUpdates({
        handleReviewExample: mockHandleReviewExample,
        hasExampleBeenReviewed: mockHasExampleBeenReviewed,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsTextQuiz(defaultProps),
      );

      act(() => {
        result.current.nextExample();
      });

      expect(mockHandleReviewExample).toHaveBeenCalledWith(
        mockExamples[0].id,
        'viewed',
      );
      expect(mockNextExample).toHaveBeenCalled();
    });

    it('should NOT mark if already reviewed', () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue('hard');

      overrideMockUseStudentFlashcardUpdates({
        handleReviewExample: mockHandleReviewExample,
        hasExampleBeenReviewed: mockHasExampleBeenReviewed,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsTextQuiz(defaultProps),
      );

      act(() => {
        result.current.nextExample();
      });

      expect(mockHandleReviewExample).not.toHaveBeenCalled();
      expect(mockNextExample).toHaveBeenCalled();
    });
  });

  describe('flush batch behavior', () => {
    it('should flush batch on cleanup', () => {
      const mockFlushBatch = vi.fn();

      overrideMockUseStudentFlashcardUpdates({
        flushBatch: mockFlushBatch,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsTextQuiz(defaultProps),
      );

      act(() => {
        result.current.cleanupFunction();
      });

      expect(mockFlushBatch).toHaveBeenCalled();
      expect(mockCleanupFunction).toHaveBeenCalled();
    });

    it('should flush batch when quiz completes', () => {
      const mockFlushBatch = vi.fn();

      overrideMockUseStudentFlashcardUpdates({
        flushBatch: mockFlushBatch,
      });

      // Start with incomplete quiz
      overrideMockUseTextQuiz({
        currentExample: mockExamples[0],
        isQuizComplete: false,
      });

      const { rerender } = renderHook(() =>
        useReviewMyFlashcardsTextQuiz(defaultProps),
      );

      // Simulate quiz completion
      overrideMockUseTextQuiz({
        currentExample: mockExamples[0],
        isQuizComplete: true,
      });

      rerender();

      expect(mockFlushBatch).toHaveBeenCalled();
    });
  });
});
