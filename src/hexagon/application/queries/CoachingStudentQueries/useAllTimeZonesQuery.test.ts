import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useAllTimeZonesQuery } from '@application/queries/CoachingStudentQueries/useAllTimeZonesQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockTimeZoneList } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAllTimeZonesQuery', () => {
  it('should fetch all time zones successfully', async () => {
    const mockData = createMockTimeZoneList(3);
    overrideMockCoachingStudentsAdapter({
      getAllTimeZones: async () => mockData,
    });

    const { result } = renderHook(() => useAllTimeZonesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.allTimeZonesQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.allTimeZonesQuery.isLoading).toBe(false),
    );
    expect(result.current.allTimeZonesQuery.isSuccess).toBe(true);
    expect(result.current.allTimeZonesQuery.data).toEqual(mockData);
  });

  it('should return empty array when no time zones exist', async () => {
    overrideMockCoachingStudentsAdapter({ getAllTimeZones: async () => [] });

    const { result } = renderHook(() => useAllTimeZonesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allTimeZonesQuery.isLoading).toBe(false),
    );
    expect(result.current.allTimeZonesQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachingStudentsAdapter({
      getAllTimeZones: async () => {
        throw new Error('Failed to fetch time zones');
      },
    });

    const { result } = renderHook(() => useAllTimeZonesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allTimeZonesQuery.isLoading).toBe(false),
    );
    expect(result.current.allTimeZonesQuery.isError).toBe(true);
    expect(result.current.allTimeZonesQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not a coach or admin', async () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });

    const { result } = renderHook(() => useAllTimeZonesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allTimeZonesQuery.isLoading).toBe(false),
    );
    expect(result.current.allTimeZonesQuery.status).toBe('pending');
    expect(result.current.allTimeZonesQuery.data).toBeUndefined();
  });
});
