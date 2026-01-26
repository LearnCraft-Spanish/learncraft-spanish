import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import { ExamplesToAssignTable } from '@interface/components/ExampleManager/ExamplesToAssignTable';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import {
  mockUseStudentFlashcards,
} from '@application/units/useStudentFlashcards.mock';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock ExampleTable
vi.mock('@interface/components/Tables', () => ({
  ExampleTable: ({ examples }: { examples: unknown[] }) => (
    <div data-testid="example-table">
      {examples.length} examples in table
    </div>
  ),
}));

describe('ExamplesToAssignTable', () => {
  const mockStudentFlashcards: UseStudentFlashcardsReturn = mockUseStudentFlashcards;
  const mockLessonPopup: LessonPopup = {
    lessonsByVocabulary: [],
    lessonsLoading: false,
  };

  it('should render heading with example count', () => {
    const examples = createMockExampleWithVocabularyList(5);

    render(
      <ExamplesToAssignTable
        examples={examples}
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Examples to be Assigned (5 remaining)'),
    ).toBeInTheDocument();
  });

  it('should render ExampleTable with examples', () => {
    const examples = createMockExampleWithVocabularyList(3);

    render(
      <ExamplesToAssignTable
        examples={examples}
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(screen.getByTestId('example-table')).toBeInTheDocument();
    expect(screen.getByText('3 examples in table')).toBeInTheDocument();
  });

  it('should handle empty examples list', () => {
    render(
      <ExamplesToAssignTable
        examples={[]}
        studentFlashcards={mockStudentFlashcards}
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Examples to be Assigned (0 remaining)'),
    ).toBeInTheDocument();
  });
});
