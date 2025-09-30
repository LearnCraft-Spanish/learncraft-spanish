import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { overrideMockUseStudentFlashcards } from '../useStudentFlashcards.mock';
import { useSrsFunctionality } from './useSrsFunctionality';

describe('useSrsFunctionality', () => {
  beforeEach(() => {
    // Reset console.error spy
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty results', () => {
    const { result } = renderHook(() => useSrsFunctionality());

    expect(result.current.examplesReviewedResults).toEqual([]);
  });

  describe('hasExampleBeenReviewed', () => {
    it('should return null for unreviewed examples', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      expect(result.current.hasExampleBeenReviewed(123)).toBeNull();
    });

    it('should return difficulty for reviewed examples', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(2);
      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      // Review an example
      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
    });
  });

  describe('isExampleReviewPending', () => {
    it('should return false for unreviewed examples', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      expect(result.current.isExampleReviewPending(123)).toBe(false);
    });

    it('should return false for completed reviews', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(2);
      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.isExampleReviewPending(123)).toBe(false);
    });
  });

  describe('handleReviewExample', () => {
    it('should successfully review an example with easy difficulty', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(2);
      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
      });

      expect(mockUpdateFlashcardInterval).toHaveBeenCalledWith(123, 'easy');
      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
    });

    it('should successfully review an example with hard difficulty', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(1);
      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.handleReviewExample(456, 'hard');
      });

      expect(mockUpdateFlashcardInterval).toHaveBeenCalledWith(456, 'hard');
      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 456, difficulty: 'hard', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(456)).toBe('hard');
    });

    it('should handle multiple example reviews', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(2);
      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
        await result.current.handleReviewExample(456, 'hard');
        await result.current.handleReviewExample(789, 'easy');
      });

      expect(mockUpdateFlashcardInterval).toHaveBeenCalledTimes(3);
      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: false },
        { exampleId: 456, difficulty: 'hard', pending: false },
        { exampleId: 789, difficulty: 'easy', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(result.current.hasExampleBeenReviewed(456)).toBe('hard');
      expect(result.current.hasExampleBeenReviewed(789)).toBe('easy');
    });

    it('should log error and leave example in pending state when updateFlashcardInterval fails', async () => {
      const mockError = new Error('Failed to update interval');
      const mockUpdateFlashcardInterval = vi.fn().mockRejectedValue(mockError);
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
      });

      expect(mockUpdateFlashcardInterval).toHaveBeenCalledWith(123, 'easy');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to update flashcard interval:',
        mockError,
      );
      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: true },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(result.current.isExampleReviewPending(123)).toBe(true);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('edge cases and error handling', () => {
    it('should prevent reviewing the same example twice', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(2);
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      // First review should succeed
      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.examplesReviewedResults).toHaveLength(1);
      expect(mockUpdateFlashcardInterval).toHaveBeenCalledTimes(1);

      // Second review of same example should be prevented
      await act(async () => {
        await result.current.handleReviewExample(123, 'hard');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Flashcard has already been reviewed, this should not happen',
      );
      expect(result.current.examplesReviewedResults).toHaveLength(1);
      expect(mockUpdateFlashcardInterval).toHaveBeenCalledTimes(1); // Still only called once
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy'); // Still shows original difficulty

      consoleErrorSpy.mockRestore();
    });

    it('should handle reviewing different examples with same difficulty', async () => {
      const mockUpdateFlashcardInterval = vi.fn().mockResolvedValue(2);
      overrideMockUseStudentFlashcards({
        updateFlashcardInterval: mockUpdateFlashcardInterval,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.handleReviewExample(123, 'easy');
        await result.current.handleReviewExample(456, 'easy');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: false },
        { exampleId: 456, difficulty: 'easy', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(result.current.hasExampleBeenReviewed(456)).toBe('easy');
    });
  });
});
