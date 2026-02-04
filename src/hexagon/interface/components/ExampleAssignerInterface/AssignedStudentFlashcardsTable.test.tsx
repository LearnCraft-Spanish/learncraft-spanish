import type { LessonPopup } from '@application/units/useLessonPopup';
import { AssignedStudentFlashcardsTable } from '@interface/components/ExampleAssignerInterface/AssignedStudentFlashcardsTable';
import { render, screen } from '@testing-library/react';
import { createMockFlashcardList } from '@testing/factories/flashcardFactory';
import { vi } from 'vitest';

// Mock SimpleExampleTable
vi.mock('@interface/components/Tables/SimpleExampleTable', () => ({
  default: ({ examples }: { examples: unknown[] }) => (
    <div data-testid="simple-example-table">
      {examples.length} examples in table
    </div>
  ),
}));

describe('assignedStudentFlashcardsTable', () => {
  const mockLessonPopup: LessonPopup = {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  };

  it('should render heading with flashcard count', () => {
    const flashcards = createMockFlashcardList()(5);

    render(
      <AssignedStudentFlashcardsTable
        studentFlashcards={flashcards}
        isLoading={false}
        error={null}
        targetName="Test Student"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Examples Already Assigned to Test Student (5)'),
    ).toBeInTheDocument();
  });

  it('should render SimpleExampleTable with examples', () => {
    const flashcards = createMockFlashcardList()(3);

    render(
      <AssignedStudentFlashcardsTable
        studentFlashcards={flashcards}
        isLoading={false}
        error={null}
        targetName="Test Student"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(screen.getByTestId('simple-example-table')).toBeInTheDocument();
    expect(screen.getByText('3 examples in table')).toBeInTheDocument();
  });

  it('should show loading state when loading and no flashcards', () => {
    render(
      <AssignedStudentFlashcardsTable
        studentFlashcards={[]}
        isLoading
        error={null}
        targetName="Test Student"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Loading assigned flashcards...'),
    ).toBeInTheDocument();
  });

  it('should return null when no flashcards and not loading', () => {
    const { container } = render(
      <AssignedStudentFlashcardsTable
        studentFlashcards={[]}
        isLoading={false}
        error={null}
        targetName="Test Student"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display error message when error exists', () => {
    const flashcards = createMockFlashcardList()(2);
    const error = new Error('Failed to load flashcards');

    render(
      <AssignedStudentFlashcardsTable
        studentFlashcards={flashcards}
        isLoading={false}
        error={error}
        targetName="Test Student"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText(
        'Error loading assigned flashcards: Failed to load flashcards',
      ),
    ).toBeInTheDocument();
  });
});
