import { useMemo, useState } from 'react';
import FilterOwnedFlashcardsContext from '../contexts/FilterOwnedFlashcardsContext';

interface FilterOwnedFlashcardsContextType {
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
}

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
