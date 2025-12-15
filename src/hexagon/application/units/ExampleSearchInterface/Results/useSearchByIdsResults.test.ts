import {
  mockExampleAdapter,
  overrideMockExampleAdapter,
  resetMockExampleAdapter,
} from '@application/adapters/exampleAdapter.mock';
import { useSearchByIdsResults } from '@application/units/ExampleSearchInterface/Results/useSearchByIdsResults';

import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the hooks - define implementations inline to avoid hoisting issues
vi.mock('@application/adapters/exampleAdapter', () => ({
  useExampleAdapter: vi.fn(() => ({
    getExamplesByIds: mockExampleAdapter.getExamplesByIds,
  })),
}));

describe('useSearchByIdsResults', () => {
  beforeEach(() => {
    resetMockExampleAdapter();
  });

  it('should return paginated examples by ids correctly', async () => {
    const mockExamples = createMockExampleWithVocabularyList(30);
    const ids = [1, 2, 3];

    overrideMockExampleAdapter({
      ...mockExampleAdapter,
      getExamplesByIds: async (_ids) => mockExamples,
    });

    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toHaveLength(25);
    expect(result.current.examples?.[0].id).toBe(mockExamples[0].id);
    expect(result.current.error).toBeNull();
  });

  it('should handle empty results correctly', async () => {
    const ids: number[] = [];

    overrideMockExampleAdapter({
      ...mockExampleAdapter,
      getExamplesByIds: async (_ids) => [],
    });

    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle adapter fetch errors correctly', async () => {
    const testError = new Error('Failed to fetch examples by ids');
    const ids = [1, 2, 3];

    overrideMockExampleAdapter({
      ...mockExampleAdapter,
      getExamplesByIds: async (_ids) => {
        throw testError;
      },
    });

    const { result } = renderHook(
      () =>
        useSearchByIdsResults({
          ids,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Failed to fetch examples by ids',
    );
    expect(result.current.examples).toBeUndefined();
  });
});
