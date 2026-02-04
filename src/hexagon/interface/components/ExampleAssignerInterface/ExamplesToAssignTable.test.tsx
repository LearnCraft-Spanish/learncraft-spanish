import type { LessonPopup } from '@application/units/useLessonPopup';
import { ExamplesToAssignTable } from '@interface/components/ExampleAssignerInterface/ExamplesToAssignTable';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { vi } from 'vitest';

const mockLessonPopup: LessonPopup = {
  lessonsByVocabulary: [],
  lessonsLoading: false,
};
// Mock SimpleExampleTable
vi.mock('@interface/components/Tables/SimpleExampleTable', () => ({
  default: ({ examples }: { examples: unknown[] }) => (
    <div data-testid="simple-example-table">
      {examples.length} examples in table
    </div>
  ),
}));

describe('examplesToAssignTable', () => {
  it('should render heading with example count', () => {
    const examples = createMockExampleWithVocabularyList(5);

    render(
      <ExamplesToAssignTable
        examples={examples}
        lessonPopup={mockLessonPopup}
        isLoading={false}
        totalSelectedExamplesCount={examples.length}
      />,
    );

    expect(
      screen.getByText('Examples to be Assigned (5 remaining of 5 selected)'),
    ).toBeInTheDocument();
  });

  it('should render SimpleExampleTable with examples', () => {
    const examples = createMockExampleWithVocabularyList(3);

    render(
      <ExamplesToAssignTable
        examples={examples}
        lessonPopup={mockLessonPopup}
        isLoading={false}
        totalSelectedExamplesCount={examples.length}
      />,
    );

    expect(screen.getByTestId('simple-example-table')).toBeInTheDocument();
    expect(screen.getByText('3 examples in table')).toBeInTheDocument();
  });

  it('should handle empty examples list', () => {
    render(
      <ExamplesToAssignTable
        examples={[]}
        lessonPopup={mockLessonPopup}
        isLoading={false}
        totalSelectedExamplesCount={0}
      />,
    );

    expect(
      screen.getByText('Examples to be Assigned (0 remaining of 0 selected)'),
    ).toBeInTheDocument();
  });
});
