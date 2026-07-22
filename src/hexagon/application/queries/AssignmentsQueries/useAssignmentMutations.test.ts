import type { RecentRecordsCache } from '@application/queries/coachingRecordsCache';
import { overrideMockAssignmentsAdapter } from '@application/adapters/assignmentAdapter.mock';
import { overrideMockCoachAdapter } from '@application/adapters/coachAdapter.mock';
import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import { ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';
import { useAssignmentsMutations } from '@application/queries/AssignmentsQueries/useAssignmentMutations';
import {
  RECENT_RECORDS_QUERY_KEY,
  useRecentRecordsQuery,
} from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { MEMBERSHIP_WEEKS_QUERY_KEY } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import { act, renderHook, waitFor } from '@testing-library/react';
import { baseAssignmentFactory } from '@testing/factories/assignmentsFactory';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { testQueryClient } from '@testing/utils/testQueryClient';
import { describe, expect, it, vi } from 'vitest';

const START_DATE = '2026-01-05';
const COACH_ID = '42';
const MONTH_YEAR = '2026-01';

function emptyRecentRecords(
  overrides: Partial<RecentRecordsCache> = {},
): RecentRecordsCache {
  return {
    assignments: [],
    privateCalls: [],
    groupCalls: [],
    ...overrides,
  };
}

function makeCreateCmd(assignment: ReturnType<typeof baseAssignmentFactory>) {
  return {
    weekId: assignment.weekId,
    assignmentType: assignment.assignmentType,
    assignmentRating: assignment.assignmentRating,
    homeworkCorrector: 1,
    notes: null,
    areasOfDifficulty: null,
    assignmentLink: null,
  };
}

function makeUpdateCmd(assignment: ReturnType<typeof baseAssignmentFactory>) {
  return {
    assignmentId: assignment.assignmentId,
    weekId: assignment.weekId,
    assignmentType: assignment.assignmentType,
    assignmentRating: assignment.assignmentRating,
    homeworkCorrector: 1,
    notes: null,
    areasOfDifficulty: null,
    assignmentLink: null,
  };
}

describe('useAssignmentsMutations', () => {
  it('should expose createAssignmentMutation, updateAssignmentMutation, and deleteAssignmentMutation', () => {
    const { result } = renderHook(() => useAssignmentsMutations(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.createAssignmentMutation).toBeDefined();
    expect(result.current.updateAssignmentMutation).toBeDefined();
    expect(result.current.deleteAssignmentMutation).toBeDefined();
  });

  describe('createAssignmentMutation', () => {
    it('should call the adapter and succeed', async () => {
      const newAssignment = baseAssignmentFactory({ weekId: 101 });
      overrideMockAssignmentsAdapter({
        createAssignment: async () => newAssignment,
      });

      const { result } = renderHook(() => useAssignmentsMutations(), {
        wrapper: TestQueryClientProvider,
      });

      await act(() =>
        result.current.createAssignmentMutation.mutateAsync(
          makeCreateCmd(newAssignment),
        ),
      );

      await waitFor(() =>
        expect(result.current.createAssignmentMutation.isSuccess).toBe(true),
      );
      expect(result.current.createAssignmentMutation.error).toBeNull();
    });

    it('should add the new assignment to the matching week in cache', async () => {
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
      const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });
      const newAssignment = baseAssignmentFactory({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, assignments: [] },
          { ...week2, assignments: [] },
        ],
      });
      overrideMockAssignmentsAdapter({
        createAssignment: async () => newAssignment,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useAssignmentsMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.createAssignmentMutation.mutateAsync(
          makeCreateCmd(newAssignment),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.createAssignmentMutation.isSuccess,
        ).toBe(true),
      );

      const updatedWeek = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      expect(updatedWeek?.assignments).toContainEqual(newAssignment);

      const otherWeek = result.current.weekData.weeks.find(
        (w) => w.weekId === 202,
      );
      expect(otherWeek?.assignments).toHaveLength(0);
    });

    it('should expose error state when the adapter fails', async () => {
      overrideMockAssignmentsAdapter({
        createAssignment: async () => {
          throw new Error('Failed to create assignment');
        },
      });

      const seedAssignment = baseAssignmentFactory({ weekId: 1 });
      const { result } = renderHook(() => useAssignmentsMutations(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.createAssignmentMutation.mutateAsync(
          makeCreateCmd(seedAssignment),
        ),
      ).rejects.toThrow('Failed to create assignment');

      await waitFor(() =>
        expect(result.current.createAssignmentMutation.isError).toBe(true),
      );
    });
  });

  describe('updateAssignmentMutation', () => {
    it('should replace the assignment in the matching week in cache', async () => {
      const existingAssignment = baseAssignmentFactory({
        assignmentId: 50,
        weekId: 101,
      });
      const updatedAssignment = baseAssignmentFactory({
        assignmentId: 50,
        weekId: 101,
        notes: 'updated notes',
      });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, assignments: [existingAssignment] },
        ],
      });
      overrideMockAssignmentsAdapter({
        updateAssignment: async () => updatedAssignment,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useAssignmentsMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.updateAssignmentMutation.mutateAsync(
          makeUpdateCmd(existingAssignment),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.updateAssignmentMutation.isSuccess,
        ).toBe(true),
      );

      const updatedWeek = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      expect(
        updatedWeek?.assignments.find((a) => a.assignmentId === 50)?.notes,
      ).toBe('updated notes');
    });
  });

  describe('deleteAssignmentMutation', () => {
    it('should remove the deleted assignment from cache', async () => {
      const assignmentToDelete = baseAssignmentFactory({ assignmentId: 10 });
      const otherAssignment = baseAssignmentFactory({ assignmentId: 20 });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, assignments: [assignmentToDelete, otherAssignment] },
        ],
      });
      overrideMockAssignmentsAdapter({ deleteAssignment: async () => {} });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useAssignmentsMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.deleteAssignmentMutation.mutateAsync({
          assignmentId: 10,
        }),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.deleteAssignmentMutation.isSuccess,
        ).toBe(true),
      );

      const updatedWeek = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      expect(
        updatedWeek?.assignments.find((a) => a.assignmentId === 10),
      ).toBeUndefined();
      expect(updatedWeek?.assignments).toHaveLength(1);
      expect(updatedWeek?.assignments[0].assignmentId).toBe(20);
    });
  });

  describe('recent-records cache', () => {
    it('should invalidate recent-records on create (no date to match month)', async () => {
      const newAssignment = baseAssignmentFactory({ weekId: 101 });
      overrideMockAssignmentsAdapter({
        createAssignment: async () => newAssignment,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () => emptyRecentRecords(),
      });

      const membershipKey = MEMBERSHIP_WEEKS_QUERY_KEY(7);
      testQueryClient.setQueryData(membershipKey, []);
      testQueryClient.setQueryData(
        [...ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY, START_DATE],
        [],
      );

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(COACH_ID, MONTH_YEAR),
          mutations: useAssignmentsMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(() =>
        result.current.mutations.createAssignmentMutation.mutateAsync(
          makeCreateCmd(newAssignment),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.createAssignmentMutation.isSuccess,
        ).toBe(true),
      );

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: RECENT_RECORDS_QUERY_KEY }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['membershipWeeks'] }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ASSIGNMENTS_COMPLETED_BY_WEEK_REPORT_QUERY_KEY,
        }),
      );
    });

    it('should replace the assignment in recent-records on update', async () => {
      const existingAssignment = baseAssignmentFactory({
        assignmentId: 50,
        weekId: 101,
        notes: 'old',
      });
      const updatedAssignment = baseAssignmentFactory({
        assignmentId: 50,
        weekId: 101,
        notes: 'updated notes',
      });
      overrideMockAssignmentsAdapter({
        updateAssignment: async () => updatedAssignment,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () =>
          emptyRecentRecords({ assignments: [existingAssignment] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(COACH_ID, MONTH_YEAR),
          mutations: useAssignmentsMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      await act(() =>
        result.current.mutations.updateAssignmentMutation.mutateAsync(
          makeUpdateCmd(existingAssignment),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.updateAssignmentMutation.isSuccess,
        ).toBe(true),
      );

      expect(
        result.current.recent.recentRecords?.assignments.find(
          (a) => a.assignmentId === 50,
        )?.notes,
      ).toBe('updated notes');
    });

    it('should remove the assignment from recent-records on delete', async () => {
      const assignmentToDelete = baseAssignmentFactory({ assignmentId: 10 });
      const otherAssignment = baseAssignmentFactory({ assignmentId: 20 });
      overrideMockAssignmentsAdapter({ deleteAssignment: async () => {} });
      overrideMockCoachAdapter({
        getRecentRecords: async () =>
          emptyRecentRecords({
            assignments: [assignmentToDelete, otherAssignment],
          }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(COACH_ID, MONTH_YEAR),
          mutations: useAssignmentsMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      await act(() =>
        result.current.mutations.deleteAssignmentMutation.mutateAsync({
          assignmentId: 10,
        }),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.deleteAssignmentMutation.isSuccess,
        ).toBe(true),
      );

      expect(result.current.recent.recentRecords?.assignments).toHaveLength(1);
      expect(
        result.current.recent.recentRecords?.assignments[0].assignmentId,
      ).toBe(20);
    });
  });
});
