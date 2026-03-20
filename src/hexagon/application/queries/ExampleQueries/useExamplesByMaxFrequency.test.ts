import type { SpanglishFilter } from '@application/types/exampleSearch';
import { overrideMockExampleAdapter } from '@application/adapters/exampleAdapter.mock';
import { useExamplesByMaxFrequency } from '@application/queries/ExampleQueries/useExamplesByMaxFrequency';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockExampleMaxFrequencyList } from '@testing/factories/exampleFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { beforeEach, describe, expect, it } from 'vitest';

describe('useExamplesByMaxFrequency', () => {
  beforeEach(() => {
    overrideMockExampleAdapter({
      searchExamplesByMaxFrequency: async () =>
        createMockExampleMaxFrequencyList(2),
    });
  });

  it('should fetch examples by max frequency correctly', async () => {
    const mockData = createMockExampleMaxFrequencyList(2);
    let receivedParams:
      | {
          highestFirst?: boolean;
          vocabularyComplete?: boolean;
          spanglish?: SpanglishFilter;
        }
      | undefined;
    overrideMockExampleAdapter({
      searchExamplesByMaxFrequency: async (params) => {
        receivedParams = params;
        return mockData;
      },
    });

    const { result } = renderHook(
      () =>
        useExamplesByMaxFrequency({
          highestFirst: true,
          vocabularyComplete: undefined,
        }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.examples).toEqual(mockData);
    expect(result.current.error).toBeNull();
    expect(receivedParams).toEqual({
      highestFirst: true,
      vocabularyComplete: undefined,
      spanglish: 'all',
    });
  });

  it('should forward spanglish when provided', async () => {
    const mockData = createMockExampleMaxFrequencyList(2);

    let receivedParams:
      | {
          highestFirst?: boolean;
          vocabularyComplete?: boolean;
          spanglish?: SpanglishFilter;
        }
      | undefined;

    overrideMockExampleAdapter({
      searchExamplesByMaxFrequency: async (params) => {
        receivedParams = params;
        return mockData;
      },
    });

    const { result } = renderHook(
      () =>
        useExamplesByMaxFrequency({
          highestFirst: false,
          vocabularyComplete: undefined,
          spanglish: 'only-spanglish',
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.examples).toEqual(mockData);
    expect(receivedParams).toEqual({
      highestFirst: false,
      vocabularyComplete: undefined,
      spanglish: 'only-spanglish',
    });
  });
});
