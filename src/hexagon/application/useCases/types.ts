import type {
  CreateNonVerbVocabulary,
  CreateVerbVocabulary,
  Subcategory,
  Vocabulary,
} from '@learncraft-spanish/shared';
import type { TableHook } from '../units/pasteTable/types';

/**
 * UseVerbCreationResult represents the return type of the useVerbCreation hook.
 */
export interface UseVerbCreationResult {
  // Subcategory selection
  verbSubcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: number;
  setSelectedSubcategoryId: (id: number) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Creation methods
  createVerbVocabulary: (verbData: CreateVerbVocabulary[]) => Promise<number[]>;
}

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

export interface UseNonVerbCreationResult {
  // Subcategory selection
  nonVerbSubcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Table hook API - exposed through the façade
  tableHook: TableHook<CreateNonVerbVocabulary>;

  // Unified save action that handles validation, table save, and creation
  saveVocabulary: () => Promise<number[]>;

  // Vocabulary list for currently selected subcategory
  currentVocabularyPagination: VocabularyPaginationState | null;
}
