import type usePagination from '@application/units/Pagination/usePagination';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { Flashcard } from '@learncraft-spanish/shared';

export interface UseFlashcardManagerReturnType {
  exampleFilter: UseExampleFilterReturnType;
  filteredFlashcards: Flashcard[];
  paginationState: ReturnType<typeof usePagination>;
  pageSize: number;

  filtersEnabled: boolean;
  toggleFilters: () => void;
}
