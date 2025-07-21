import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';
import { useMemo } from 'react';
import ExampleTable from '../ExampleTable/ExampleTable';

export default function FlashcardFinderResults({
  filteredFlashcards,
  totalCount,
  pageSize,
}: {
  filteredFlashcards: ExampleWithVocabulary[];
  totalCount: number;
  pageSize: number;
}) {
  console.log('filteredFlashcards length', filteredFlashcards.length);
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
    />
  );
}
