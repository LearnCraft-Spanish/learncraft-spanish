import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import { mockUseStudentFlashcards } from '@application/units/useStudentFlashcards.mock';
import { AssignedQuizExamplesTable } from '@interface/components/ExampleAssignerInterface/AssignedQuizExamplesTable';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { vi } from 'vitest';

// Mock ExampleTable
vi.mock('@interface/components/Tables', () => ({
  ExampleTable: ({ examples }: { examples: unknown[] }) => (
    <div data-testid="example-table">{examples.length} examples in table</div>
  ),
}));

describe('assignedQuizExamplesTable', () => {
  const mockStudentFlashcards: UseStudentFlashcardsReturn =
    mockUseStudentFlashcards;
  const mockLessonPopup: LessonPopup = {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  };

  it('should render heading with example count', () => {
    const examples = createMockExampleWithVocabularyList(4);

    render(
      <AssignedQuizExamplesTable
        examples={examples}
        isLoading={false}
        error={null}
        targetName="Quiz 1"
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Examples Already Assigned to Quiz 1 (4)'),
    ).toBeInTheDocument();
  });

  it('should render ExampleTable with examples', () => {
    const examples = createMockExampleWithVocabularyList(2);

    render(
      <AssignedQuizExamplesTable
        examples={examples}
        isLoading={false}
        error={null}
        targetName="Quiz 1"
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(screen.getByTestId('example-table')).toBeInTheDocument();
    expect(screen.getByText('2 examples in table')).toBeInTheDocument();
  });

  it('should show loading state when loading and no examples', () => {
    render(
      <AssignedQuizExamplesTable
        examples={undefined}
        isLoading
        error={null}
        targetName="Quiz 1"
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Examples Already Assigned to Quiz 1'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Loading assigned examples...'),
    ).toBeInTheDocument();
  });

  it('should return null when no examples and not loading', () => {
    const { container } = render(
      <AssignedQuizExamplesTable
        examples={undefined}
        isLoading={false}
        error={null}
        targetName="Quiz 1"
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should display error message when error exists', () => {
    const examples = createMockExampleWithVocabularyList(1);
    const error = new Error('Failed to load examples');

    render(
      <AssignedQuizExamplesTable
        examples={examples}
        isLoading={false}
        error={error}
        targetName="Quiz 1"
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText(
        'Error loading assigned examples: Failed to load examples',
      ),
    ).toBeInTheDocument();
  });

  it('should show loading message when isLoading is true and examples exist', () => {
    const examples = createMockExampleWithVocabularyList(2);

    render(
      <AssignedQuizExamplesTable
        examples={examples}
        isLoading
        error={null}
        targetName="Quiz 1"
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Loading assigned examples...'),
    ).toBeInTheDocument();
  });
});
