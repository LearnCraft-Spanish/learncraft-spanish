import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import useLessonPopup from '@application/units/useLessonPopup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { ExampleTable } from '@interface/components/Tables';
import { useMemo } from 'react';

interface AssignedExamplesTableProps {
  examples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
  targetName: string;
}

export function AssignedExamplesTable({
  examples,
  isLoading,
  error,
  targetName,
}: AssignedExamplesTableProps) {
  const studentFlashcards = useStudentFlashcards();
  const { lessonPopup } = useLessonPopup();

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
