import { useSearchByIdsResults } from '@application/units/ExampleSearchInterface/Results/useSearchByIdsResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByIdsResultsProps {
  ids: number[];
}

export function SearchByIdsResults({ ids }: SearchByIdsResultsProps) {
  const { examples, isLoading, error, paginationState } = useSearchByIdsResults(
    { ids },
  );

  return (
    <BaseResultsComponent
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
