import { overrideMockWeeksAdapter } from '@application/adapters/weeksAdapter.mock';
import { useMembershipWeeksQuery } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockFurnishedWeekList } from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useMembershipWeeksQuery', () => {
  it('should fetch weeks for a valid membership ID', async () => {
    const mockData = createMockFurnishedWeekList(3);
    overrideMockWeeksAdapter({
      getMembershipWeeks: async () => mockData,
    });

    const { result } = renderHook(() => useMembershipWeeksQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.membershipWeeksQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.membershipWeeksQuery.isLoading).toBe(false),
    );
    expect(result.current.membershipWeeksQuery.isSuccess).toBe(true);
    expect(result.current.membershipWeeksQuery.data).toEqual(mockData);
  });

  it('should return empty array when membership has no weeks', async () => {
    overrideMockWeeksAdapter({ getMembershipWeeks: async () => [] });

    const { result } = renderHook(() => useMembershipWeeksQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.membershipWeeksQuery.isLoading).toBe(false),
    );
    expect(result.current.membershipWeeksQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockWeeksAdapter({
      getMembershipWeeks: async () => {
        throw new Error('Failed to fetch membership weeks');
      },
    });

    const { result } = renderHook(() => useMembershipWeeksQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.membershipWeeksQuery.isLoading).toBe(false),
    );
    expect(result.current.membershipWeeksQuery.isError).toBe(true);
    expect(result.current.membershipWeeksQuery.data).toBeUndefined();
  });

  it('should not fetch when membershipId is 0', async () => {
    const { result } = renderHook(() => useMembershipWeeksQuery(0), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.membershipWeeksQuery.isLoading).toBe(false),
    );
    expect(result.current.membershipWeeksQuery.status).toBe('pending');
    expect(result.current.membershipWeeksQuery.data).toBeUndefined();
  });

  it('should not fetch when membershipId is negative', async () => {
    const { result } = renderHook(() => useMembershipWeeksQuery(-1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.membershipWeeksQuery.isLoading).toBe(false),
    );
    expect(result.current.membershipWeeksQuery.status).toBe('pending');
    expect(result.current.membershipWeeksQuery.data).toBeUndefined();
  });
});
