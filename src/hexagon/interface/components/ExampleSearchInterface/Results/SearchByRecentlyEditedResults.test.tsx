import { useExamplesByRecentlyModified } from '@application/queries/ExampleQueries/useExamplesByRecentlyModified';
import { SearchByRecentlyEditedResults } from '@interface/components/ExampleSearchInterface/Results/SearchByRecentlyEditedResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/queries/ExampleQueries/useExamplesByRecentlyModified',
  () => ({
    useExamplesByRecentlyModified: vi.fn(() => ({
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

describe('searchByRecentlyEditedResults', () => {
  it('should render', () => {
    render(<SearchByRecentlyEditedResults />);
    expect(screen.getByText('Search Results')).toBeInTheDocument();
  });

  it('uses useExamplesByRecentlyModified hook', () => {
    render(<SearchByRecentlyEditedResults />);
    expect(useExamplesByRecentlyModified).toHaveBeenCalled();
  });
});
