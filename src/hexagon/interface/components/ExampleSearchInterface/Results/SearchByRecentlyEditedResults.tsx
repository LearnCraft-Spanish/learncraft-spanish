import { useSearchByRecentlyEditedPaginated } from '@application/units/ExampleSearchInterface/Results/useSearchByRecentlyEditedPaginated';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByRecentlyEditedResultsProps {
  vocabularyComplete?: boolean;
}

export function SearchByRecentlyEditedResults({
  vocabularyComplete,
}: SearchByRecentlyEditedResultsProps) {
  const { examples, isLoading, error, paginationState } =
    useSearchByRecentlyEditedPaginated({ vocabularyComplete });

  return (
    <BaseResultsComponent
      bulkOption="selectAll"
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
