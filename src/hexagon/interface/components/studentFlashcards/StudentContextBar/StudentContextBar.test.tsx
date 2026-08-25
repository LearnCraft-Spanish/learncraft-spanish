import type { UseCombinedFiltersReturnType } from '@application/units/Filtering/useCombinedFilters';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import { StudentContextBar } from '@interface/components/studentFlashcards/StudentContextBar/StudentContextBar';
import { cleanup, render, screen } from '@testing-library/react';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { afterEach, describe, expect, it } from 'vitest';

function flashcardsQueryWithCount(count: number): UseStudentFlashcardsReturn {
  return {
    flashcards: count === 0 ? [] : createMockFlashcardList()(count),
  } as UseStudentFlashcardsReturn;
}

function exampleFilterWithLesson(
  toLessonNumber: number | null,
): UseCombinedFiltersReturnType {
  return { toLessonNumber } as UseCombinedFiltersReturnType;
}

describe('student context bar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders the building-for and owned-flashcards labels', () => {
    render(
      <StudentContextBar
        flashcardsQuery={flashcardsQueryWithCount(3)}
        exampleFilter={exampleFilterWithLesson(null)}
        studentDisplayName="Alex Rivera"
      />,
    );

    expect(screen.getByText('Building for')).toBeInTheDocument();
    expect(screen.getByText('Owned flashcards')).toBeInTheDocument();
    expect(screen.getByText('Alex Rivera')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Change student' }),
    ).toBeInTheDocument();
  });

  it('shows a plural owned-flashcards count from flashcardsQuery', () => {
    render(
      <StudentContextBar
        flashcardsQuery={flashcardsQueryWithCount(24)}
        exampleFilter={exampleFilterWithLesson(null)}
        studentDisplayName="Alex Rivera"
      />,
    );

    expect(screen.getByText('24 flashcards')).toBeInTheDocument();
  });

  it('shows a singular owned-flashcards count', () => {
    render(
      <StudentContextBar
        flashcardsQuery={flashcardsQueryWithCount(1)}
        exampleFilter={exampleFilterWithLesson(null)}
        studentDisplayName="Alex Rivera"
      />,
    );

    expect(screen.getByText('1 flashcard')).toBeInTheDocument();
  });

  it('treats a missing flashcards list as zero', () => {
    render(
      <StudentContextBar
        flashcardsQuery={
          { flashcards: undefined } as UseStudentFlashcardsReturn
        }
        exampleFilter={exampleFilterWithLesson(null)}
        studentDisplayName="Alex Rivera"
      />,
    );

    expect(screen.getByText('0 flashcards')).toBeInTheDocument();
  });

  it('shows name and through-lesson on one line', () => {
    render(
      <StudentContextBar
        flashcardsQuery={flashcardsQueryWithCount(3)}
        exampleFilter={exampleFilterWithLesson(8)}
        studentDisplayName="Alex Rivera"
      />,
    );

    expect(screen.getByText('Alex Rivera · Lesson 8')).toBeInTheDocument();
    expect(screen.queryByText('Lesson 8')).not.toBeInTheDocument();
  });

  it('falls back to the through-lesson when no name is passed', () => {
    render(
      <StudentContextBar
        flashcardsQuery={flashcardsQueryWithCount(3)}
        exampleFilter={exampleFilterWithLesson(8)}
      />,
    );

    expect(screen.getByText('Lesson 8')).toBeInTheDocument();
  });

  it('keeps the name line when name and lesson are both missing', () => {
    const { container } = render(
      <StudentContextBar
        flashcardsQuery={flashcardsQueryWithCount(3)}
        exampleFilter={exampleFilterWithLesson(null)}
      />,
    );

    const nameLine = container.querySelector('p');
    expect(nameLine).not.toBeNull();
    expect(nameLine?.textContent).toBe('\u00A0');
  });
});
