import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useStudentBundleCreditsQuery } from '@application/queries/CoachingStudentQueries/useStudentBundleCreditsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockBundleCreditList } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useStudentBundleCreditsQuery', () => {
  it('should fetch bundle credits for a valid student ID', async () => {
    const mockData = createMockBundleCreditList(2);
    overrideMockCoachingStudentsAdapter({
      getStudentBundleCredits: async () => mockData,
    });

    const { result } = renderHook(() => useStudentBundleCreditsQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.studentBundleCreditsQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.studentBundleCreditsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentBundleCreditsQuery.isSuccess).toBe(true);
    expect(result.current.studentBundleCreditsQuery.data).toEqual(mockData);
  });

  it('should return empty array when student has no bundle credits', async () => {
    overrideMockCoachingStudentsAdapter({
      getStudentBundleCredits: async () => [],
    });

    const { result } = renderHook(() => useStudentBundleCreditsQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentBundleCreditsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentBundleCreditsQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachingStudentsAdapter({
      getStudentBundleCredits: async () => {
        throw new Error('Failed to fetch bundle credits');
      },
    });

    const { result } = renderHook(() => useStudentBundleCreditsQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentBundleCreditsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentBundleCreditsQuery.isError).toBe(true);
    expect(result.current.studentBundleCreditsQuery.data).toBeUndefined();
  });

  it('should not fetch when srStudentId is 0', async () => {
    const { result } = renderHook(() => useStudentBundleCreditsQuery(0), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentBundleCreditsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentBundleCreditsQuery.status).toBe('pending');
    expect(result.current.studentBundleCreditsQuery.data).toBeUndefined();
  });

  it('should not fetch when srStudentId is negative', async () => {
    const { result } = renderHook(() => useStudentBundleCreditsQuery(-1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentBundleCreditsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentBundleCreditsQuery.status).toBe('pending');
    expect(result.current.studentBundleCreditsQuery.data).toBeUndefined();
  });
});
