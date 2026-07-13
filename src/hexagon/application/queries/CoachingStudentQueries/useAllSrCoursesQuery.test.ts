import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useAllSrCoursesQuery } from '@application/queries/CoachingStudentQueries/useAllSrCoursesQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockSrCourseList } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAllSrCoursesQuery', () => {
  it('should fetch all SR courses successfully', async () => {
    const mockData = createMockSrCourseList(3);
    overrideMockCoachingStudentsAdapter({
      getAllSrCourses: async () => mockData,
    });

    const { result } = renderHook(() => useAllSrCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.srCourses).toEqual(
      [...mockData].sort((a, b) => a.name.localeCompare(b.name)),
    );
  });

  it('should return empty array when no SR courses exist', async () => {
    overrideMockCoachingStudentsAdapter({ getAllSrCourses: async () => [] });

    const { result } = renderHook(() => useAllSrCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.srCourses).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachingStudentsAdapter({
      getAllSrCourses: async () => {
        throw new Error('Failed to fetch SR courses');
      },
    });

    const { result } = renderHook(() => useAllSrCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
    expect(result.current.srCourses).toBeUndefined();
  });

  it('should not fetch when user is not a coach or admin', async () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });

    const { result } = renderHook(() => useAllSrCoursesQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.srCourses).toBeUndefined();
  });
});
