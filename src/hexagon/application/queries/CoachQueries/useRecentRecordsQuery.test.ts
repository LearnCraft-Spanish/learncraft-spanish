import { overrideMockCoachAdapter } from '@application/adapters/coachAdapter.mock';
import { useRecentRecordsQuery } from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockRecentRecords } from '@testing/factories/coachFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useRecentRecordsQuery', () => {
  it('should fetch recent records for a coach and month', async () => {
    const mockData = createMockRecentRecords();
    overrideMockCoachAdapter({
      getRecentRecords: async () => mockData,
    });

    const { result } = renderHook(
      () => useRecentRecordsQuery('42', '2024-03'),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recentRecords).toEqual(mockData);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachAdapter({
      getRecentRecords: async () => {
        throw new Error('Failed to fetch recent records');
      },
    });

    const { result } = renderHook(
      () => useRecentRecordsQuery('42', '2024-03'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(
      'Failed to fetch recent records',
    );
    expect(result.current.recentRecords).toBeUndefined();
  });

  it('should return empty collections when there are no records', async () => {
    const emptyRecords = {
      privateCalls: [],
      groupCalls: [],
      assignments: [],
    };
    overrideMockCoachAdapter({
      getRecentRecords: async () => emptyRecords,
    });

    const { result } = renderHook(() => useRecentRecordsQuery('7', '2025-01'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.recentRecords).toEqual(emptyRecords);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when coachId is undefined', async () => {
    const { result } = renderHook(
      () => useRecentRecordsQuery(undefined, '2024-03'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.recentRecords).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should not fetch when monthYear is empty', async () => {
    const { result } = renderHook(() => useRecentRecordsQuery('42', ''), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.recentRecords).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  it('should fetch different data for different coachId and monthYear', async () => {
    const marchData = createMockRecentRecords();
    const aprilData = createMockRecentRecords();
    overrideMockCoachAdapter({
      getRecentRecords: async (coachId, monthYear) => {
        if (coachId === '1' && monthYear === '2024-03') return marchData;
        if (coachId === '1' && monthYear === '2024-04') return aprilData;
        return { privateCalls: [], groupCalls: [], assignments: [] };
      },
    });

    const { result: marchResult } = renderHook(
      () => useRecentRecordsQuery('1', '2024-03'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(marchResult.current.isLoading).toBe(false));
    expect(marchResult.current.recentRecords).toEqual(marchData);

    const { result: aprilResult } = renderHook(
      () => useRecentRecordsQuery('1', '2024-04'),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(aprilResult.current.isLoading).toBe(false));
    expect(aprilResult.current.recentRecords).toEqual(aprilData);
  });
});
