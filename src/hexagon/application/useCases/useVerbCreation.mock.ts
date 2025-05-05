import type { Subcategory } from '@LearnCraft-Spanish/shared';
import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { createMockSubcategoryList } from '@testing/factories/subcategoryFactories';
import { createTypedMock } from '@testing/utils/typedMock';
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
const defaultSubcategories = createMockSubcategoryList(3);

// Filter for verb subcategories
const verbSubcategories = defaultSubcategories.filter(
  (s) => s.partOfSpeech === PartOfSpeech.Verb,
);

// Default mock result with happy-path data
const defaultResult: UseVerbCreationResult = {
  verbSubcategories,
  loadingSubcategories: false,
  selectedSubcategoryId:
    verbSubcategories.length > 0 ? String(verbSubcategories[0].id) : '1',
  setSelectedSubcategoryId: createTypedMock<(id: string) => void>(),
  creating: false,
  creationError: null,
  createVerb:
    createTypedMock<
      (verbData: VerbData) => Promise<boolean>
    >().mockResolvedValue(true),
};

/**
 * Main mock for useVerbCreation hook. Use this in your vi.mock setup.
 * Always returns the current default or overridden result.
 */
export const mockUseVerbCreation =
  createTypedMock<() => UseVerbCreationResult>().mockReturnValue(defaultResult);

/**
 * Override the default mock result for useVerbCreation.
 * Note: If you override a nested object, you must provide the full object.
 */
export const overrideMockUseVerbCreation = (
  config: Partial<UseVerbCreationResult> = {},
) => {
  const result = { ...defaultResult, ...config };
  mockUseVerbCreation.mockReturnValue(result);
  return result;
};

/**
 * Helper to call the mock during tests (for vi.mock setup).
 */
export const callMockUseVerbCreation = () => mockUseVerbCreation();

/**
 * Configure mock for tests with optional override
 */
export function mockVerbCreation(
  config: { useCase?: Partial<UseVerbCreationResult> } = {},
): UseVerbCreationResult {
  // Apply overrides if specified
  const mockResult = config.useCase
    ? overrideMockUseVerbCreation(config.useCase)
    : defaultResult;

  // Set hook implementation to use the mock result
  mockUseVerbCreation.mockImplementation(() => mockResult);

  // Ensure the vi.mock directive is properly set up
  vi.mock('@application/useCases/useVerbCreation', () => ({
    useVerbCreation: mockUseVerbCreation,
  }));

  return mockResult;
}

export default mockUseVerbCreation;

// Export the default result for defensive test setup
export { defaultResult };
