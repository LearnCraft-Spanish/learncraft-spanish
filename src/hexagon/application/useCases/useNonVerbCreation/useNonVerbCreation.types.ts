import type { TableHook } from '@application/units/pasteTable/types';
import type {
  CreateNonVerbVocabulary,
  Subcategory,
} from '@learncraft-spanish/shared';
import type { VocabularyPaginationState } from '../types';

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
