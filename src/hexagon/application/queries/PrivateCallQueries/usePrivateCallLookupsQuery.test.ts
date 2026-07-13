import { overrideMockPrivateCallsAdapter } from '@application/adapters/privateCallsAdapter.mock';
import { usePrivateCallLookupsQuery } from '@application/queries/PrivateCallQueries/usePrivateCallLookupsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { privateCallsFactory } from '@testing/factories/privateCallsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('usePrivateCallLookupsQuery', () => {
  it('should return private call lookups on success', async () => {
    const mockData = privateCallsFactory();
    overrideMockPrivateCallsAdapter({
      getPrivateCallLookups: async () => mockData,
    });

    const { result } = renderHook(() => usePrivateCallLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.callTypes).toEqual(mockData.callTypes);
    expect(result.current.callRatings).toEqual(mockData.callRatings);
    expect(result.current.error).toBeNull();
  });

  it('should return empty arrays when lookups are empty', async () => {
    overrideMockPrivateCallsAdapter({
      getPrivateCallLookups: async () => ({
        callTypes: [],
        callRatings: [],
      }),
    });

    const { result } = renderHook(() => usePrivateCallLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.callTypes).toEqual([]);
    expect(result.current.callRatings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should expose error state when the adapter fails', async () => {
    overrideMockPrivateCallsAdapter({
      getPrivateCallLookups: async () => {
        throw new Error('Failed to fetch private call lookups');
      },
    });

    const { result } = renderHook(() => usePrivateCallLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.callTypes).toBeUndefined();
    expect(result.current.callRatings).toBeUndefined();
  });
});
