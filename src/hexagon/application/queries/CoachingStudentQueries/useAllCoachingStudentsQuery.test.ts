import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useAllCoachingStudentsQuery } from '@application/queries/CoachingStudentQueries/useAllCoachingStudentsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockCoachingStudentList } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAllCoachingStudentsQuery', () => {
  it('should fetch all coaching students successfully', async () => {
    const mockData = createMockCoachingStudentList(3);
    overrideMockCoachingStudentsAdapter({
      getAllCoachingStudents: async () => mockData,
    });

    const { result } = renderHook(() => useAllCoachingStudentsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.allCoachingStudentsQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.allCoachingStudentsQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachingStudentsQuery.isSuccess).toBe(true);
    expect(result.current.allCoachingStudentsQuery.data).toEqual(mockData);
  });

  it('should return empty array when no coaching students exist', async () => {
    overrideMockCoachingStudentsAdapter({
      getAllCoachingStudents: async () => [],
    });

    const { result } = renderHook(() => useAllCoachingStudentsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allCoachingStudentsQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachingStudentsQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachingStudentsAdapter({
      getAllCoachingStudents: async () => {
        throw new Error('Failed to fetch coaching students');
      },
    });

    const { result } = renderHook(() => useAllCoachingStudentsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allCoachingStudentsQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachingStudentsQuery.isError).toBe(true);
    expect(result.current.allCoachingStudentsQuery.data).toBeUndefined();
  });

  it('should not fetch when user is not a coach or admin', async () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });

    const { result } = renderHook(() => useAllCoachingStudentsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.allCoachingStudentsQuery.isLoading).toBe(false),
    );
    expect(result.current.allCoachingStudentsQuery.status).toBe('pending');
    expect(result.current.allCoachingStudentsQuery.data).toBeUndefined();
  });
});
