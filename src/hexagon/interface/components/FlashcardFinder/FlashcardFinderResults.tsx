import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { useMemo } from 'react';
import ExampleTable from '../Tables/ExampleTable';

export default function FlashcardFinderResults({
  filteredFlashcards,
  totalCount,
  pageSize,
  fetchingExamples,
}: {
  filteredFlashcards: ExampleWithVocabulary[];
  totalCount: number;
  pageSize: number;
  fetchingExamples: boolean;
}) {
  const displayOrder = useMemo(() => {
    return filteredFlashcards.map((flashcard) => ({
      recordId: flashcard.id,
    }));
  }, [filteredFlashcards]);
  return (
    <ExampleTable
      dataSource={filteredFlashcards}
      displayOrder={displayOrder}
      totalCount={totalCount}
      pageSize={pageSize}
      fetchingExamples={fetchingExamples}
    />
  );
}
