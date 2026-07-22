import type { RecentRecordsCache } from '@application/queries/coachingRecordsCache';
import { overrideMockCoachAdapter } from '@application/adapters/coachAdapter.mock';
import { overrideMockGroupCallsAdapter } from '@application/adapters/groupCallsAdapter.mock';
import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import {
  RECENT_RECORDS_QUERY_KEY,
  useRecentRecordsQuery,
} from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { useGroupCallMutations } from '@application/queries/GroupCallQueries/useGroupCallMutations';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockCoach } from '@testing/factories/coachFactory';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { testQueryClient } from '@testing/utils/testQueryClient';
import { describe, expect, it, vi } from 'vitest';

const START_DATE = '2026-01-05';
const COACH_ID = 42;
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

const makeAttendee = (weekId: number) => ({
  weekId,
  groupAttendeeId: weekId,
  groupSessionId: 999,
  studentFullName: 'Test Student',
});

function makeCreateCmd(session: ReturnType<typeof baseGroupSessionFactory>) {
  return {
    coach: 1,
    callDate: session.callDate,
    comments: null,
    zoomLink: null,
    callDocument: null,
    groupSessionType: session.groupSessionType ?? {
      groupSessionTypeId: 1,
      groupSessionType: 'Test',
    },
    groupSessionTopic: session.groupSessionTopic ?? {
      groupSessionTopicId: 1,
      groupSessionTopic: 'Test',
    },
    attendeeWeekIds: session.attendees.map((a) => a.weekId),
  };
}

function makeUpdateCmd(session: ReturnType<typeof baseGroupSessionFactory>) {
  return {
    groupSessionId: session.groupSessionId,
    coach: 1,
    callDate: session.callDate,
    comments: null,
    zoomLink: null,
    callDocument: null,
    groupSessionType: session.groupSessionType ?? {
      groupSessionTypeId: 1,
      groupSessionType: 'Test',
    },
    groupSessionTopic: session.groupSessionTopic ?? {
      groupSessionTopicId: 1,
      groupSessionTopic: 'Test',
    },
    attendeeWeekIds: session.attendees.map((a) => a.weekId),
  };
}

