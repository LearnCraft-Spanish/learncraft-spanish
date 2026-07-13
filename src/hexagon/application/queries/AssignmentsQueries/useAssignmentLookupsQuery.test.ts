import { overrideMockAssignmentsAdapter } from '@application/adapters/assignmentAdapter.mock';
import { useAssignmentLookupsQuery } from '@application/queries/AssignmentsQueries/useAssignmentLookupsQuery';
import { renderHook, waitFor } from '@testing-library/react';
import { assignmentsFactory } from '@testing/factories/assignmentsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useAssignmentLookupsQuery', () => {
  it('should return assignment lookups on success', async () => {
    const mockData = assignmentsFactory();
    overrideMockAssignmentsAdapter({
      getAssignmentLookups: async () => mockData,
    });

    const { result } = renderHook(() => useAssignmentLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.assignmentTypes).toEqual(mockData.assignmentTypes);
    expect(result.current.assignmentRatings).toEqual(
      mockData.assignmentRatings,
    );
    expect(result.current.error).toBeNull();
  });

  it('should return undefined fields when lookups are empty', async () => {
    overrideMockAssignmentsAdapter({
      getAssignmentLookups: async () => ({
        assignmentTypes: [],
        assignmentRatings: [],
      }),
    });

    const { result } = renderHook(() => useAssignmentLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.assignmentTypes).toEqual([]);
    expect(result.current.assignmentRatings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should expose error state when the adapter fails', async () => {
    overrideMockAssignmentsAdapter({
      getAssignmentLookups: async () => {
        throw new Error('Failed to fetch assignment lookups');
      },
    });

    const { result } = renderHook(() => useAssignmentLookupsQuery(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.assignmentTypes).toBeUndefined();
    expect(result.current.assignmentRatings).toBeUndefined();
  });
});
