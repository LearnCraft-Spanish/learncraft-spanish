import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockCourseAdapter } from '@application/adapters/courseAdapter.mock';
import { useAllCoursesQuery } from '@application/queries/useAllCoursesQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createRealisticCourseDetailedList } from '@testing/factories/courseFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAllCoursesQuery', () => {
  beforeEach(() => {
    overrideMockAuthAdapter({
      isAuthenticated: true,
      isAdmin: true,
    });
  });
  it('should fetch all courses successfully', async () => {
    const mockData = createRealisticCourseDetailedList();
    overrideMockCourseAdapter({
      getAllCourses: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useAllCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.data).toEqual(mockData);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCourseAdapter({
      getAllCourses: () => Promise.reject(new Error('Failed to fetch courses')),
    });

    const { result } = renderHook(() => useAllCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
  });
  // should not fetch courses if the user is not authenticated
  it('should not fetch courses if the user is not authenticated', async () => {
    overrideMockAuthAdapter({
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useAllCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('pending'); // pending because the query is not enabled
    expect(result.current.data).toBeUndefined();
  });
  // should not fetch courses if the user is not an admin
  it('should not fetch courses if the user is not an admin', async () => {
    overrideMockAuthAdapter({
      isAdmin: false,
    });

    const { result } = renderHook(() => useAllCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe('pending'); // pending because the query is not enabled
    expect(result.current.data).toBeUndefined();
  });
});
