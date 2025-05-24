import type { Subcategory } from '@LearnCraft-Spanish/shared';

/**
 * VerbData represents the data needed to create a verb.
 */
export interface VerbData {
  infinitive: string;
  translation: string;
  usage?: string;
  subcategoryId: string;
  isRegular?: boolean;
  notes?: string;
}

/**
 * UseVerbCreationResult represents the return type of the useVerbCreation hook.
 */
export interface UseVerbCreationResult {
  // Subcategory selection
  verbSubcategories: Subcategory[];
  loadingSubcategories: boolean;
  selectedSubcategoryId: string;
  setSelectedSubcategoryId: (id: string) => void;

  // Creation status
  creating: boolean;
  creationError: Error | null;

  // Creation methods
  createVerb: (verbData: VerbData) => Promise<boolean>;
}
