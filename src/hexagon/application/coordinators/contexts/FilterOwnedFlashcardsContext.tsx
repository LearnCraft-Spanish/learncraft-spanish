import { createContext } from 'react';

export interface FilterOwnedFlashcardsContextType {
  filterOwnedFlashcards: boolean;
  setFilterOwnedFlashcards: (filterOwnedFlashcards: boolean) => void;
}

const FilterOwnedFlashcardsContext =
  createContext<FilterOwnedFlashcardsContextType>({
    filterOwnedFlashcards: false,
    setFilterOwnedFlashcards: () => {},
  });

export default FilterOwnedFlashcardsContext;
