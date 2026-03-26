import { useSearchByMaxFrequencyResults } from '@application/units/ExampleSearchInterface/Results/useSearchByMaxFrequencyResults';
import { SearchByMaxFrequencyResults } from '@interface/components/ExampleSearchInterface/Results/SearchByMaxFrequencyResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleMaxFrequencyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/ExampleSearchInterface/Results/useSearchByMaxFrequencyResults',
  () => ({
    useSearchByMaxFrequencyResults: vi.fn(() => ({
      examples: createMockExampleMaxFrequencyList(2),
      isLoading: false,
      error: null,
      paginationState: {
        pageNumber: 1,
        maxPageNumber: 2,
        nextPage: vi.fn(),
        previousPage: vi.fn(),
      },
    })),
  }),
);

vi.mock('@application/coordinators/hooks/useSelectedExamplesContext', () => ({
  useSelectedExamplesContext: vi.fn(() => ({
    updateSelectedExamples: vi.fn(),
    addSelectedExample: vi.fn(),
    removeSelectedExample: vi.fn(),
    clearSelectedExamples: vi.fn(),
    selectedExampleIds: [],
  })),
}));

describe('component: SearchByMaxFrequencyResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<SearchByMaxFrequencyResults highestFirst spanglish="all" />);
    expect(screen.getAllByText('Select')[0]).toHaveTextContent('Select');
  });

  it('uses useSearchByMaxFrequencyResults hook and passes props', () => {
    render(
      <SearchByMaxFrequencyResults
        highestFirst={false}
        spanglish="only-spanglish"
        vocabularyComplete
      />,
    );

    expect(useSearchByMaxFrequencyResults).toHaveBeenCalledWith({
      highestFirst: false,
      spanglish: 'only-spanglish',
      vocabularyComplete: true,
    });
  });
});
