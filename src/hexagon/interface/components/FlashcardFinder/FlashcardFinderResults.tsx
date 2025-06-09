import type { ExampleRecord } from '@LearnCraft-Spanish/shared';
import { useMemo } from 'react';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';

export default function FlashcardFinderResults({
  filteredFlashcards,
}: {
  filteredFlashcards: ExampleRecord[];
}) {
  const displayOrder = useMemo(() => {
    return filteredFlashcards.map((flashcard) => ({
      recordId: flashcard.recordId,
    }));
  }, [filteredFlashcards]);
  return (
    <ExamplesTable
      dataSource={filteredFlashcards}
      displayOrder={displayOrder}
    />
  );
}
