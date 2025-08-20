import { use } from 'react';
import FilterOwnedFlashcardsContext from '../contexts/FilterOwnedFlashcardsContext';

export default function useFilterOwnedFlashcards() {
  const context = use(FilterOwnedFlashcardsContext);
  if (!context) {
    throw new Error(
      'useFilterOwnedFlashcards must be used within a FilterOwnedFlashcardsProvider',
    );
  }
  return context;
}
