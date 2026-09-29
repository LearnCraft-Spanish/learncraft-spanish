import type { UseExampleQueryReturnType } from '@application/queries/ExampleQueries/useExampleQuery';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';
import { vi } from 'vitest';

const defaultExamples = createMockExampleWithVocabularyList(3);

const defaultReturn: UseExampleQueryReturnType = {
  isLoading: false,
  isDependenciesLoading: false,
  filteredExamples: defaultExamples,
  totalCount: defaultExamples.length,
  error: null,
  page: 1,
  pageSize: 150,
  changeQueryPage: vi.fn<(page: number) => void>(),
  setCanPrefetch: vi.fn<(canPrefetch: boolean) => void>(),
  updatePageSize: vi.fn<(newPageSize: number) => void>(),
};

export const {
  mock: mockUseExampleQuery,
  override: overrideMockUseExampleQuery,
  reset: resetMockUseExampleQuery,
} = createOverrideableMockHook<
  [pageSize: number, audioRequired?: boolean, disableCache?: boolean],
  UseExampleQueryReturnType
>(defaultReturn);

/** Reads the current mock return without recording another hook call. */
export function readMockUseExampleQuery(): UseExampleQueryReturnType {
  return mockUseExampleQuery.getMockImplementation()?.(150) ?? defaultReturn;
}

export default mockUseExampleQuery;
