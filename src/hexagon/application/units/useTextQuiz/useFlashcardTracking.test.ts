import { overrideMockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { useSrsFunctionality } from '@application/units/useTextQuiz/useFlashcardTracking';
import { act, renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { vi } from 'vitest';

describe('useFlashcardTracking', () => {
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

    it('should return difficulty for reviewed examples', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      // Review an example (batched, not sent yet)
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
    });
  });

  describe('isExampleReviewPending', () => {
    it('should return false for unreviewed examples', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      expect(result.current.isExampleReviewPending(123)).toBe(false);
    });

    it('should return false for batched but not yet flushed reviews', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.isExampleReviewPending(123)).toBe(false);
    });
  });

  describe('handleReviewExample', () => {
    it('should add example to batch with easy difficulty', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
    });

    it('should add example to batch with hard difficulty', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(456, 'hard');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 456, difficulty: 'hard', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(456)).toBe('hard');
    });

    it('should batch multiple example reviews without sending', () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      overrideMockUseStudentFlashcards({
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(123, 'easy');
        result.current.handleReviewExample(456, 'hard');
        result.current.handleReviewExample(789, 'easy');
      });

      // Should be batched but not sent yet (batch size is 10)
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: false },
        { exampleId: 456, difficulty: 'hard', pending: false },
        { exampleId: 789, difficulty: 'easy', pending: false },
      ]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should prevent reviewing the same example twice', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useSrsFunctionality());

      // First review should succeed
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.examplesReviewedResults).toHaveLength(1);

      // Second review of same example should be prevented
      act(() => {
        result.current.handleReviewExample(123, 'hard');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Flashcard has already been reviewed, this should not happen',
      );
      expect(result.current.examplesReviewedResults).toHaveLength(1);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy'); // Still shows original difficulty

      consoleErrorSpy.mockRestore();
    });

    it('should handle reviewing different examples with same difficulty', () => {
      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(123, 'easy');
        result.current.handleReviewExample(456, 'easy');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        { exampleId: 123, difficulty: 'easy', pending: false },
        { exampleId: 456, difficulty: 'easy', pending: false },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(result.current.hasExampleBeenReviewed(456)).toBe('easy');
    });
  });

  describe('batching functionality', () => {
    it('should batch reviews up to 10 items before auto-flushing', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const mockFlashcards = Array.from({ length: 10 }, (_, i) => {
        const flashcard = createMockFlashcard({ id: i + 1, interval: 1 });
        return { ...flashcard, example: { ...flashcard.example, id: i + 1 } };
      });

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      // Add 9 reviews - should NOT trigger flush
      act(() => {
        for (let i = 1; i <= 9; i++) {
          result.current.handleReviewExample(i, i % 2 === 0 ? 'easy' : 'hard');
        }
      });

      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
      expect(result.current.examplesReviewedResults).toHaveLength(9);

      // Add 10th review - should trigger auto-flush
      await act(async () => {
        result.current.handleReviewExample(10, 'easy');
        // Wait for flush to complete
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      expect(mockUpdateFlashcards).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            flashcardId: expect.any(Number),
            interval: expect.any(Number),
            lastReviewedDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          }),
        ]),
      );
    });

    it('should manually flush batch with flushBatch()', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const mockFlashcards = [1, 2, 3].map((id) => {
        const flashcard = createMockFlashcard({ id, interval: 1 });
        return { ...flashcard, example: { ...flashcard.example, id } };
      });

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      // Add 3 reviews
      act(() => {
        result.current.handleReviewExample(1, 'easy');
        result.current.handleReviewExample(2, 'hard');
        result.current.handleReviewExample(3, 'easy');
      });

      expect(mockUpdateFlashcards).not.toHaveBeenCalled();

      // Manually flush
      await act(async () => {
        await result.current.flushBatch();
      });

      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      expect(mockUpdateFlashcards.mock.calls[0][0]).toHaveLength(3);
    });

    it('should include lastReviewedDate in updates', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ id: 1, interval: 1 });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(1, 'easy');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      const calls = mockUpdateFlashcards.mock.calls[0][0];
      expect(calls[0]).toHaveProperty('lastReviewedDate');
      expect(calls[0].lastReviewedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should not flush empty batch', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      overrideMockUseStudentFlashcards({
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      await act(async () => {
        await result.current.flushBatch();
      });

      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
    });

    it('should handle flush errors gracefully', async () => {
      const mockError = new Error('Network error');
      const mockUpdateFlashcards = vi.fn().mockRejectedValue(mockError);
      const flashcard = createMockFlashcard({ id: 1, interval: 1 });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(1, 'easy');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[SRS Batching] Failed to flush batch update:',
        mockError,
      );
      // Should still mark as reviewed (not pending) even on error
      expect(result.current.examplesReviewedResults[0].pending).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('viewed flashcards', () => {
    it('should keep the same interval when flashcard is marked as viewed', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ id: 1, interval: 5 });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      act(() => {
        result.current.handleReviewExample(1, 'viewed');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      const updateCall = mockUpdateFlashcards.mock.calls[0][0][0];
      expect(updateCall.interval).toBe(5); // Same as original interval
      expect(updateCall.lastReviewedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should allow re-reviewing a viewed flashcard with easy/hard', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ id: 1, interval: 5 });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      // First mark as viewed
      act(() => {
        result.current.handleReviewExample(1, 'viewed');
      });

      // Then mark as easy (should update the batch)
      act(() => {
        result.current.handleReviewExample(1, 'easy');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      const updateCall = mockUpdateFlashcards.mock.calls[0][0][0];
      expect(updateCall.interval).toBe(6); // Increased from 5 to 6 (easy)
    });

    it('should not allow re-reviewing a flashcard marked as easy or hard', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ id: 1, interval: 5 });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useSrsFunctionality());

      // First mark as easy
      act(() => {
        result.current.handleReviewExample(1, 'easy');
      });

      // Try to mark as hard (should be blocked)
      act(() => {
        result.current.handleReviewExample(1, 'hard');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Flashcard has already been reviewed, this should not happen',
      );
      // Should only have one update (the first easy one)
      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      const updateCall = mockUpdateFlashcards.mock.calls[0][0][0];
      expect(updateCall.interval).toBe(6); // easy

      consoleErrorSpy.mockRestore();
    });
  });
});
