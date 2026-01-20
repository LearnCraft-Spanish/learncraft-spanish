import type { UseSearchExamplesQueryReturnType } from '@application/queries/ExampleQueries/useSearchExamplesQuery';
import type { ExampleTextSearch } from '@learncraft-spanish/shared';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

// Create default return value for the hook
const defaultReturn: UseSearchExamplesQueryReturnType = {
  examples: createMockExampleWithVocabularyList(5),
  totalCount: 5,
  isLoading: false,
  error: null,
};

// Create an overrideable mock hook
export const {
  mock: mockUseSearchExamplesQuery,
  override: overrideMockUseSearchExamplesQuery,
  reset: resetMockUseSearchExamplesQuery,
} = createOverrideableMockHook<
  [searchText: ExampleTextSearch, page?: number, pageSize?: number],
  UseSearchExamplesQueryReturnType
>(defaultReturn);

// Export the default mock implementation for global mocking
const defaultMockImplementation: (
  searchText: ExampleTextSearch,
  page?: number,
  pageSize?: number,
) => UseSearchExamplesQueryReturnType = (_searchText, _page, _pageSize) =>
  defaultReturn;

export default defaultMockImplementation;
