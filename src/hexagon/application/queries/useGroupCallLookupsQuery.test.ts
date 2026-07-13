import { overrideMockGroupCallsAdapter } from '@application/adapters/groupCallsAdapter.mock';
import { useGroupCallLookupsQuery } from '@application/queries/useGroupCallLookupsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { groupCallsFactory } from '@testing/factories/groupCallsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useGroupCallLookupsQuery', () => {
  it('should return group call lookups on success', async () => {
    const mockData = groupCallsFactory();
    overrideMockGroupCallsAdapter({
      getGroupCallLookups: async () => mockData,
    });

    const { result } = renderHook(() => useGroupCallLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.groupSessionTypes).toEqual(
      mockData.groupSessionTypes,
    );
    expect(result.current.groupSessionTopics).toEqual(
      mockData.groupSessionTopics,
    );
    expect(result.current.error).toBeNull();
  });

  it('should return empty arrays when lookups are empty', async () => {
    overrideMockGroupCallsAdapter({
      getGroupCallLookups: async () => ({
        groupSessionTypes: [],
        groupSessionTopics: [],
      }),
    });

    const { result } = renderHook(() => useGroupCallLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.groupSessionTypes).toEqual([]);
    expect(result.current.groupSessionTopics).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should expose error state when the adapter fails', async () => {
    overrideMockGroupCallsAdapter({
      getGroupCallLookups: async () => {
        throw new Error('Failed to fetch group call lookups');
      },
    });

    const { result } = renderHook(() => useGroupCallLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.groupSessionTypes).toBeUndefined();
    expect(result.current.groupSessionTopics).toBeUndefined();
  });
});
