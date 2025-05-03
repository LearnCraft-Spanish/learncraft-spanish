import type { CreateNonVerbVocabulary } from '@LearnCraft-Spanish/shared';
import type { TableHook } from '../units/pasteTable/types';
import type { UseNonVerbCreationResult } from './useNonVerbCreation';
import { VOCABULARY_COLUMNS } from '@application/implementations/vocabularyTable/constants';
import {
  mockUsePasteTable,
  overrideMockUsePasteTable,
} from '@application/units/pasteTable/usePasteTable.mock';
import {
  mockUseSubcategories,
  overrideMockUseSubcategories,
} from '@application/units/useSubcategories.mock';
import {
  mockUseVocabulary,
  overrideMockUseVocabulary,
} from '@application/units/useVocabulary.mock';
import { PartOfSpeech } from '@LearnCraft-Spanish/shared';
import { createTypedMock } from '@testing/utils/typedMock';
import { vi } from 'vitest';

/**
 * Creates a default mock result by leveraging unit mocks.
 * This ensures our mock behavior mirrors the real implementation by
 * depending on the same units.
 */
const createDefaultMockResult = (): UseNonVerbCreationResult => {
  // Get default values from the unit mocks
  const subcategoriesResult = mockUseSubcategories();
  const nonVerbSubcategories = subcategoriesResult.subcategories.filter(
    (subcategory) => subcategory.partOfSpeech !== PartOfSpeech.Verb,
  );

  // Use the real table hook implementation
  const tableHook = mockUsePasteTable({
    columns: VOCABULARY_COLUMNS,
    validateRow: () => ({}),
  }) as TableHook<CreateNonVerbVocabulary>;

  // Use real vocabulary pagination from useVocabulary
  const vocabularyResult = mockUseVocabulary();

  return {
    // Data from unit mocks
    nonVerbSubcategories,
    loadingSubcategories: subcategoriesResult.loading,
    tableHook,
    currentVocabularyPagination: {
      vocabularyItems: vocabularyResult.vocabulary,
      isLoading: vocabularyResult.loading,
      isCountLoading: false,
      isFetching: false,
      error: vocabularyResult.error,
      totalCount: vocabularyResult.vocabulary.length * 3, // Simulate pagination
      totalPages: 3,
      hasMorePages: true,
      currentPage: 1,
      pageSize: vocabularyResult.vocabulary.length,
      goToNextPage: createTypedMock<() => void>().mockImplementation(() => {
        /* Mock implementation */
      }),
      goToPreviousPage: createTypedMock<() => void>().mockImplementation(() => {
        /* Mock implementation */
      }),
    },

    // Derived values
    selectedSubcategoryId: nonVerbSubcategories[0]?.id?.toString() || '1',

    // Status flags
    creating: false,
    creationError: null,

    // Operations
    setSelectedSubcategoryId: createTypedMock<
      (id: string) => void
    >().mockImplementation((_id: string) => {
      /* Mock implementation */
    }),
    saveVocabulary: createTypedMock<
      () => Promise<boolean>
    >().mockImplementation(async () => Promise.resolve(true)),
  };
};

/**
 * The main mock for the useNonVerbCreation hook.
 * This is what gets mocked in place of the real implementation.
 */
export const mockUseNonVerbCreation = createTypedMock<
  () => UseNonVerbCreationResult
>().mockImplementation(() => createDefaultMockResult());

/**
 * Override function to customize the mock for specific tests.
 * @param config Partial override of the UseNonVerbCreationResult
 * @returns The customized mock result
 */
export const overrideUseNonVerbCreation = (
  config: Partial<UseNonVerbCreationResult> = {},
): UseNonVerbCreationResult => {
  const result = {
    ...createDefaultMockResult(),
    ...config,
  };
  mockUseNonVerbCreation.mockImplementation(() => result);
  return result;
};

/**
 * Helper to call the mock during tests.
 * This simplifies accessing the mock in tests.
 */
export const callUseNonVerbCreation = (): UseNonVerbCreationResult =>
  mockUseNonVerbCreation();

/**
 * Configuration type for mockNonVerbCreation function
 */
export interface NonVerbCreationMockConfig {
  /** Override properties of the useCase itself */
  useCase?: Partial<UseNonVerbCreationResult>;
  /** Override properties of the vocabulary unit */
  vocabulary?: Parameters<typeof overrideMockUseVocabulary>[0];
  /** Override properties of the subcategories unit */
  subcategories?: Parameters<typeof overrideMockUseSubcategories>[0];
  /** Override properties of the pasteTable unit */
  pasteTable?: Parameters<typeof overrideMockUsePasteTable>[0];
}

/**
 * Sets up useNonVerbCreation and all its dependencies for testing.
 * This is the main entry point for tests.
 *
 * @example
 * // Basic setup
 * mockNonVerbCreation();
 *
 * // With custom configurations for the use case
 * mockNonVerbCreation({
 *   useCase: { creating: true }
 * });
 *
 * // With custom configurations for dependencies
 * mockNonVerbCreation({
 *   vocabulary: { loading: true },
 *   subcategories: { subcategories: [] }
 * });
 *
 * // With both useCase and dependency overrides
 * mockNonVerbCreation({
 *   useCase: { creating: true },
 *   vocabulary: { loading: true },
 *   subcategories: { subcategories: [] }
 * });
 */
export function mockNonVerbCreation(
  config: NonVerbCreationMockConfig = {},
): UseNonVerbCreationResult {
  // 1. Setup dependencies first
  if (config.vocabulary) {
    vi.mock('@application/units/useVocabulary', () => ({
      useVocabulary: () => overrideMockUseVocabulary(config.vocabulary),
    }));
  } else {
    vi.mock('@application/units/useVocabulary', () => ({
      useVocabulary: mockUseVocabulary,
    }));
  }

  if (config.subcategories) {
    vi.mock('@application/units/useSubcategories', () => ({
      useSubcategories: () =>
        overrideMockUseSubcategories(config.subcategories),
    }));
  } else {
    vi.mock('@application/units/useSubcategories', () => ({
      useSubcategories: mockUseSubcategories,
    }));
  }

  if (config.pasteTable) {
    vi.mock('@application/units/pasteTable/usePasteTable', () => ({
      usePasteTable: () => overrideMockUsePasteTable(config.pasteTable),
    }));
  } else {
    vi.mock('@application/units/pasteTable/usePasteTable', () => ({
      usePasteTable: mockUsePasteTable,
    }));
  }

  // 2. Create a new default mock that uses the configured dependencies
  if (!config.useCase) {
    // Refresh the default mock to use the current state of dependencies
    mockUseNonVerbCreation.mockImplementation(() => createDefaultMockResult());
  }

  // 3. Override the useCase itself if needed
  const mockResult = config.useCase
    ? overrideUseNonVerbCreation(config.useCase)
    : callUseNonVerbCreation();

  // 4. Setup the useCase mock
  vi.mock('@application/useCases/useNonVerbCreation', () => ({
    useNonVerbCreation: () => mockResult,
  }));

  // 5. Return the result for assertions
  return mockResult;
}

// For backward compatibility with existing tests
export const setupNonVerbCreationMocks = mockNonVerbCreation;

// Export default for global mocking
export default mockUseNonVerbCreation;
