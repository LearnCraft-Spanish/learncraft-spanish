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
        const flashcard = createMockFlashcard({
          id,
          interval: 1,
          lastReviewed: undefined, // No previous review to ensure update proceeds
        });
        return { ...flashcard, example: { ...flashcard.example, id } };
      });

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: ({ exampleId }) =>
          mockFlashcards.find((f) => f.example.id === exampleId),
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
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 1,
        lastReviewed: undefined, // No previous review to ensure update proceeds
      });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => mockFlashcards[0],
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
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 1,
        lastReviewed: undefined, // No previous review to ensure update proceeds
      });
      const mockFlashcards = [
        { ...flashcard, example: { ...flashcard.example, id: 1 } },
      ];
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      overrideMockUseStudentFlashcards({
        flashcards: mockFlashcards,
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: () => mockFlashcards[0],
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
      const flashcard = createMockFlashcard({
        interval: 5,
        lastReviewed: undefined,
      });

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
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: undefined,
      });

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

  describe('stale update prevention', () => {
    it('should skip updates when flashcard lastReviewed is newer than pending update', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: tomorrow.toISOString(),
      });

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

      // Should not send any updates since flashcard is already reviewed
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('has already been reviewed'),
      );
    });

    it('should skip updates when flashcard lastReviewed equals pending update date', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const today = new Date().toISOString().slice(0, 10);
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: today,
      });

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

      // Should not send any updates since dates are equal
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
    });

    it('should process updates when flashcard lastReviewed is older than pending update', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: yesterday.toISOString().slice(0, 10),
      });

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

      // Should send the update since flashcard's lastReviewed is older
      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      expect(mockUpdateFlashcards.mock.calls[0][0]).toHaveLength(1);
    });

    it('should process updates when flashcard has no lastReviewed date', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: undefined,
      });

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

      // Should send the update since there's no previous review date
      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      expect(mockUpdateFlashcards.mock.calls[0][0]).toHaveLength(1);
    });

    it('should filter out stale updates while keeping valid ones in a batch', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Flashcard 1: stale (lastReviewed is tomorrow)
      const staleFlashcard = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: tomorrow.toISOString(),
      });
      // Flashcard 2: valid (lastReviewed is yesterday)
      const validFlashcard = createMockFlashcard({
        id: 2,
        interval: 3,
        lastReviewed: yesterday.toISOString().slice(0, 10),
      });
      // Flashcard 3: valid (no lastReviewed)
      const newFlashcard = createMockFlashcard({
        id: 3,
        interval: 1,
        lastReviewed: undefined,
      });

      const flashcardMap: Record<
        number,
        ReturnType<typeof createMockFlashcard>
      > = {
        1: { ...staleFlashcard, example: { ...staleFlashcard.example, id: 1 } },
        2: { ...validFlashcard, example: { ...validFlashcard.example, id: 2 } },
        3: { ...newFlashcard, example: { ...newFlashcard.example, id: 3 } },
      };

      overrideMockUseStudentFlashcards({
        flashcards: Object.values(flashcardMap),
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: ({ exampleId }) => flashcardMap[exampleId],
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(1, 'easy'); // stale - should be filtered
        result.current.handleReviewExample(2, 'hard'); // valid
        result.current.handleReviewExample(3, 'easy'); // valid
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      // Should only send 2 updates (filtered out the stale one)
      expect(mockUpdateFlashcards).toHaveBeenCalledTimes(1);
      expect(mockUpdateFlashcards.mock.calls[0][0]).toHaveLength(2);

      // Verify the correct flashcards were sent
      const sentIds = mockUpdateFlashcards.mock.calls[0][0].map(
        (u: { flashcardId: number }) => u.flashcardId,
      );
      expect(sentIds).toContain(2);
      expect(sentIds).toContain(3);
      expect(sentIds).not.toContain(1);
    });

    it('should not call updateFlashcards when all updates are stale', async () => {
      const mockUpdateFlashcards = vi.fn().mockResolvedValue([]);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const staleFlashcard1 = createMockFlashcard({
        id: 1,
        interval: 5,
        lastReviewed: tomorrow.toISOString(),
      });
      const staleFlashcard2 = createMockFlashcard({
        id: 2,
        interval: 3,
        lastReviewed: tomorrow.toISOString(),
      });

      const flashcardMap: Record<
        number,
        ReturnType<typeof createMockFlashcard>
      > = {
        1: {
          ...staleFlashcard1,
          example: { ...staleFlashcard1.example, id: 1 },
        },
        2: {
          ...staleFlashcard2,
          example: { ...staleFlashcard2.example, id: 2 },
        },
      };

      overrideMockUseStudentFlashcards({
        flashcards: Object.values(flashcardMap),
        updateFlashcards: mockUpdateFlashcards,
        getFlashcardByExampleId: ({ exampleId }) => flashcardMap[exampleId],
      });

      const { result } = renderHook(() => useStudentFlashcardUpdates(), {
        wrapper: MockAllProviders,
      });

      act(() => {
        result.current.handleReviewExample(1, 'easy');
        result.current.handleReviewExample(2, 'hard');
      });

      await act(async () => {
        await result.current.flushBatch();
      });

      // Should not call updateFlashcards since all updates are stale
      expect(mockUpdateFlashcards).not.toHaveBeenCalled();
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
      const flashcard = createMockFlashcard({
        id: 1,
        interval: 1,
        lastReviewed: undefined,
      });

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
