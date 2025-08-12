import type usePagination from '@application/units/Pagination/usePagination';
import type { UseExampleFilterReturnType } from '@application/units/useExampleFilter';
import type { Flashcard } from '@learncraft-spanish/shared';
import type { LessonPopup } from '../units/useLessonPopup';

export interface UseFlashcardManagerReturnType {
  exampleFilter: UseExampleFilterReturnType;
  filteredFlashcards: Flashcard[];
  paginationState: ReturnType<typeof usePagination>;
  pageSize: number;
  filtersEnabled: boolean;
  toggleFilters: () => void;
  findMore: () => void;

  somethingIsLoading: boolean;
  initialLoading: boolean;
  lessonPopup: LessonPopup;
}
