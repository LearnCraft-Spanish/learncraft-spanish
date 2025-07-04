import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';
import { useMemo } from 'react';
import ExamplesTable from 'src/components/ExamplesTable/ExamplesTable';

export default function FlashcardFinderResults({
  filteredFlashcards,
}: {
  filteredFlashcards: ExampleWithVocabulary[];
}) {
  return (
    // this should use the new ExampleListItem components, in some way. maybe remake a version of ExamplesTable to also take in the display function for ExampleListItem
    <ExamplesTable
      dataSource={filteredFlashcards}
      displayOrder={displayOrder}
    />
  );
}
