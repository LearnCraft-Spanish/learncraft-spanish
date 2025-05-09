import type { Subcategory } from '@LearnCraft-Spanish/shared';
import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createDependentHookMock } from '@testing/utils/mockFactory';
import { vi } from 'vitest';

/**
 * VerbData represents the data needed to create a verb.
 * This is part of the UseVerbCreationResult and matches the actual implementation.
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
 * This should exactly match the interface in the actual implementation.
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

// Create default mock data
const createDefaultResult = (): UseVerbCreationResult => {
  const defaultSubcategories = createMockSubcategoryList(3);
  const verbSubcategories = defaultSubcategories.filter(
    (s) => s.partOfSpeech === PartOfSpeech.Verb,
  );

  return {
    verbSubcategories,
    loadingSubcategories: false,
    selectedSubcategoryId:
      verbSubcategories.length > 0 ? String(verbSubcategories[0].id) : '1',
    setSelectedSubcategoryId: vi.fn<(id: string) => void>(),
    creating: false,
    creationError: null,
    createVerb: vi
      .fn<(verbData: VerbData) => Promise<boolean>>()
      .mockResolvedValue(true),
  };
};

// Create the mock using the factory
export const {
  mock: mockUseVerbCreation,
  override: overrideMockUseVerbCreation,
  setup: mockVerbCreation,
  getDefaultResult: defaultResult,
} = createDependentHookMock<UseVerbCreationResult>(
  '@application/useCases/useVerbCreation',
  'useVerbCreation',
  createDefaultResult,
);

// Export default for global mocking
export default mockUseVerbCreation;
