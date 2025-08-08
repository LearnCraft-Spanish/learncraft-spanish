import { createContext } from 'react';

interface FilterOwnedFlashcardsContextType {
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
}

const FilterOwnedFlashcardsContext =
  createContext<FilterOwnedFlashcardsContextType>({
    filterOwnedFlashcards: false,
    setFilterOwnedFlashcards: () => {},
  });

export default FilterOwnedFlashcardsContext;
