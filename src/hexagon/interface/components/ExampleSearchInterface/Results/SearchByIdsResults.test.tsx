import { useSearchByIdsResults } from '@application/units/ExampleSearchInterface/Results/useSearchByIdsResults';
import { SearchByIdsResults } from '@interface/components/ExampleSearchInterface/Results/SearchByIdsResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/ExampleSearchInterface/Results/useSearchByIdsResults',
  () => ({
    useSearchByIdsResults: vi.fn(() => ({
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

describe('component: SearchByIdsResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<SearchByIdsResults ids={[1, 2, 3]} />);
    expect(screen.getAllByText('Select')[0]).toHaveTextContent('Select');
  });

  it('uses useSearchByIdsResults hook and passes props', () => {
    render(<SearchByIdsResults ids={[1, 2, 3]} />);

    expect(useSearchByIdsResults).toHaveBeenCalledWith({
      ids: [1, 2, 3],
    });
  });
});
