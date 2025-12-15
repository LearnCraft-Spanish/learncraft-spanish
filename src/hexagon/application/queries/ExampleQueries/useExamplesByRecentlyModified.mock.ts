import type { ExampleWithVocabulary } from '@learncraft-spanish/shared';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

// Define the return type for the hook
interface UseExamplesByRecentlyModifiedReturn {
  examples: ExampleWithVocabulary[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Create default return value for the hook
const defaultReturn: UseExamplesByRecentlyModifiedReturn = {
  examples: createMockExampleWithVocabularyList(5),
  isLoading: false,
  error: null,
};

// Create an overrideable mock hook
export const {
  mock: mockUseExamplesByRecentlyModified,
  override: overrideMockUseExamplesByRecentlyModified,
  reset: resetMockUseExamplesByRecentlyModified,
} = createOverrideableMockHook<
  [page: number, limit: number],
  UseExamplesByRecentlyModifiedReturn
>(defaultReturn);

// Export the default mock implementation for global mocking
const defaultMockImplementation: (
  page: number,
  limit: number,
) => UseExamplesByRecentlyModifiedReturn = (_page, _limit) => defaultReturn;

export default defaultMockImplementation;
