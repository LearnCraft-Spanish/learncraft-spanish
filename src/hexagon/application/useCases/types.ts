import type { Vocabulary } from '@learncraft-spanish/shared';

// Define pagination state for current vocabulary view
export interface VocabularyPaginationState {
  vocabularyItems: Vocabulary[];
  isLoading: boolean;
  isCountLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  totalCount: number | null;
  totalPages: number | null;
  hasMorePages: boolean;
  currentPage: number;
  pageSize: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
}
