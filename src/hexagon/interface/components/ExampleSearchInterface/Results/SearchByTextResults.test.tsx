import { useSearchByTextResults } from '@application/units/ExampleSearchInterface/Results/useSearchByTextResults';
import { SearchByTextResults } from '@interface/components/ExampleSearchInterface/Results/SearchByTextResults';
import { render, screen } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@application/units/ExampleSearchInterface/Results/useSearchByTextResults',
  () => ({
    useSearchByTextResults: vi.fn(() => ({
      examples: createMockExampleWithVocabularyList(3),
      isLoading: false,
      error: null,
      paginationState: {
        page: 1,
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

describe('component: SearchByTextResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<SearchByTextResults spanishString="hola" englishString="hello" />);
    expect(screen.getByText('Search Results')).toBeInTheDocument();
  });

  it('uses useSearchByTextResults hook and passes props', () => {
    const spanishString = '¿Cómo estás?';
    const englishString = 'How are you?';

    render(
      <SearchByTextResults
        spanishString={spanishString}
        englishString={englishString}
      />,
    );

    expect(useSearchByTextResults).toHaveBeenCalledWith({
      spanishString,
      englishString,
    });
  });
});
