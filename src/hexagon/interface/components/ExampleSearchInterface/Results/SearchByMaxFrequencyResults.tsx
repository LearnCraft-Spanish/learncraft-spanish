import { useSearchByMaxFrequencyResults } from '@application/units/ExampleSearchInterface/Results/useSearchByMaxFrequencyResults';
import { MaxFrequencyResultsComponent } from '@interface/components/ExampleSearchInterface/Results/MaxFrequencyResultsComponent';

export interface SearchByMaxFrequencyResultsProps {
  highestFirst: boolean;
  spanglish: 'all' | 'only-spanglish' | 'no-spanglish';
  vocabularyComplete?: boolean;
}

export function SearchByMaxFrequencyResults({
  highestFirst,
  spanglish,
  vocabularyComplete,
}: SearchByMaxFrequencyResultsProps) {
  const { examples, isLoading, error, paginationState } =
    useSearchByMaxFrequencyResults({
      highestFirst,
      spanglish,
      vocabularyComplete,
    });

  return (
    <MaxFrequencyResultsComponent
      bulkOption="selectAll"
      isLoading={isLoading}
      error={error}
      examples={examples}
      pagination={{
        page: paginationState.pageNumber,
        maxPage: paginationState.maxPageNumber,
        nextPage: paginationState.nextPage,
        previousPage: paginationState.previousPage,
      }}
    />
  );
}
