import { overrideMockCoachingStudentsAdapter } from '@application/adapters/coachingStudentsAdapter.mock';
import { useStudentMembershipsQuery } from '@application/queries/CoachingStudentQueries/useStudentMembershipsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockStudentMembershipList } from '@testing/factories/coachingStudentFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useStudentMembershipsQuery', () => {
  it('should fetch memberships for a valid student ID', async () => {
    const mockData = createMockStudentMembershipList(2);
    overrideMockCoachingStudentsAdapter({
      getStudentMemberships: async () => mockData,
    });

    const { result } = renderHook(() => useStudentMembershipsQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.studentMembershipsQuery.isLoading).toBe(true);

    await waitFor(() =>
      expect(result.current.studentMembershipsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentMembershipsQuery.isSuccess).toBe(true);
    expect(result.current.studentMembershipsQuery.data).toEqual(mockData);
  });

  it('should return empty array when student has no memberships', async () => {
    overrideMockCoachingStudentsAdapter({
      getStudentMemberships: async () => [],
    });

    const { result } = renderHook(() => useStudentMembershipsQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentMembershipsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentMembershipsQuery.data).toEqual([]);
  });

  it('should expose error state when the fetch fails', async () => {
    overrideMockCoachingStudentsAdapter({
      getStudentMemberships: async () => {
        throw new Error('Failed to fetch memberships');
      },
    });

    const { result } = renderHook(() => useStudentMembershipsQuery(1), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentMembershipsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentMembershipsQuery.isError).toBe(true);
    expect(result.current.studentMembershipsQuery.data).toBeUndefined();
  });

  it('should not fetch when srStudentId is 0', async () => {
    const { result } = renderHook(() => useStudentMembershipsQuery(0), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentMembershipsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentMembershipsQuery.status).toBe('pending');
    expect(result.current.studentMembershipsQuery.data).toBeUndefined();
  });

  it('should not fetch when srStudentId is negative', async () => {
    const { result } = renderHook(() => useStudentMembershipsQuery(-5), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() =>
      expect(result.current.studentMembershipsQuery.isLoading).toBe(false),
    );
    expect(result.current.studentMembershipsQuery.status).toBe('pending');
    expect(result.current.studentMembershipsQuery.data).toBeUndefined();
  });
});
