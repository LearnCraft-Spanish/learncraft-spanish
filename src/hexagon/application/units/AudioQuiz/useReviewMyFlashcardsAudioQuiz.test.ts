import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import {
  mockAudioAdapter,
  resetMockAudioAdapter,
} from '@application/adapters/audioAdapter.mock';
import { useReviewMyFlashcardsAudioQuiz } from '@application/units/AudioQuiz/useReviewMyFlashcardsAudioQuiz';
import {
  mockUseStudentFlashcardUpdates,
  overrideMockUseStudentFlashcardUpdates,
  resetMockUseStudentFlashcardUpdates,
} from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates.mock';
import {
  mockUseAudioQuizMapper,
  resetMockUseAudioQuizMapper,
} from '@application/units/useAudioQuizMapper.mock';
import { AudioQuizStep, AudioQuizType } from '@domain/audioQuizzing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@application/adapters/audioAdapter', () => ({
  useAudioAdapter: () => mockAudioAdapter,
}));

vi.mock('@application/units/useAudioQuizMapper', () => ({
  useAudioQuizMapper: () => mockUseAudioQuizMapper,
}));

vi.mock('@application/units/studentFlashcardUpdates', () => ({
  useStudentFlashcardUpdates: () => mockUseStudentFlashcardUpdates,
}));

describe('useReviewMyFlashcardsAudioQuiz', () => {
  const mockCleanupFunction = vi.fn();
  const mockExamples: ExampleWithVocabulary[] =
    createMockExampleWithVocabularyList()(3);

  const defaultProps = {
    audioQuizProps: {
      examplesToQuiz: mockExamples,
      audioQuizType: AudioQuizType.Speaking,
      autoplay: false,
      ready: true,
      cleanupFunction: mockCleanupFunction,
    },
  };

  beforeEach(() => {
    mockCleanupFunction.mockClear();
    resetMockAudioAdapter();
    resetMockUseAudioQuizMapper();
    resetMockUseStudentFlashcardUpdates();
  });

  afterEach(async () => {
    await vi.waitFor(() => Promise.resolve());
  });

  describe('enhanced nextExample', () => {
    it('should mark example as viewed when navigating to next if not already reviewed', async () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue(null);

      overrideMockUseStudentFlashcardUpdates({
        handleReviewExample: mockHandleReviewExample,
        hasExampleBeenReviewed: mockHasExampleBeenReviewed,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsAudioQuiz(defaultProps),
      );

      await waitFor(() => {
        expect(result.current.currentExampleReady).toBe(true);
        expect(result.current.nextExampleReady).toBe(true);
      });

      const currentExampleId = result.current.currentExample?.id;

      act(() => {
        result.current.nextExample();
      });

      expect(mockHandleReviewExample).toHaveBeenCalledWith(
        currentExampleId,
        'viewed',
      );
    });

    it('should NOT mark example as viewed if already reviewed', async () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue('easy'); // Already reviewed

      overrideMockUseStudentFlashcardUpdates({
        handleReviewExample: mockHandleReviewExample,
        hasExampleBeenReviewed: mockHasExampleBeenReviewed,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsAudioQuiz(defaultProps),
      );

      await waitFor(() => {
        expect(result.current.currentExampleReady).toBe(true);
        expect(result.current.nextExampleReady).toBe(true);
      });

      act(() => {
        result.current.nextExample();
      });

      expect(mockHandleReviewExample).not.toHaveBeenCalled();
    });
  });

  describe('enhanced nextStep', () => {
    it('should mark example as viewed when stepping from Answer if not reviewed', async () => {
      const mockHandleReviewExample = vi.fn();
      const mockHasExampleBeenReviewed = vi.fn().mockReturnValue(null);

      overrideMockUseStudentFlashcardUpdates({
        handleReviewExample: mockHandleReviewExample,
        hasExampleBeenReviewed: mockHasExampleBeenReviewed,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsAudioQuiz(defaultProps),
      );

      await waitFor(() => {
        expect(result.current.currentExampleReady).toBe(true);
      });

      // Go to Answer step first
      act(() => {
        result.current.goToAnswer();
      });

      expect(result.current.currentStep).toBe(AudioQuizStep.Answer);

      const currentExampleId = result.current.currentExample?.id;

      // Step from Answer (triggers mark as viewed)
      act(() => {
        result.current.nextStep();
      });

      expect(mockHandleReviewExample).toHaveBeenCalledWith(
        currentExampleId,
        'viewed',
      );
    });
  });

  describe('flush batch behavior', () => {
    it('should flush batch when quiz completes', async () => {
      const mockFlushBatch = vi.fn();

      overrideMockUseStudentFlashcardUpdates({
        flushBatch: mockFlushBatch,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsAudioQuiz(defaultProps),
      );

      await waitFor(() => {
        expect(result.current.currentExampleReady).toBe(true);
      });

      // Navigate to last example
      for (let i = 0; i < mockExamples.length - 1; i++) {
        await waitFor(() => {
          expect(result.current.nextExampleReady).toBe(true);
        });
        act(() => {
          result.current.nextExample();
        });
      }

      // Complete the quiz
      act(() => {
        result.current.nextExample();
      });

      expect(result.current.isQuizComplete).toBe(true);
      expect(mockFlushBatch).toHaveBeenCalled();
    });

    it('should flush batch on cleanup', async () => {
      const mockFlushBatch = vi.fn();

      overrideMockUseStudentFlashcardUpdates({
        flushBatch: mockFlushBatch,
      });

      const { result } = renderHook(() =>
        useReviewMyFlashcardsAudioQuiz(defaultProps),
      );

      await waitFor(() => {
        expect(result.current.currentExampleReady).toBe(true);
      });

      act(() => {
        result.current.cleanupFunction();
      });

      expect(mockFlushBatch).toHaveBeenCalled();
      expect(mockCleanupFunction).toHaveBeenCalled();
    });
  });
});
