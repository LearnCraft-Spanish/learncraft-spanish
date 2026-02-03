import type { QueryPaginationState } from '@application/units/Pagination/useQueryPagination';
import type { LessonPopup } from '@application/units/useLessonPopup';
import type { UseStudentFlashcardsReturn } from '@application/units/useStudentFlashcards';
import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { ExampleTable } from '@interface/components/Tables';
import { useMemo } from 'react';

interface ExamplesToAssignTableProps {
  examples: ExampleWithVocabulary[];
  studentFlashcards: UseStudentFlashcardsReturn;
  lessonPopup: LessonPopup;
}

export function ExamplesToAssignTable({
  examples,
  studentFlashcards,
  lessonPopup,
}: ExamplesToAssignTableProps) {
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
