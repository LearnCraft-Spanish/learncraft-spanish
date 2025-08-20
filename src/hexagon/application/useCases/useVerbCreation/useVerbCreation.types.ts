import type {
  CreateVerbVocabulary,
  Subcategory,
} from '@learncraft-spanish/shared';

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
