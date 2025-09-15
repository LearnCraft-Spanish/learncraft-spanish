import type { FilterOwnedFlashcardsContextType } from '@application/coordinators/contexts/FilterOwnedFlashcardsContext';
import FilterOwnedFlashcardsContext from '@application/coordinators/contexts/FilterOwnedFlashcardsContext';
import { useMemo, useState } from 'react';

export default function FilterOwnedFlashcardsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filterOwnedFlashcards, setFilterOwnedFlashcards] = useState(false);

  const value: FilterOwnedFlashcardsContextType = useMemo(
    () => ({
      filterOwnedFlashcards,
      setFilterOwnedFlashcards,
    }),
    [filterOwnedFlashcards, setFilterOwnedFlashcards],
  );

  return (
    <FilterOwnedFlashcardsContext value={value}>
      {children}
    </FilterOwnedFlashcardsContext>
  );
}
