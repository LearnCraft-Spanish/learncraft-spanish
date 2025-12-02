import { useFlushFlashcardUpdatesOnLoad } from '@application/units/flushFlashcardUpdatesOnLoad';
import {
  mockUseStudentFlashcardUpdates,
  overrideMockUseStudentFlashcardUpdates,
  resetMockUseStudentFlashcardUpdates,
} from '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates.mock';
import {
  mockUseStudentFlashcardUpdatesUtils,
  overrideMockUseStudentFlashcardUpdatesUtils,
  resetMockUseStudentFlashcardUpdatesUtils,
} from '@application/units/studentFlashcardUpdates/utils.mock';
import {
  overrideMockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import MockAllProviders from 'mocks/Providers/MockAllProviders';
import { vi } from 'vitest';

// Mock the hooks
vi.mock('@application/units/studentFlashcardUpdates/utils', () => ({
  useStudentFlashcardUpdatesUtils: vi.fn(
    () => mockUseStudentFlashcardUpdatesUtils,
  ),
}));

vi.mock(
  '@application/units/studentFlashcardUpdates/useStudentFlashcardUpdates',
  () => ({
    useStudentFlashcardUpdates: vi.fn(() => mockUseStudentFlashcardUpdates),
  }),
);

describe('useFlushFlashcardUpdatesOnLoad', () => {
  beforeEach(() => {
    resetMockUseStudentFlashcardUpdatesUtils();
    resetMockUseStudentFlashcardUpdates();
    resetMockUseStudentFlashcards();
  });

  it('should not flush when there are no pending updates in localStorage', () => {
    const mockFlushBatch = vi.fn();
    overrideMockUseStudentFlashcardUpdates({ flushBatch: mockFlushBatch });
    overrideMockUseStudentFlashcardUpdatesUtils({
      getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn(() => undefined),
    });

    renderHook(() => useFlushFlashcardUpdatesOnLoad(), {
      wrapper: MockAllProviders,
    });

    expect(mockFlushBatch).not.toHaveBeenCalled();
  });

  it('should not flush when pending updates array is empty', () => {
    const mockFlushBatch = vi.fn();
    overrideMockUseStudentFlashcardUpdates({ flushBatch: mockFlushBatch });
    overrideMockUseStudentFlashcardUpdatesUtils({
      getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn(() => []),
    });

    renderHook(() => useFlushFlashcardUpdatesOnLoad(), {
      wrapper: MockAllProviders,
    });

    expect(mockFlushBatch).not.toHaveBeenCalled();
  });

  it('should flush pending updates that need syncing', () => {
    const mockFlushBatch = vi.fn();
    const mockSetPending = vi.fn();
    const flashcard = createMockFlashcard({
      id: 1,
      lastReviewed: '2024-01-01',
    });

    overrideMockUseStudentFlashcards({
      flashcards: [flashcard],
      // lastReviewed (2024-01-01) is older than pending update (2025-01-01) → needs syncing
      getFlashcardByExampleId: () => flashcard,
    });

    overrideMockUseStudentFlashcardUpdates({ flushBatch: mockFlushBatch });
    overrideMockUseStudentFlashcardUpdatesUtils({
      getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn(() => [
        {
          exampleId: flashcard.example.id,
          difficulty: 'easy' as const,
          lastReviewedDate: '2025-01-01', // More recent than flashcard.lastReviewed
        },
      ]),
      setPendingFlashcardUpdateObjectsInLocalStorage: mockSetPending,
    });

    renderHook(() => useFlushFlashcardUpdatesOnLoad(), {
      wrapper: MockAllProviders,
    });

    expect(mockFlushBatch).toHaveBeenCalledTimes(1);
  });

  it('should filter out updates for deleted flashcards', () => {
    const mockFlushBatch = vi.fn();
    const mockSetPending = vi.fn();

    overrideMockUseStudentFlashcards({
      flashcards: [],
      getFlashcardByExampleId: () => undefined, // Flashcard not found (deleted)
    });

    overrideMockUseStudentFlashcardUpdates({ flushBatch: mockFlushBatch });
    overrideMockUseStudentFlashcardUpdatesUtils({
      getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn(() => [
        {
          exampleId: 999,
          difficulty: 'easy' as const,
          lastReviewedDate: '2025-01-01',
        },
      ]),
      setPendingFlashcardUpdateObjectsInLocalStorage: mockSetPending,
    });

    renderHook(() => useFlushFlashcardUpdatesOnLoad(), {
      wrapper: MockAllProviders,
    });

    // Should clear localStorage since no valid updates remain
    expect(mockSetPending).toHaveBeenCalledWith([]);
    expect(mockFlushBatch).not.toHaveBeenCalled();
  });

  it('should filter out already synced updates', () => {
    const mockFlushBatch = vi.fn();
    const mockSetPending = vi.fn();
    const flashcard = createMockFlashcard({ id: 1 });

    overrideMockUseStudentFlashcards({
      flashcards: [flashcard],
      getFlashcardByExampleId: () => ({
        ...flashcard,
        lastReviewed: '2025-12-01', // More recent than pending update
      }),
    });

    overrideMockUseStudentFlashcardUpdates({ flushBatch: mockFlushBatch });
    overrideMockUseStudentFlashcardUpdatesUtils({
      getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn(() => [
        {
          exampleId: flashcard.example.id,
          difficulty: 'easy' as const,
          lastReviewedDate: '2025-01-01', // Older than flashcard's lastReviewed
        },
      ]),
      setPendingFlashcardUpdateObjectsInLocalStorage: mockSetPending,
    });

    renderHook(() => useFlushFlashcardUpdatesOnLoad(), {
      wrapper: MockAllProviders,
    });

    // Should clear localStorage since update already synced
    expect(mockSetPending).toHaveBeenCalledWith([]);
    expect(mockFlushBatch).not.toHaveBeenCalled();
  });

  it('should only attempt flush once (ref tracking)', () => {
    const mockFlushBatch = vi.fn();
    const mockSetPending = vi.fn();
    const flashcard = createMockFlashcard({
      id: 1,
      lastReviewed: '2024-01-01',
    });

    overrideMockUseStudentFlashcards({
      flashcards: [flashcard],
      // lastReviewed (2024-01-01) is older than pending update (2025-01-01) → needs syncing
      getFlashcardByExampleId: () => flashcard,
    });

    overrideMockUseStudentFlashcardUpdates({ flushBatch: mockFlushBatch });
    overrideMockUseStudentFlashcardUpdatesUtils({
      getPendingFlashcardUpdateObjectsFromLocalStorage: vi.fn(() => [
        {
          exampleId: flashcard.example.id,
          difficulty: 'easy' as const,
          lastReviewedDate: '2025-01-01', // More recent than flashcard.lastReviewed
        },
      ]),
      setPendingFlashcardUpdateObjectsInLocalStorage: mockSetPending,
    });

    const { rerender } = renderHook(() => useFlushFlashcardUpdatesOnLoad(), {
      wrapper: MockAllProviders,
    });

    // Rerender multiple times
    rerender();
    rerender();
    rerender();

    // Should only flush once despite multiple rerenders
    expect(mockFlushBatch).toHaveBeenCalledTimes(1);
  });
});
