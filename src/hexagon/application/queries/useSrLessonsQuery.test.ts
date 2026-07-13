import { overrideMockAuthAdapter } from '@application/adapters/authAdapter.mock';
import { overrideMockSrLessonsAdapter } from '@application/adapters/srLessonsAdapter.mock';
import { useSrLessonsQuery } from '@application/queries/useSrLessonsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useSrLessonsQuery', () => {
  it('should return sr lessons when user is a coach', async () => {
    const mockLessons = [
      { lessonId: 1, lessonName: 'Lesson 1' },
      { lessonId: 2, lessonName: 'Lesson 2' },
    ];
    overrideMockAuthAdapter({ isCoach: true, isAdmin: false });
    overrideMockSrLessonsAdapter({
      getSrLessons: async () => mockLessons as any,
    });

    const { result } = renderHook(() => useSrLessonsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockLessons);
    expect(result.current.error).toBeNull();
  });

  it('should return sr lessons when user is an admin', async () => {
    const mockLessons = [{ lessonId: 3, lessonName: 'Admin Lesson' }];
    overrideMockAuthAdapter({ isCoach: false, isAdmin: true });
    overrideMockSrLessonsAdapter({
      getSrLessons: async () => mockLessons as any,
    });

    const { result } = renderHook(() => useSrLessonsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual(mockLessons);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when user is neither coach nor admin', async () => {
    overrideMockAuthAdapter({ isCoach: false, isAdmin: false });

    const { result } = renderHook(() => useSrLessonsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should expose error state when the adapter fails', async () => {
    overrideMockAuthAdapter({ isCoach: true, isAdmin: false });
    overrideMockSrLessonsAdapter({
      getSrLessons: async () => {
        throw new Error('Failed to fetch sr lessons');
      },
    });

    const { result } = renderHook(() => useSrLessonsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeUndefined();
  });
});
