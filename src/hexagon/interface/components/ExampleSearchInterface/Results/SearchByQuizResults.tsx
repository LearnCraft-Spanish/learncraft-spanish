import { useSearchByQuizResults } from '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults';
import { BaseResultsComponent } from '@interface/components/ExampleSearchInterface/Results/BaseResultsComponent';

export interface SearchByQuizResultsProps {
  courseCode: string;
  quizNumber: number | undefined;
}
export function SearchByQuizResults({
  courseCode,
  quizNumber,
}: SearchByQuizResultsProps) {
  const { examples, isLoading, error, paginationState } =
    useSearchByQuizResults({
      courseCode,
      quizNumber,
    });

  return (
    <BaseResultsComponent
      title="Search Results"
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
