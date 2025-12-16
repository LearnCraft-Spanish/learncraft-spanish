import { useSearchByDatePagination } from '@application/units/ExampleSearchInterface/Results/useSearchByDatePagination';
import { SearchByDateResults } from '@interface/components/ExampleSearchInterface/Results/SearchByDateResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/ExampleSearchInterface/Results/useSearchByDatePagination',
  () => ({
    useSearchByDatePagination: vi.fn(() => ({
      examples: createMockExampleWithVocabularyList(1),
      isLoading: false,
      error: null,
      paginationState: { page: 1, maxPage: 100, nextPage: 2, previousPage: 0 },
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

describe('searchByDateResults', () => {
  it('should render', () => {
    render(<SearchByDateResults />);
    expect(screen.getByText('Search Results')).toBeInTheDocument();
  });

  it('uses useSearchByDatePagination hook', () => {
    render(<SearchByDateResults />);
    expect(useSearchByDatePagination).toHaveBeenCalled();
  });
});
