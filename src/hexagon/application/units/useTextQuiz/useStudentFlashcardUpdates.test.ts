import {
  mockLocalStorageAdapter,
  resetMockLocalStorageAdapter,
} from '@application/adapters/localStorageAdapter.mock';
import { overrideMockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { useStudentFlashcardUpdates } from '@application/units/useTextQuiz/useStudentFlashcardUpdates';
import { act, renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { vi } from 'vitest';

// Mock the localStorage adapter
vi.mock('@application/adapters/localStorageAdapter', () => ({
  LocalStorageAdapter: () => mockLocalStorageAdapter,
}));

describe('useStudentFlashcardUpdates', () => {
  beforeEach(() => {
    // Reset console.error spy
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Reset the localStorage mock and clear storage
    resetMockLocalStorageAdapter();
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
    // TODO: implement logic, or remove test (batching by batch size is not implemented yet)
    it.skip('should batch reviews up to 10 items before auto-flushing', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const mockFlashcards = Array.from({ length: 10 }, (_, i) => {
        const flashcard = createMockFlashcard({ id: i + 1, interval: 1 });
        return { ...flashcard, example: { ...flashcard.example, id: i + 1 } };
      });

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

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

    it.skip('should allow re-reviewing a viewed flashcard with easy/hard', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({ id: 1, interval: 5 });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => flashcard,
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

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
  });

  describe.skip('localStorage integration', () => {
    it('should persist reviewed examples to localStorage', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      // Verify localStorage was called
      expect(mockLocalStorageAdapter.setItem).toHaveBeenCalled();

      // Verify the data was stored correctly
      expect(
        mockLocalStorageAdapter.getItem<
          Array<{
            exampleId: number;
            difficulty: string;
            lastReviewedDate: string;
          }>
        >('srs-pending-updates'),
      ).toEqual([
        {
          exampleId: 123,
          difficulty: 'easy',
          lastReviewedDate: new Date().toISOString().slice(0, 10),
        },
      ]);
    });

    it('should retrieve reviewed examples from localStorage', () => {
      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      // Pre-populate localStorage
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      // Check if example is marked as reviewed
      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');
      expect(mockLocalStorageAdapter.getItem).toHaveBeenCalledWith(
        'srs-pending-updates',
      );
    });

    it('should clear localStorage after successful flush', async () => {
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

      // Verify data is in localStorage before flush
      expect(
        mockLocalStorageAdapter.getItem<
          Array<{
            exampleId: number;
            difficulty: string;
            lastReviewedDate: string;
          }>
        >('srs-pending-updates'),
      ).toHaveLength(1);

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

      const reviewData = {
        exampleId: 1,
        difficulty: 'easy' as const,
        lastReviewedDate: new Date().toISOString().slice(0, 10),
      };

      act(() => {
        result.current.handleReviewExample(1, 'easy');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      // Verify the batch was restored to localStorage after error
      expect(mockLocalStorageAdapter.setItem).toHaveBeenLastCalledWith(
        'srs-pending-updates',
        [reviewData],
      );
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

      // Second review with different difficulty
      act(() => {
        result.current.handleReviewExample(123, 'easy');
      });

      expect(result.current.hasExampleBeenReviewed(123)).toBe('easy');

      // Should only have one entry in localStorage
      const storedData = mockLocalStorageAdapter.getItem<
        Array<{
          exampleId: number;
          difficulty: string;
          lastReviewedDate: string;
        }>
      >('srs-pending-updates');
      expect(storedData).toHaveLength(1);
      expect(storedData?.[0].difficulty).toBe('easy');
    });
  });
});
