import { useSearchByRecentlyEditedPaginated } from '@application/units/ExampleSearchInterface/Results/useSearchByRecentlyEditedPaginated';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export function SearchByRecentlyEditedResults() {
  const { examples, isLoading, error, paginationState } =
    useSearchByRecentlyEditedPaginated();

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
