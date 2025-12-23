import { useSearchByQuizResults } from '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults';
import { SearchByQuizResults } from '@interface/components/ExampleSearchInterface/Results/SearchByQuizResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults',
  () => ({
    useSearchByQuizResults: vi.fn(() => ({
      examples: createMockExampleWithVocabularyList(3),
      isLoading: false,
      error: null,
      paginationState: {
        pageNumber: 1,
        maxPageNumber: 100,
        nextPage: vi.fn(),
        previousPage: vi.fn(),
      },
    })),
  }),
);

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: vi.fn(() => ({
    addSelectedExample: vi.fn(),
    removeSelectedExample: vi.fn(),
    selectedExampleIds: [],
  })),
}));

describe('component: SearchByQuizResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<SearchByQuizResults courseCode="spanish-1" quizNumber={1} />);
    expect(screen.getAllByText('Select')[0]).toHaveTextContent('Select');
  });

  it('uses useSearchByQuizResults hook and passes props', () => {
    const courseCode = 'spanish-2';
    const quizNumber = 7;

    render(
      <SearchByQuizResults courseCode={courseCode} quizNumber={quizNumber} />,
    );

    expect(useSearchByQuizResults).toHaveBeenCalledWith({
      courseCode,
      quizNumber,
    });
  });
});
