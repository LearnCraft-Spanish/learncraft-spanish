import type { Subcategory } from '@LearnCraft-Spanish/shared';
import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { createTypedMock } from '@testing/utils/typedMock';
import { vi } from 'vitest';
import {
  mockUseSubcategories,
  overrideMockUseSubcategories,
} from '../units/useSubcategories.mock';
import {
  mockUseVocabulary,
  overrideMockUseVocabulary,
} from '../units/useVocabulary.mock';

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

/**
 * Creates a default mock result by leveraging unit mocks.
 * This ensures our mock behavior mirrors the real implementation by
 * depending on the same units.
 */
const createDefaultMockResult = (): UseVerbCreationResult => {
  // Use the subcategories unit mock
  const subcategoriesResult = mockUseSubcategories();
  // We could use vocabulary result here if needed in the future
  // const vocabularyResult = mockUseVocabulary();

  // Filter to only verb subcategories
  const verbSubcategories = subcategoriesResult.subcategories.filter(
    (subcategory) => subcategory.partOfSpeech === PartOfSpeech.Verb,
  );

  // Create the mock result using unit mock values
  return {
    // Data from unit mocks
    verbSubcategories,
    loadingSubcategories: subcategoriesResult.loading,

    // Derived values
    selectedSubcategoryId: verbSubcategories[0]?.id?.toString() || '1',

    // Status flags
    creating: false,
    creationError: null,

    // Operations
    setSelectedSubcategoryId: createTypedMock<
      (id: string) => void
    >().mockImplementation((_id: string) => {
      /* Mock implementation */
    }),
    createVerb: createTypedMock<
      (verbData: VerbData) => Promise<boolean>
    >().mockImplementation(async (_verbData: VerbData) => {
      return Promise.resolve(true);
    }),
  };
};

/**
 * The main mock for the useVerbCreation hook.
 * This is what gets mocked in place of the real implementation.
 */
export const mockUseVerbCreation = createTypedMock<
  () => UseVerbCreationResult
>().mockImplementation(() => createDefaultMockResult());

/**
 * Override function to customize the mock for specific tests.
 * @param config Partial override of the UseVerbCreationResult
 * @returns The customized mock result
 */
export const overrideUseVerbCreation = (
  config: Partial<UseVerbCreationResult> = {},
): UseVerbCreationResult => {
  const result = {
    ...createDefaultMockResult(),
    ...config,
  };
  mockUseVerbCreation.mockImplementation(() => result);
  return result;
};

/**
 * Helper to call the mock during tests.
 * This simplifies accessing the mock in tests.
 */
export const callUseVerbCreation = (): UseVerbCreationResult =>
  mockUseVerbCreation();

/**
 * Configuration type for mockVerbCreation function
 */
export interface VerbCreationMockConfig {
  /** Override properties of the useCase itself */
  useCase?: Partial<UseVerbCreationResult>;
  /** Override properties of the vocabulary unit */
  vocabulary?: Parameters<typeof overrideMockUseVocabulary>[0];
  /** Override properties of the subcategories unit */
  subcategories?: Parameters<typeof overrideMockUseSubcategories>[0];
}

/**
 * Sets up the useVerbCreation hook and all its dependencies for testing.
 * This is the main entry point for tests.
 *
 * @example
 * // Basic setup
 * mockVerbCreation();
 *
 * // With custom configurations for the use case
 * mockVerbCreation({
 *   useCase: { creating: true }
 * });
 *
 * // With custom configurations for dependencies
 * mockVerbCreation({
 *   subcategories: { loading: true }
 * });
 *
 * // With both useCase and dependency overrides
 * mockVerbCreation({
 *   useCase: { creating: true },
 *   subcategories: { loading: true },
 *   vocabulary: { error: new Error('Failed to load') }
 * });
 */
export function mockVerbCreation(
  config: VerbCreationMockConfig = {},
): UseVerbCreationResult {
  // 1. Setup dependencies first
  if (config.vocabulary) {
    vi.mock('@application/units/useVocabulary', () => ({
      // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
      useVocabulary: () => overrideMockUseVocabulary(config.vocabulary),
    }));
  } else {
    vi.mock('@application/units/useVocabulary', () => ({
      useVocabulary: mockUseVocabulary,
    }));
  }

  if (config.subcategories) {
    vi.mock('@application/units/useSubcategories', () => ({
      // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
      useSubcategories: () =>
        overrideMockUseSubcategories(config.subcategories),
    }));
  } else {
    vi.mock('@application/units/useSubcategories', () => ({
      useSubcategories: mockUseSubcategories,
    }));
  }

  // 2. Create a new default mock that uses the configured dependencies
  if (!config.useCase) {
    // Refresh the default mock to use the current state of dependencies
    mockUseVerbCreation.mockImplementation(() => createDefaultMockResult());
  }

  // 3. Override the useCase itself if needed
  const mockResult = config.useCase
    ? overrideUseVerbCreation(config.useCase)
    : callUseVerbCreation();

  // 4. Setup the useCase mock
  vi.mock('@application/useCases/useVerbCreation', () => ({
    // eslint-disable-next-line react-hooks-extra/no-unnecessary-use-prefix
    useVerbCreation: () => mockResult,
  }));

  // 5. Return the result for assertions
  return mockResult;
}

// For backward compatibility with existing tests
export const setupVerbCreationMocks = mockVerbCreation;

// Export default for global mocking
export default mockUseVerbCreation;
