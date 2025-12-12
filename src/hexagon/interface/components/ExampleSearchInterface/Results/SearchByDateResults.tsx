import { useSearchByDatePagination } from '@application/units/ExampleSearchInterface/Results/useSearchByDatePagination';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export function SearchByDateResults() {
  const { examples, isLoading, error, paginationState } =
    useSearchByDatePagination();

  return (
    <BaseResultsComponent
      title="Search Results"
      isLoading={isLoading}
      error={error}
      examples={examples}
      pagination={{
        page: paginationState.page,
        maxPage: paginationState.maxPageNumber || 100,
        nextPage: paginationState.nextPage,
        previousPage: paginationState.previousPage,
      }}
    />
  );
}
