import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';
import { useMemo } from 'react';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';

export default function FlashcardFinderResults({
  filteredFlashcards,
}: {
  filteredFlashcards: ExampleWithVocabulary[];
}) {
  const displayOrder = useMemo(() => {
    return filteredFlashcards.map((flashcard) => ({
      recordId: flashcard.id,
    }));
  }, [filteredFlashcards]);
  return (
    <ExamplesTable
      dataSource={filteredFlashcards}
      displayOrder={displayOrder}
    />
  );
}
