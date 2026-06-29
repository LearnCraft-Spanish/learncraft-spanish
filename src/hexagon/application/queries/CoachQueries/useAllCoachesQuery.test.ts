import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockCoachAdapter } from '@application/adapters/coachAdapter.mock';
import { useAllCoachesQuery } from '@application/queries/CoachQueries/useAllCoachesQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachList } from '@testing/factories/coachFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAllCoachesQuery', () => {
  it('should fetch all coaches and sort them by name', async () => {
    const mockCoaches = [
      { coach_id: 1, fullName: 'Zara Smith', email: 'zara@example.com' },
      { coach_id: 2, fullName: 'Ana Garcia', email: 'ana@example.com' },
      { coach_id: 3, fullName: 'Mike Jones', email: 'mike@example.com' },
    ];
    overrideMockCoachAdapter({ getAllCoaches: async () => mockCoaches });

    const { result } = renderHook(() => useAllCoachesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.allCoachesQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.allCoachesQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachesQuery.isSuccess).toBe(true);
    expect(result.current.allCoachesQuery.data).toEqual([
      { coach_id: 2, fullName: 'Ana Garcia', email: 'ana@example.com' },
      { coach_id: 3, fullName: 'Mike Jones', email: 'mike@example.com' },
      { coach_id: 1, fullName: 'Zara Smith', email: 'zara@example.com' },
    ]);
  });

  it('should return an empty array when no coaches exist', async () => {
    overrideMockCoachAdapter({ getAllCoaches: async () => [] });

    const { result } = renderHook(() => useAllCoachesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allCoachesQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachesQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachAdapter({
      getAllCoaches: async () => {
        throw new Error('Failed to fetch coaches');
      },
    });

    const { result } = renderHook(() => useAllCoachesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allCoachesQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachesQuery.isError).toBe(true);
    expect(result.current.allCoachesQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not a coach or admin', async () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });
    overrideMockCoachAdapter({
      getAllCoaches: async () => createMockCoachList(3),
    });

    const { result } = renderHook(() => useAllCoachesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allCoachesQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachesQuery.status).toBe('pending');
    expect(result.current.allCoachesQuery.data).toBeUndefined();
  });
});
