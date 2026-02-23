import type { LessonPopup } from '@application/units/useLessonPopup';
import { AssignedQuizExamplesTable } from '@interface/components/ExampleAssignerInterface/AssignedQuizExamplesTable';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { vi } from 'vitest';

// Mock SimpleExampleTable
vi.mock('@interface/components/Tables/SimpleExampleTable', () => ({
  default: ({ examples }: { examples: unknown[] }) => (
    <div data-testid="simple-example-table">
      {examples.length} examples in table
    </div>
  ),
}));

describe('assignedQuizExamplesTable', () => {
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
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(
      screen.getByText('Examples Already Assigned to Quiz 1 (4)'),
    ).toBeInTheDocument();
  });

  it('should render SimpleExampleTable with examples', () => {
    const examples = createMockExampleWithVocabularyList(2);

    render(
      <AssignedQuizExamplesTable
        examples={examples}
        isLoading={false}
        error={null}
        targetName="Quiz 1"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(screen.getByTestId('simple-example-table')).toBeInTheDocument();
    expect(screen.getByText('2 examples in table')).toBeInTheDocument();
  });

  it('should show loading state when loading and no examples', () => {
    render(
      <AssignedQuizExamplesTable
        examples={undefined}
        isLoading
        error={null}
        targetName="Quiz 1"
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(screen.getByText('Loading quiz examples...')).toBeInTheDocument();
  });

  it('should return null when no examples and not loading', () => {
    const { container } = render(
      <AssignedQuizExamplesTable
        examples={undefined}
        isLoading={false}
        error={null}
        targetName="Quiz 1"
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
        lessonPopup={mockLessonPopup}
      />,
    );

    expect(screen.getByText('Loading quiz examples...')).toBeInTheDocument();
  });
});
