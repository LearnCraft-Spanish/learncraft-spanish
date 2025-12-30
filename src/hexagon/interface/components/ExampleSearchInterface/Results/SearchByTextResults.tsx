import { useSearchByTextResults } from '@application/units/ExampleSearchInterface/Results/useSearchByTextResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByTextResultsProps {
  spanishString: string;
  englishString: string;
  vocabularyComplete?: boolean;
}

export function SearchByTextResults({
  spanishString,
  englishString,
  vocabularyComplete,
}: SearchByTextResultsProps) {
  const { examples, isLoading, error, paginationState } =
    useSearchByTextResults({
      spanishString,
      englishString,
      vocabularyComplete,
    });

  return (
    <BaseResultsComponent
      isLoading={isLoading}
      error={error}
      examples={examples}
      pagination={{
        page: paginationState.page,
        maxPage: paginationState.maxPageNumber,
        nextPage: paginationState.nextPage,
        previousPage: paginationState.previousPage,
      }}
    />
  );
}
