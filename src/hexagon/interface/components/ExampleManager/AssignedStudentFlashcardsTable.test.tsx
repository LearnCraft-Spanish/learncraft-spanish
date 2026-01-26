import { AssignedStudentFlashcardsTable } from '@interface/components/ExampleManager/AssignedStudentFlashcardsTable';
import {
  createMockFlashcard,
  createMockFlashcardList,
} from '@testing/factories/flashcardFactory';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock FlashcardTable
vi.mock('@interface/components/Tables', () => ({
  FlashcardTable: ({
    displayFlashcards,
  }: {
    displayFlashcards: unknown[];
  }) => (
    <div data-testid="flashcard-table">
      {displayFlashcards.length} flashcards in table
    </div>
  ),
}));

describe('AssignedStudentFlashcardsTable', () => {
  const mockPaginationState = {
    totalItems: 5,
    pageNumber: 1,
    maxPageNumber: 1,
    startIndex: 0,
    endIndex: 5,
    pageSize: 50,
    isOnFirstPage: true,
    isOnLastPage: true,
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    goToFirstPage: vi.fn(),
  };

  it('should render heading with flashcard count', () => {
    const flashcards = createMockFlashcardList()(5);

    render(
      <AssignedStudentFlashcardsTable
        allFlashcards={flashcards}
        displayFlashcards={flashcards}
        paginationState={mockPaginationState}
        isLoading={false}
        error={null}
        targetName="Test Student"
        onGoingToQuiz={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Examples Already Assigned to Test Student (5)'),
    ).toBeInTheDocument();
  });

  it('should render FlashcardTable with flashcards', () => {
    const flashcards = createMockFlashcardList()(3);

    render(
      <AssignedStudentFlashcardsTable
        allFlashcards={flashcards}
        displayFlashcards={flashcards}
        paginationState={mockPaginationState}
        isLoading={false}
        error={null}
        targetName="Test Student"
        onGoingToQuiz={vi.fn()}
      />,
    );

    expect(screen.getByTestId('flashcard-table')).toBeInTheDocument();
    expect(screen.getByText('3 flashcards in table')).toBeInTheDocument();
  });

  it('should show loading state when loading and no flashcards', () => {
    render(
      <AssignedStudentFlashcardsTable
        allFlashcards={[]}
        displayFlashcards={[]}
        paginationState={mockPaginationState}
        isLoading={true}
        error={null}
        targetName="Test Student"
        onGoingToQuiz={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Examples Already Assigned to Test Student'),
    ).toBeInTheDocument();
    expect(screen.getByText('Loading assigned flashcards...')).toBeInTheDocument();
  });

  it('should return null when no flashcards and not loading', () => {
    const { container } = render(
      <AssignedStudentFlashcardsTable
        allFlashcards={[]}
        displayFlashcards={[]}
        paginationState={mockPaginationState}
        isLoading={false}
        error={null}
        targetName="Test Student"
        onGoingToQuiz={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display error message when error exists', () => {
    const flashcards = createMockFlashcardList()(2);
    const error = new Error('Failed to load flashcards');

    render(
      <AssignedStudentFlashcardsTable
        allFlashcards={flashcards}
        displayFlashcards={flashcards}
        paginationState={mockPaginationState}
        isLoading={false}
        error={error}
        targetName="Test Student"
        onGoingToQuiz={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Error loading assigned flashcards: Failed to load flashcards'),
    ).toBeInTheDocument();
  });
});
