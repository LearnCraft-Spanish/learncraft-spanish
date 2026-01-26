import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { ExampleTable } from '@interface/components/Tables';
import { useMemo } from 'react';

interface AssignedQuizExamplesTableProps {
  examples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
  targetName: string;
  studentFlashcards: UseStudentFlashcardsReturn;
  lessonPopup: LessonPopup;
}

export function AssignedQuizExamplesTable({
  examples,
  isLoading,
  error,
  targetName,
  studentFlashcards,
  lessonPopup,
}: AssignedQuizExamplesTableProps) {
  const paginationState = useMemo<QueryPaginationState>(() => {
    const maxPage = examples ? Math.ceil(examples.length / 50) : 1;
    return {
      page: 1,
      queryPage: 1,
      pageSize: 50,
      pagesPerQuery: 1,
      pageWithinQueryBatch: 0,
      maxPageNumber: maxPage,
      maxPageName: maxPage === 0 ? 'many' : maxPage.toString(),
      nextPage: () => {},
      previousPage: () => {},
      resetPagination: () => {},
    };
  }, [examples?.length]);

  // Show loading state even when no examples yet (to provide real-time feedback)
  if (isLoading && !examples) {
    return (
      <>
        <h4>Examples Already Assigned to {targetName}</h4>
        <div>Loading assigned examples...</div>
      </>
    );
  }

  // Don't show table if no examples and not loading
  if (!examples || examples.length === 0) {
    return null;
  }

  return (
    <>
      <h4>
        Examples Already Assigned to {targetName} ({examples.length})
      </h4>
      {error && (
        <div className="error">
          Error loading assigned examples: {error.message}
        </div>
      )}
      {isLoading ? (
        <div>Loading assigned examples...</div>
      ) : (
        <ExampleTable
          examples={examples}
          totalCount={examples.length}
          studentFlashcards={studentFlashcards}
          paginationState={paginationState}
          filteredExamplesLoading={false}
          firstPageLoading={false}
          newPageLoading={false}
          lessonPopup={lessonPopup}
        />
      )}
    </>
  );
}
