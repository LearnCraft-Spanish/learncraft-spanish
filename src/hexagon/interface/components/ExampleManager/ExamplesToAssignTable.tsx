import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import useLessonPopup from '@application/units/useLessonPopup';
import { useStudentFlashcards } from '@application/units/useStudentFlashcards';
import { ExampleTable } from '@interface/components/Tables';
import { useMemo } from 'react';

interface ExamplesToAssignTableProps {
  examples: ExampleWithVocabulary[];
}

export function ExamplesToAssignTable({
  examples,
}: ExamplesToAssignTableProps) {
  const studentFlashcards = useStudentFlashcards();
  const { lessonPopup } = useLessonPopup();

  const paginationState = useMemo<QueryPaginationState>(
    () => ({
      page: 1,
      queryPage: 1,
      pageSize: 50,
      pagesPerQuery: 1,
      pageWithinQueryBatch: 0,
      maxPageNumber: Math.ceil(examples.length / 50),
      maxPageName:
        examples.length === 0
          ? 'many'
          : Math.ceil(examples.length / 50).toString(),
      nextPage: () => {},
      previousPage: () => {},
      resetPagination: () => {},
    }),
    [examples.length],
  );

  return (
    <>
      <h4>Examples to be Assigned ({examples.length} remaining)</h4>
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
    </>
  );
}
