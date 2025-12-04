import {
  mockLocalStorageAdapter,
  resetMockLocalStorageAdapter,
} from '@application/adapters/localStorageAdapter.mock';
import { useStudentFlashcardUpdates } from '@application/units/studentFlashcardUpdates';
import {
  overrideMockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { act, renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { vi } from 'vitest';

describe('useStudentFlashcardUpdates', () => {
  beforeEach(() => {
    // Reset mocks to default state before each test
    resetMockLocalStorageAdapter();
    resetMockUseStudentFlashcards();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty results', () => {
    const { result } = renderHook(() => useStudentFlashcardUpdates(), {
      wrapper: MockAllProviders,
    });

    expect(result.current.examplesReviewedResults).toEqual([]);
  });

  describe('hasExampleBeenReviewed', () => {
    it('should return null for unreviewed examples', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBeNull();
    });

    it('should return difficulty for reviewed examples', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      // Review an example (batched, not sent yet)
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
    });
  });

  describe('handleReviewExample', () => {
    it('should add example to batch with easy difficulty', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        {
          exampleId: 123,
          difficulty: 'easy',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
    });

    it('should add example to batch with hard difficulty', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(456, 'hard');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        {
          exampleId: 456,
          difficulty: 'hard',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
      ]);
      expect(result.current.hasExampleBeenReviewed(456)).toBe('hard');
    });

    it('should batch multiple example reviews without sending', () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      overrideMockUseStudentFlashcards({
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(123, 'easy');
        result.current.handleReviewExample(456, 'hard');
        result.current.handleReviewExample(789, 'easy');
      });

      // Should be batched but not sent yet (batch size is 10)
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
      expect(result.current.examplesReviewedResults).toEqual([
        {
          exampleId: 123,
          difficulty: 'easy',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
        {
          exampleId: 456,
          difficulty: 'hard',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
        {
          exampleId: 789,
          difficulty: 'easy',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle reviewing different examples with same difficulty', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(123, 'easy');
        result.current.handleReviewExample(456, 'easy');
      });

      expect(result.current.examplesReviewedResults).toEqual([
        {
          exampleId: 123,
          difficulty: 'easy',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
        {
          exampleId: 456,
          difficulty: 'easy',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
      ]);
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(result.current.hasExampleBeenReviewed(456)).toBe('easy');
    });
  });

  describe('batching functionality', () => {
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

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

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

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

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

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

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

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

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

      consoleErrorSpy.mockRestore();
    });
  });

  describe('viewed flashcards', () => {
    it('should keep the same interval when flashcard is marked as viewed', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ interval: 5 });

      overrideMockUseStudentFlashcards({
        flashcards: [flashcard],
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => flashcard,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(flashcard.example.id, 'viewed');
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

      overrideMockUseStudentFlashcards({
        flashcards: [flashcard],
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => flashcard,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      // First mark as viewed
      act(() => {
        result.current.handleReviewExample(flashcard.example.id, 'viewed');
      });

      // Then mark as easy (should replace viewed in batch)
      act(() => {
        result.current.handleReviewExample(flashcard.example.id, 'easy');
      });

      // Batch should only have one entry (easy replaced viewed)
      expect(result.current.examplesReviewedResults).toHaveLength(1);
      expect(result.current.examplesReviewedResults[0].difficulty).toBe('easy');

      await act(async () => {
        await result.current.flushBatch();
      });

      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      const updateCall = mockUpdateFlashcards.mock.calls[0][0][0];
      expect(updateCall.interval).toBe(6); // Increased from 5 to 6 (easy)
    });
  });

  describe('localStorage integration', () => {
    it('should persist reviewed examples to localStorage', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      // Verify localStorage was called
      expect(mockLocalStorageAdapter.setItem).toHaveBeenCalled();
    });

    it('should retrieve reviewed examples from localStorage', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      // Pre-populate via the hook
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      // Check if example is marked as reviewed (reads from localStorage)
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(mockLocalStorageAdapter.getItem).toHaveBeenCalledWith(
        'srs-pending-updates',
      );
    });

    it('should clear localStorage after successful flush', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ id: 1, interval: 1 });

      overrideMockUseStudentFlashcards({
        flashcards: [flashcard],
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => flashcard,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(flashcard.example.id, 'easy');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      // Verify localStorage was cleared after successful flush
      expect(mockLocalStorageAdapter.setItem).toHaveBeenLastCalledWith(
        'srs-pending-updates',
        [],
      );
    });

    it('should restore batch to localStorage on flush error', async () => {
      const mockError = new Error('Network error');
      const mockUpdateFlashcards = vi.fn().mockRejectedValue(mockError);
      const flashcard = createMockFlashcard({ id: 1, interval: 1 });

      overrideMockUseStudentFlashcards({
        flashcards: [flashcard],
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => flashcard,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(flashcard.example.id, 'easy');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      // Verify the batch was restored to localStorage after error
      // The last call should restore the batch (not clear it)
      const lastCall =
        mockLocalStorageAdapter.setItem.mock.calls[
          mockLocalStorageAdapter.setItem.mock.calls.length - 1
        ];
      expect(lastCall[0]).toBe('srs-pending-updates');
      expect(lastCall[1]).toHaveLength(1);
    });

    it('should update existing example in localStorage if reviewed again', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      // First review
      act(() => {
        result.current.handleReviewExample(123, 'hard');
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBe('hard');

      // Second review with different difficulty - should replace the old one
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');

      // Verify state only has one entry for this example
      expect(result.current.examplesReviewedResults).toHaveLength(1);
      expect(result.current.examplesReviewedResults[0].difficulty).toBe('easy');
    });
  });
});
