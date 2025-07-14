import type { ExampleWithVocabulary } from '@LearnCraft-Spanish/shared';
import { useMemo } from 'react';
import FlashcardFinderExampleListItem from '../ExampleListItem/FlashcardFinderExampleListItem';
import ExampleTable from '../ExampleTable/ExampleTable';
import { getExampleListItemProps } from './helpers';

export default function FlashcardFinderResults({
  filteredFlashcards,
  totalCount,
  pageSize,
}: {
  filteredFlashcards: ExampleWithVocabulary[];
  totalCount: number;
  pageSize: number;
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
      ExampleListItemComponent={FlashcardFinderExampleListItem}
      ExampleListItemProps={getExampleListItemProps}
      totalCount={totalCount}
      pageSize={pageSize}
    />
  );
}
