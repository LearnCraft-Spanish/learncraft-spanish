import {
  mockQuizAdapter,
  overrideMockQuizAdapter,
  resetMockQuizAdapter,
} from '@application/adapters/quizAdapter.mock';
import { useSearchByQuizResults } from '@application/units/ExampleSearchInterface/Results/useSearchByQuizResults';

import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleWithVocabularyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@application/adapters/quizAdapter', () => ({
  useQuizAdapter: vi.fn(() => ({
    getQuizExamples: mockQuizAdapter.getQuizExamples,
  })),
}));

describe('useSearchByQuizResults', () => {
  beforeEach(() => {
    resetMockQuizAdapter();
  });

  it('should return paginated quiz examples correctly', async () => {
    const mockExamples = createMockExampleWithVocabularyList(30);
    overrideMockQuizAdapter({
      getQuizExamples: async (_args) => mockExamples,
    });

    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          quizId: 1,
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
    overrideMockQuizAdapter({
      getQuizExamples: async (_args) => [],
    });

    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          quizId: 1,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle quiz fetch errors correctly', async () => {
    const testError = new Error('Failed to fetch quiz examples');
    overrideMockQuizAdapter({
      getQuizExamples: async (_args) => {
        throw testError;
      },
    });

    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          quizId: 1,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch quiz examples');
    expect(result.current.examples).toBeUndefined();
  });

  it('should not fetch when quizId is undefined', () => {
    const { result } = renderHook(
      () =>
        useSearchByQuizResults({
          quizId: undefined,
        }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.examples).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should pass vocabularyComplete parameter to adapter', async () => {
    const mockExamples = createMockExampleWithVocabularyList(10);
    const getQuizExamplesSpy = vi.fn(async () => mockExamples);

    overrideMockQuizAdapter({
      getQuizExamples: getQuizExamplesSpy,
    });

    renderHook(
      () =>
        useSearchByQuizResults({
          quizId: 1,
          vocabularyComplete: true,
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(getQuizExamplesSpy).toHaveBeenCalled());
    expect(getQuizExamplesSpy).toHaveBeenCalledWith({
      quizId: 1,
      vocabularyComplete: true,
    });
  });
});
