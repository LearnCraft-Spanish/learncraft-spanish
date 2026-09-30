import type { PaginationState } from '@application/units/Pagination/usePagination';
import type { UseFlashcardTableProps } from '@application/units/useFlashcardTable';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { Flashcard } from '@learncraft-spanish/shared';
import { useFlashcardTable } from '@application/units/useFlashcardTable';
import {
  mockUseLessonPopup,
  overrideMockUseLessonPopup,
  resetMockUseLessonPopup,
} from '@application/units/useLessonPopup.mock';
import {
  mockUseStudentFlashcards,
  overrideMockUseStudentFlashcards,
  resetMockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { act, renderHook } from '@testing-library/react';
import { createMockFlashcard } from '@testing/factories/flashcardFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/units/useLessonPopup', () => ({
  default: (...args: Parameters<typeof mockUseLessonPopup>) =>
    mockUseLessonPopup(...args),
}));

function makeFlashcard(flashcardId: number, exampleId: number): Flashcard {
  const card = createMockFlashcard({ id: flashcardId, userId: 42 });
  return {
    ...card,
    id: flashcardId,
    userId: 42,
    example: { ...card.example, id: exampleId },
  };
}

function pagination(overrides: Partial<PaginationState> = {}): PaginationState {
  return {
    totalItems: 0,
    pageNumber: 1,
    maxPageNumber: 1,
    startIndex: 0,
    endIndex: 0,
    pageSize: 50,
    isOnFirstPage: true,
    isOnLastPage: true,
    previousPage: vi.fn<() => void>(),
    nextPage: vi.fn<() => void>(),
    goToFirstPage: vi.fn<() => void>(),
    goToPage: vi.fn<(page: number) => void>(),
    ...overrides,
  };
}

function tableProps(
  overrides: Partial<UseFlashcardTableProps> = {},
): UseFlashcardTableProps {
  return {
    allFlashcards: [],
    displayFlashcards: [],
    paginationState: pagination(),
    onGoingToQuiz: vi.fn<() => void>(),
    isLoading: false,
    error: null,
    ...overrides,
  };
}

function renderTable(props: UseFlashcardTableProps) {
  return renderHook(
    (nextProps: UseFlashcardTableProps) => useFlashcardTable(nextProps),
    { initialProps: props },
  );
}

