import {
  mockOfficialQuizAdapter,
  overrideMockOfficialQuizAdapter,
  resetMockOfficialQuizAdapter,
} from '@application/adapters/officialQuizAdapter.mock';
import { useSearchByQuizResults } from '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults';

import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the hooks - define implementations inline to avoid hoisting issues
vi.mock('@application/adapters/officialQuizAdapter', () => ({
  useOfficialQuizAdapter: vi.fn(() => ({
    getOfficialQuizExamples: mockOfficialQuizAdapter.getOfficialQuizExamples,
  })),
}));

describe('useSearchByQuizResults', () => {
  beforeEach(() => {
    resetMockOfficialQuizAdapter();
  });

  it('should return paginated quiz examples correctly', async () => {
    const mockExamples = createMockExampleWithVocabularyList(30);
    overrideMockOfficialQuizAdapter({
      getOfficialQuizExamples: async (_args) => mockExamples,
    });

    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          courseCode: 'SPANISH_101',
          quizNumber: 1,
        }),
      { wrapper: TestQueryClientProvider },
    );

    // Initial state should show loading
    expect(result.current.isLoading).toBe(true);

    // After data loads
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(mockExamples.slice(0, 25));
    expect(result.current.error).toBeNull();
  });

  it('should handle empty quiz results correctly', async () => {
    overrideMockOfficialQuizAdapter({
      getOfficialQuizExamples: async (_args) => [],
    });

    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          courseCode: 'SPANISH_101',
          quizNumber: 1,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle quiz fetch errors correctly', async () => {
    const testError = new Error('Failed to fetch quiz examples');
    overrideMockOfficialQuizAdapter({
      getOfficialQuizRecords: async () => [],
      getOfficialQuizExamples: async (_args) => {
        throw testError;
      },
    });

    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          courseCode: 'SPANISH_101',
          quizNumber: 1,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch quiz examples');
    expect(result.current.examples).toBeUndefined();
  });

  it('should not fetch when quizNumber is undefined', () => {
    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          courseCode: 'SPANISH_101',
          quizNumber: undefined,
        }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.examples).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});
