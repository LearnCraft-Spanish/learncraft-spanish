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
    render(<SearchByQuizResults quizId={1} />);
    expect(screen.getAllByText('Select')[0]).toHaveTextContent('Select');
  });

  it('uses useSearchByQuizResults hook and passes props', () => {
    const quizId = 7;
    const vocabularyComplete = true;

    render(
      <SearchByQuizResults
        quizId={quizId}
        vocabularyComplete={vocabularyComplete}
      />,
    );

    expect(useSearchByQuizResults).toHaveBeenCalledWith({
      quizId,
      vocabularyComplete,
    });
  });

  it('should pass quizId without vocabularyComplete when not provided', () => {
    const quizId = 5;

    render(<SearchByQuizResults quizId={quizId} />);

    expect(useSearchByQuizResults).toHaveBeenCalledWith({
      quizId,
      vocabularyComplete: undefined,
    });
  });
});