describe('useFlashcardTable', () => {
  beforeEach(() => {
    resetMockUseLessonPopup();
    resetMockUseStudentFlashcards();
  });

  it('returns the page rows and the full result rows it was given', () => {
    const onPage = makeFlashcard(500, 7);
    const offPage = makeFlashcard(501, 8);
    const paginationState = pagination({ totalItems: 2, endIndex: 1 });
    const onGoingToQuiz = vi.fn<() => void>();
    const props = tableProps({
      allFlashcards: [onPage, offPage],
      displayFlashcards: [onPage],
      paginationState,
      onGoingToQuiz,
    });

    const { result } = renderTable(props);

    expect(result.current.displayFlashcards).toEqual([onPage]);
    expect(result.current.allFlashcards).toEqual([onPage, offPage]);
    expect(result.current.paginationState).toBe(paginationState);
    expect(result.current.onGoingToQuiz).toBe(onGoingToQuiz);
    expect(result.current.error).toBeNull();
  });

  it('keeps an empty page empty, including while the table is loading', () => {
    const paginationState = pagination({ totalItems: 0, endIndex: 0 });
    const props = tableProps({
      isLoading: true,
      paginationState,
    });

    const { result } = renderTable(props);

    expect(result.current.displayFlashcards).toEqual([]);
    expect(result.current.allFlashcards).toEqual([]);
    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.isSomethingPending).toBe(false);

    act(() => {
      result.current.selectAllOnPage();
      result.current.addToSelectedIds(7);
    });

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.isSelected(7)).toBe(false);
  });

  it('still returns the current rows while a reload is in progress', () => {
    const onPage = makeFlashcard(500, 7);
    const props = tableProps({
      isLoading: true,
      allFlashcards: [onPage],
      displayFlashcards: [onPage],
      paginationState: pagination({ totalItems: 1, endIndex: 1 }),
    });

    const { result } = renderTable(props);

    expect(result.current.displayFlashcards).toEqual([onPage]);
    expect(result.current.allFlashcards).toEqual([onPage]);
  });

  it('returns the load error alongside whatever rows were already given', () => {
    const onPage = makeFlashcard(500, 7);
    const error = new Error('failed to load flashcards');
    const props = tableProps({
      error,
      allFlashcards: [onPage],
      displayFlashcards: [onPage],
    });

    const { result } = renderTable(props);

    expect(result.current.error).toBe(error);
    expect(result.current.displayFlashcards).toEqual([onPage]);
  });

  it('selects example ids on the current page', () => {
    const first = makeFlashcard(500, 7);
    const second = makeFlashcard(501, 8);
    const props = tableProps({
      allFlashcards: [first, second],
      displayFlashcards: [first, second],
      paginationState: pagination({ totalItems: 2, endIndex: 2 }),
    });

    const { result, rerender } = renderTable(props);

    act(() => {
      result.current.addToSelectedIds(first.example.id);
    });
    expect(result.current.isSelected(first.example.id)).toBe(true);
    expect(result.current.isSelected(first.id)).toBe(false);
    expect(result.current.selectedIds).toEqual([first.example.id]);

    act(() => {
      result.current.selectAllOnPage();
    });
    expect(result.current.selectedIds).toEqual([
      first.example.id,
      second.example.id,
    ]);

    act(() => {
      result.current.removeFromSelectedIds(first.example.id);
    });
    expect(result.current.selectedIds).toEqual([second.example.id]);

    rerender(
      tableProps({
        allFlashcards: [first, second],
        displayFlashcards: [first],
        paginationState: pagination({ totalItems: 2, endIndex: 1 }),
      }),
    );
    expect(result.current.selectedIds).toEqual([]);

    act(() => {
      result.current.addToSelectedIds(second.example.id);
      result.current.clearSelection();
    });
    expect(result.current.selectedIds).toEqual([]);
  });

  it('deletes by example id, and only the ids still on the page', async () => {
    const first = makeFlashcard(500, 7);
    const second = makeFlashcard(501, 8);
    const props = tableProps({
      allFlashcards: [first, second],
      displayFlashcards: [first, second],
    });

    const { result } = renderTable(props);

    await expect(
      result.current.deleteFlashcard(first.example.id),
    ).resolves.toBe(1);
    expect(mockUseStudentFlashcards.deleteFlashcards).toHaveBeenCalledWith([
      first.example.id,
    ]);

    act(() => {
      result.current.selectAllOnPage();
      result.current.addToSelectedIds(999);
    });

    await expect(result.current.deleteSelectedFlashcards()).resolves.toBe(2);
    expect(mockUseStudentFlashcards.deleteFlashcards).toHaveBeenLastCalledWith([
      first.example.id,
      second.example.id,
    ]);
  });

  it('reports nothing pending while the student flashcards are still loading', () => {
    overrideMockUseStudentFlashcards({
      flashcards: undefined,
      isPendingFlashcard: () => true,
    });

    const { result } = renderTable(tableProps({ isLoading: true }));

    expect(result.current.isSomethingPending).toBe(false);
    expect(result.current.isRemovingFlashcard(7)).toBe(true);
  });

  it('reports a pending change from the student list, including cards off the page', () => {
    const onPage = makeFlashcard(500, 7);
    const offPage = makeFlashcard(501, 8);
    overrideMockUseStudentFlashcards({
      flashcards: [onPage, offPage],
      isPendingFlashcard: ({ exampleId }) => exampleId === offPage.example.id,
    });

    const { result } = renderTable(
      tableProps({
        allFlashcards: [onPage, offPage],
        displayFlashcards: [onPage],
      }),
    );

    expect(result.current.isSomethingPending).toBe(true);
    expect(result.current.isRemovingFlashcard(offPage.example.id)).toBe(true);
    expect(result.current.isRemovingFlashcard(onPage.example.id)).toBe(false);
  });

  it('returns the lesson popup the row menu reads', () => {
    const lessonPopup: LessonPopup = {
      lessonsByVocabulary: [],
      lessonsLoading: true,
      currentCourseName: 'LearnCraft Spanish',
    };
    overrideMockUseLessonPopup({ lessonPopup });

    const { result } = renderTable(tableProps());

    expect(result.current.lessonPopup).toBe(lessonPopup);
  });
});
