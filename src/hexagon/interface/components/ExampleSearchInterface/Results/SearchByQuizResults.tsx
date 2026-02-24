import { useSearchByQuizResults } from '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByQuizResultsProps {
  quizId: number | undefined;
  vocabularyComplete?: boolean;
}
export function SearchByQuizResults({
  quizId,
  vocabularyComplete,
}: SearchByQuizResultsProps) {
  const { examples, isLoading, error, paginationState } =
    useSearchByQuizResults({
      quizId,
      vocabularyComplete,
    });

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
