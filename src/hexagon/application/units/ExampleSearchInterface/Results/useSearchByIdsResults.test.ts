import {
  createExamplesWithIds,
  mockUseExampleByIdsQuery,
  overrideMockUseExampleByIdsQuery,
  resetMockUseExampleByIdsQuery,
} from '@application/queries/ExampleQueries/useExampleByIdsQuery.mock';
import { useSearchByIdsResults } from '@application/units/ExampleSearchInterface/Results/useSearchByIdsResults';
import { renderHook } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/queries/ExampleQueries/useExampleByIdsQuery', () => ({
  useExampleByIdsQuery: vi.fn((ids: number[]) => mockUseExampleByIdsQuery(ids)),
}));

describe('useSearchByIdsResults', () => {
  beforeEach(() => {
    resetMockUseExampleByIdsQuery();
  });

  it('should return paginated examples by ids correctly', () => {
    // Create 30 examples - should be paginated to show only 25
    const ids = Array.from({ length: 30 }, (_, i) => i + 1);

    // Mock returns examples with matching IDs by default
    overrideMockUseExampleByIdsQuery({
      examples: createExamplesWithIds(ids),
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    // Should show first page (25 items)
    expect(result.current.isLoading).toBe(false);
    expect(result.current.examples).toHaveLength(25);
    expect(result.current.examples?.[0].id).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty results correctly', () => {
    const ids: number[] = [];

    // Mock will return empty array for empty IDs by default
    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle query errors correctly', () => {
    const testError = new Error('Failed to fetch examples by ids');
    const ids = [1, 2, 3];

    overrideMockUseExampleByIdsQuery({
      examples: undefined,
      isLoading: false,
      error: testError,
    });

    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Failed to fetch examples by ids',
    );
    expect(result.current.examples).toBeUndefined();
  });

  it('should handle loading state correctly', () => {
    const ids = [1, 2, 3];

    overrideMockUseExampleByIdsQuery({
      examples: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.examples).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});
