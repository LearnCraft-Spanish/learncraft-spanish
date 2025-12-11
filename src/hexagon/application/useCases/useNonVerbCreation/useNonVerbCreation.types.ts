import type { VocabularyPaginationState } from '@application/useCases/types';
import type { CreateTableHook } from '@domain/PasteTable/CreateTable';
import type {
  CreateNonVerbVocabulary,
  Subcategory,
} from '@learncraft-spanish/shared';

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
  tableHook: CreateTableHook<CreateNonVerbVocabulary>;

  // Unified save action that handles validation, table save, and creation
  saveVocabulary: () => Promise<number[]>;

  // Vocabulary list for currently selected subcategory
  currentVocabularyPagination: VocabularyPaginationState | null;
}
