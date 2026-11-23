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
import { useSrsTextQuiz } from '@application/useCases/TextQuiz/useSrsTextQuiz';
import { act, renderHook } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockToastInfo } = vi.hoisted(() => ({
  mockToastInfo: vi.fn<(message: string) => void>(),
}));

vi.mock('react-toastify', () => ({
  toast: { info: mockToastInfo },
}));

// Mock dependencies
vi.mock('@application/units/studentFlashcardUpdates', () => ({
  useStudentFlashcardUpdates: () => mockUseStudentFlashcardUpdates,
}));

vi.mock('@application/units/useTextQuiz/useTextQuiz', () => ({
  useTextQuiz: () => mockUseTextQuiz,
}));

describe('useSrsTextQuiz', () => {
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList(3);
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
    mockToastInfo.mockClear();
    resetMockUseStudentFlashcardUpdates();
    resetMockUseTextQuiz();

    overrideMockUseTextQuiz({
      currentExample: mockExamples[0],
      nextExample: mockNextExample,
      cleanupFunction: mockCleanupFunction,
      isQuizComplete: false,
    });
  });

  describe('return structure', () => {
    it('should return TextQuizReturn and srsQuizProps', () => {
      const { result } = renderHook(() => useSrsTextQuiz(defaultProps));

      expect(result.current.TextQuizReturn).toBeDefined();
      expect(result.current.srsQuizProps).toBeDefined();
      expect(result.current.srsQuizProps.handleReviewExample).toBeDefined();
      expect(result.current.srsQuizProps.hasExampleBeenReviewed).toBeDefined();
      expect(result.current.srsQuizProps.flushBatch).toBeDefined();
      expect(result.current.srsQuizProps.examplesReviewedResults).toBeDefined();
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

      const { result } = renderHook(() => useSrsTextQuiz(defaultProps));

      act(() => {
        result.current.TextQuizReturn.nextExample();
      });

      expect(mockHandleReviewExample).toHaveBeenCalledWith(
        mockExamples[0].id,
        'viewed',
      );
      expect(mockNextExample).toHaveBeenCalled();
    });

    it('should NOT mark if already reviewed', () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue('easy');

      overrideMockUseStudentFlashcardUpdates({
        handleReviewExample: mockHandleReviewExample,
        hasExampleBeenReviewed: mockHasExampleBeenReviewed,
      });

      const { result } = renderHook(() => useSrsTextQuiz(defaultProps));

      act(() => {
        result.current.TextQuizReturn.nextExample();
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

      const { result } = renderHook(() => useSrsTextQuiz(defaultProps));

      act(() => {
        result.current.TextQuizReturn.cleanupFunction();
      });

      expect(mockFlushBatch).toHaveBeenCalled();
      expect(mockCleanupFunction).toHaveBeenCalled();
    });

    it('should flush batch when quiz completes', () => {
      const mockFlushBatch = vi.fn();

      overrideMockUseStudentFlashcardUpdates({
        flushBatch: mockFlushBatch,
      });

      overrideMockUseTextQuiz({
        currentExample: mockExamples[0],
        isQuizComplete: false,
      });

      const { rerender } = renderHook(() => useSrsTextQuiz(defaultProps));

      // Simulate quiz completion
      overrideMockUseTextQuiz({
        currentExample: mockExamples[0],
        isQuizComplete: true,
      });

      rerender();

      expect(mockFlushBatch).toHaveBeenCalled();
    });
  });

  describe('untracked progress notice', () => {
    const UNTRACKED_MESSAGE =
      "SRS review progress isn't saved when using the app as another student.";

    it('shows an info toast when the quiz starts and progress is not tracked', () => {
      overrideMockUseStudentFlashcardUpdates({ isProgressTracked: false });

      renderHook(() => useSrsTextQuiz(defaultProps));

      expect(mockToastInfo).toHaveBeenCalledTimes(1);
      expect(mockToastInfo).toHaveBeenCalledWith(UNTRACKED_MESSAGE);
    });

    it('does not repeat the toast on re-render within the same quiz', () => {
      overrideMockUseStudentFlashcardUpdates({ isProgressTracked: false });

      const { rerender } = renderHook(() => useSrsTextQuiz(defaultProps));
      rerender();
      rerender();

      expect(mockToastInfo).toHaveBeenCalledTimes(1);
    });

    it('shows the toast again when a new quiz starts', () => {
      overrideMockUseStudentFlashcardUpdates({ isProgressTracked: false });

      const first = renderHook(() => useSrsTextQuiz(defaultProps));
      first.unmount();
      renderHook(() => useSrsTextQuiz(defaultProps));

      expect(mockToastInfo).toHaveBeenCalledTimes(2);
    });

    it('does not show the toast when progress is tracked', () => {
      overrideMockUseStudentFlashcardUpdates({ isProgressTracked: true });

      renderHook(() => useSrsTextQuiz(defaultProps));

      expect(mockToastInfo).not.toHaveBeenCalled();
    });
  });
});