describe('useGroupCallMutations', () => {
  it('should expose createGroupCallMutation, updateGroupCallMutation, and deleteGroupCallMutation', () => {
    const { result } = renderHook(() => useGroupCallMutations(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.createGroupCallMutation).toBeDefined();
    expect(result.current.updateGroupCallMutation).toBeDefined();
    expect(result.current.deleteGroupCallMutation).toBeDefined();
  });

  describe('createGroupCallMutation', () => {
    it('should call the adapter and succeed', async () => {
      const newSession = baseGroupSessionFactory({ attendees: [] });
      overrideMockGroupCallsAdapter({
        createGroupCall: async () => newSession,
      });

      const { result } = renderHook(() => useGroupCallMutations(), {
        wrapper: TestQueryClientProvider,
      });

      await act(() =>
        result.current.createGroupCallMutation.mutateAsync(
          makeCreateCmd(newSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.createGroupCallMutation.isSuccess).toBe(true),
      );
      expect(result.current.createGroupCallMutation.error).toBeNull();
    });

    it('should add the session only to weeks whose weekId is in attendees', async () => {
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
      const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });

      const newSession = baseGroupSessionFactory({
        groupSessionId: 999,
        attendees: [makeAttendee(101)],
      });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, groupCalls: [] },
          { ...week2, groupCalls: [] },
        ],
      });
      overrideMockGroupCallsAdapter({
        createGroupCall: async () => newSession,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.createGroupCallMutation.mutateAsync(
          makeCreateCmd(newSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.mutations.createGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      const attending = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      const nonAttending = result.current.weekData.weeks.find(
        (w) => w.weekId === 202,
      );

      expect(
        attending?.groupCalls.find((c) => c.groupSessionId === 999),
      ).toBeDefined();
      expect(nonAttending?.groupCalls).toHaveLength(0);
    });

    it('should not add a duplicate session if it is already in the cache', async () => {
      const existingSession = baseGroupSessionFactory({
        groupSessionId: 999,
        attendees: [makeAttendee(101)],
      });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, groupCalls: [existingSession] },
        ],
      });
      overrideMockGroupCallsAdapter({
        createGroupCall: async () => existingSession,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.createGroupCallMutation.mutateAsync(
          makeCreateCmd(existingSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.mutations.createGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      const week = result.current.weekData.weeks.find((w) => w.weekId === 101);
      expect(week?.groupCalls).toHaveLength(1);
    });

    it('should expose error state when the adapter fails', async () => {
      overrideMockGroupCallsAdapter({
        createGroupCall: async () => {
          throw new Error('Failed to create group call');
        },
      });

      const session = baseGroupSessionFactory({ attendees: [] });
      const { result } = renderHook(() => useGroupCallMutations(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.createGroupCallMutation.mutateAsync(
          makeCreateCmd(session),
        ),
      ).rejects.toThrow('Failed to create group call');

      await waitFor(() =>
        expect(result.current.createGroupCallMutation.isError).toBe(true),
      );
    });
  });

  describe('updateGroupCallMutation', () => {
    it('should add the updated session to a newly attending week and remove from a no-longer attending week', async () => {
      const originalSession = baseGroupSessionFactory({
        groupSessionId: 999,
        attendees: [makeAttendee(101)],
      });
      const updatedSession = baseGroupSessionFactory({
        groupSessionId: 999,
        attendees: [makeAttendee(202)],
      });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
      const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, groupCalls: [originalSession] },
          { ...week2, groupCalls: [] },
        ],
      });
      overrideMockGroupCallsAdapter({
        updateGroupCall: async () => updatedSession,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.updateGroupCallMutation.mutateAsync(
          makeUpdateCmd(updatedSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.mutations.updateGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      const updatedWeek1 = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      const updatedWeek2 = result.current.weekData.weeks.find(
        (w) => w.weekId === 202,
      );

      expect(updatedWeek1?.groupCalls).toHaveLength(0);
      expect(
        updatedWeek2?.groupCalls.find((c) => c.groupSessionId === 999),
      ).toBeDefined();
    });
  });

  describe('deleteGroupCallMutation', () => {
    it('should remove the group session from all weeks in cache', async () => {
      const sessionToDelete = baseGroupSessionFactory({
        groupSessionId: 999,
        attendees: [],
      });
      const otherSession = baseGroupSessionFactory({
        groupSessionId: 888,
        attendees: [],
      });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
      const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, groupCalls: [sessionToDelete, otherSession] },
          { ...week2, groupCalls: [sessionToDelete] },
        ],
      });
      overrideMockGroupCallsAdapter({ deleteGroupCall: async () => {} });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.deleteGroupCallMutation.mutateAsync({
          groupSessionId: 999,
        }),
      );

      await waitFor(() =>
        expect(result.current.mutations.deleteGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      const updatedWeek1 = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      const updatedWeek2 = result.current.weekData.weeks.find(
        (w) => w.weekId === 202,
      );

      expect(
        updatedWeek1?.groupCalls.find((c) => c.groupSessionId === 999),
      ).toBeUndefined();
      expect(
        updatedWeek1?.groupCalls.find((c) => c.groupSessionId === 888),
      ).toBeDefined();
      expect(updatedWeek2?.groupCalls).toHaveLength(0);
    });
  });

  describe('recent-records cache', () => {
    it('should insert into matching month/coach recent-records on create', async () => {
      const coach = createMockCoach({ coach_id: COACH_ID });
      const newSession = baseGroupSessionFactory({
        groupSessionId: 999,
        callDate: '2026-01-20',
        coach,
        attendees: [makeAttendee(101)],
      });
      overrideMockGroupCallsAdapter({
        createGroupCall: async () => newSession,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () => emptyRecentRecords({ groupCalls: [] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(() =>
        result.current.mutations.createGroupCallMutation.mutateAsync(
          makeCreateCmd(newSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.mutations.createGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      expect(result.current.recent.recentRecords?.groupCalls).toContainEqual(
        newSession,
      );
      expect(invalidateSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: RECENT_RECORDS_QUERY_KEY }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['membershipWeeks'] }),
      );
    });

    it('should invalidate recent-records when create month does not match', async () => {
      const coach = createMockCoach({ coach_id: COACH_ID });
      const newSession = baseGroupSessionFactory({
        groupSessionId: 999,
        callDate: '2026-04-20',
        coach,
        attendees: [],
      });
      overrideMockGroupCallsAdapter({
        createGroupCall: async () => newSession,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () => emptyRecentRecords({ groupCalls: [] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(() =>
        result.current.mutations.createGroupCallMutation.mutateAsync(
          makeCreateCmd(newSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.mutations.createGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: RECENT_RECORDS_QUERY_KEY }),
      );
    });

    it('should replace the group session in recent-records on update', async () => {
      const coach = createMockCoach({ coach_id: COACH_ID });
      const existingSession = baseGroupSessionFactory({
        groupSessionId: 999,
        comments: 'old',
        coach,
        attendees: [makeAttendee(101)],
      });
      const updatedSession = baseGroupSessionFactory({
        groupSessionId: 999,
        comments: 'updated comments',
        coach,
        attendees: [makeAttendee(101)],
      });
      overrideMockGroupCallsAdapter({
        updateGroupCall: async () => updatedSession,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () =>
          emptyRecentRecords({ groupCalls: [existingSession] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      await act(() =>
        result.current.mutations.updateGroupCallMutation.mutateAsync(
          makeUpdateCmd(updatedSession),
        ),
      );

      await waitFor(() =>
        expect(result.current.mutations.updateGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      expect(
        result.current.recent.recentRecords?.groupCalls.find(
          (c) => c.groupSessionId === 999,
        )?.comments,
      ).toBe('updated comments');
    });

    it('should remove the group session from recent-records on delete', async () => {
      const sessionToDelete = baseGroupSessionFactory({
        groupSessionId: 999,
        attendees: [],
      });
      const otherSession = baseGroupSessionFactory({
        groupSessionId: 888,
        attendees: [],
      });
      overrideMockGroupCallsAdapter({ deleteGroupCall: async () => {} });
      overrideMockCoachAdapter({
        getRecentRecords: async () =>
          emptyRecentRecords({
            groupCalls: [sessionToDelete, otherSession],
          }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: useGroupCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      await act(() =>
        result.current.mutations.deleteGroupCallMutation.mutateAsync({
          groupSessionId: 999,
        }),
      );

      await waitFor(() =>
        expect(result.current.mutations.deleteGroupCallMutation.isSuccess).toBe(
          true,
        ),
      );

      expect(result.current.recent.recentRecords?.groupCalls).toHaveLength(1);
      expect(
        result.current.recent.recentRecords?.groupCalls[0].groupSessionId,
      ).toBe(888);
    });
  });
});
