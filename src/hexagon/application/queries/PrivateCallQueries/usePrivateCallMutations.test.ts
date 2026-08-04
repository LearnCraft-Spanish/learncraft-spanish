import type { RecentRecordsCache } from '@application/queries/coachingRecordsCache';
import { overrideMockCoachAdapter } from '@application/adapters/coachAdapter.mock';
import { overrideMockPrivateCallsAdapter } from '@application/adapters/privateCallsAdapter.mock';
import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import {
  RECENT_RECORDS_QUERY_KEY,
  useRecentRecordsQuery,
} from '@application/queries/CoachQueries/useRecentRecordsQuery';
import { usePrivateCallMutations } from '@application/queries/PrivateCallQueries/usePrivateCallMutations';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockCoach } from '@testing/factories/coachFactory';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
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

function makeCreateCmd(call: ReturnType<typeof basePrivateCallFactory>) {
  return {
    weekId: call.weekId ?? 0,
    callType: call.callType,
    callRating: call.callRating,
    callDate: call.callDate,
    caller: 1,
    notes: null,
    areasOfDifficulty: null,
    recording: null,
  };
}

function makeUpdateCmd(call: ReturnType<typeof basePrivateCallFactory>) {
  return {
    callId: call.callId,
    weekId: call.weekId ?? 0,
    callType: call.callType,
    callRating: call.callRating,
    callDate: call.callDate,
    caller: 1,
    notes: null,
    areasOfDifficulty: null,
    recording: null,
  };
}

describe('usePrivateCallMutations', () => {
  it('should expose createPrivateCallMutation, updatePrivateCallMutation, and deletePrivateCallMutation', () => {
    const { result } = renderHook(() => usePrivateCallMutations(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.createPrivateCallMutation).toBeDefined();
    expect(result.current.updatePrivateCallMutation).toBeDefined();
    expect(result.current.deletePrivateCallMutation).toBeDefined();
  });

  describe('createPrivateCallMutation', () => {
    it('should call the adapter and succeed', async () => {
      const newCall = basePrivateCallFactory({ weekId: 101 });
      overrideMockPrivateCallsAdapter({
        createPrivateCall: async () => newCall,
      });

      const { result } = renderHook(() => usePrivateCallMutations(), {
        wrapper: TestQueryClientProvider,
      });

      await act(() =>
        result.current.createPrivateCallMutation.mutateAsync(
          makeCreateCmd(newCall),
        ),
      );

      await waitFor(() =>
        expect(result.current.createPrivateCallMutation.isSuccess).toBe(true),
      );
      expect(result.current.createPrivateCallMutation.error).toBeNull();
    });

    it('should add the new private call to the matching week in cache', async () => {
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
      const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });
      const newCall = basePrivateCallFactory({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, privateCalls: [] },
          { ...week2, privateCalls: [] },
        ],
      });
      overrideMockPrivateCallsAdapter({
        createPrivateCall: async () => newCall,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.createPrivateCallMutation.mutateAsync(
          makeCreateCmd(newCall),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.createPrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      const updatedWeek = result.current.weekData.weeks.find(
        (w) => w.weekId === 101,
      );
      expect(updatedWeek?.privateCalls).toContainEqual(newCall);

      const otherWeek = result.current.weekData.weeks.find(
        (w) => w.weekId === 202,
      );
      expect(otherWeek?.privateCalls).toHaveLength(0);
    });

    it('should expose error state when the adapter fails', async () => {
      overrideMockPrivateCallsAdapter({
        createPrivateCall: async () => {
          throw new Error('Failed to create private call');
        },
      });

      const seedCall = basePrivateCallFactory({ weekId: 1 });
      const { result } = renderHook(() => usePrivateCallMutations(), {
        wrapper: TestQueryClientProvider,
      });

      await expect(
        result.current.createPrivateCallMutation.mutateAsync(
          makeCreateCmd(seedCall),
        ),
      ).rejects.toThrow('Failed to create private call');

      await waitFor(() =>
        expect(result.current.createPrivateCallMutation.isError).toBe(true),
      );
    });
  });

  describe('updatePrivateCallMutation', () => {
    it('should replace the private call in the matching week in cache', async () => {
      const existingCall = basePrivateCallFactory({ callId: 50, weekId: 101 });
      const updatedCall = basePrivateCallFactory({
        callId: 50,
        weekId: 101,
        notes: 'updated notes',
      });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, privateCalls: [existingCall] },
        ],
      });
      overrideMockPrivateCallsAdapter({
        updatePrivateCall: async () => updatedCall,
      });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.updatePrivateCallMutation.mutateAsync(
          makeUpdateCmd(existingCall),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.updatePrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      const week = result.current.weekData.weeks.find((w) => w.weekId === 101);
      expect(week?.privateCalls.find((c) => c.callId === 50)?.notes).toBe(
        'updated notes',
      );
    });
  });

  describe('deletePrivateCallMutation', () => {
    it('should remove the deleted private call from cache', async () => {
      const callToDelete = basePrivateCallFactory({ callId: 10 });
      const otherCall = basePrivateCallFactory({ callId: 20 });
      const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });

      overrideMockWeeklyRecordsAdapter({
        getWeeksByStartDate: async () => [
          { ...week1, privateCalls: [callToDelete, otherCall] },
        ],
      });
      overrideMockPrivateCallsAdapter({ deletePrivateCall: async () => {} });

      const { result } = renderHook(
        () => ({
          weekData: useWeeksByStartDate(START_DATE),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.weekData.loading).toBe(false));

      await act(() =>
        result.current.mutations.deletePrivateCallMutation.mutateAsync({
          callId: 10,
        }),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.deletePrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      const week = result.current.weekData.weeks.find((w) => w.weekId === 101);
      expect(week?.privateCalls.find((c) => c.callId === 10)).toBeUndefined();
      expect(week?.privateCalls).toHaveLength(1);
      expect(week?.privateCalls[0].callId).toBe(20);
    });
  });

  describe('recent-records cache', () => {
    it('should insert into matching month/coach recent-records on create', async () => {
      const caller = createMockCoach({ coach_id: COACH_ID });
      const newCall = basePrivateCallFactory({
        weekId: 101,
        callDate: '2026-01-15',
        caller,
      });
      overrideMockPrivateCallsAdapter({
        createPrivateCall: async () => newCall,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async (_coachId, monthYear) => {
          if (monthYear === MONTH_YEAR) {
            return emptyRecentRecords({ privateCalls: [] });
          }
          return emptyRecentRecords({ privateCalls: [] });
        },
      });

      const { result } = renderHook(
        () => ({
          january: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          february: useRecentRecordsQuery(String(COACH_ID), '2026-02'),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.january.isLoading).toBe(false));
      await waitFor(() =>
        expect(result.current.february.isLoading).toBe(false),
      );

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(() =>
        result.current.mutations.createPrivateCallMutation.mutateAsync(
          makeCreateCmd(newCall),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.createPrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      expect(result.current.january.recentRecords?.privateCalls).toContainEqual(
        newCall,
      );
      expect(result.current.february.recentRecords?.privateCalls).toHaveLength(
        0,
      );
      expect(invalidateSpy).not.toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: RECENT_RECORDS_QUERY_KEY }),
      );
      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['membershipWeeks'] }),
      );
    });

    it('should invalidate recent-records when create month does not match', async () => {
      const caller = createMockCoach({ coach_id: COACH_ID });
      const newCall = basePrivateCallFactory({
        weekId: 101,
        callDate: '2026-03-15',
        caller,
      });
      overrideMockPrivateCallsAdapter({
        createPrivateCall: async () => newCall,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () => emptyRecentRecords({ privateCalls: [] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(() =>
        result.current.mutations.createPrivateCallMutation.mutateAsync(
          makeCreateCmd(newCall),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.createPrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: RECENT_RECORDS_QUERY_KEY }),
      );
    });

    it('should invalidate recent-records when create coach does not match', async () => {
      const caller = createMockCoach({ coach_id: 99 });
      const newCall = basePrivateCallFactory({
        weekId: 101,
        callDate: '2026-01-15',
        caller,
      });
      overrideMockPrivateCallsAdapter({
        createPrivateCall: async () => newCall,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () => emptyRecentRecords({ privateCalls: [] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');

      await act(() =>
        result.current.mutations.createPrivateCallMutation.mutateAsync(
          makeCreateCmd(newCall),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.createPrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: RECENT_RECORDS_QUERY_KEY }),
      );
    });

    it('should replace the private call in recent-records on update', async () => {
      const caller = createMockCoach({ coach_id: COACH_ID });
      const existingCall = basePrivateCallFactory({
        callId: 50,
        weekId: 101,
        notes: 'old',
        caller,
      });
      const updatedCall = basePrivateCallFactory({
        callId: 50,
        weekId: 101,
        notes: 'updated notes',
        caller,
      });
      overrideMockPrivateCallsAdapter({
        updatePrivateCall: async () => updatedCall,
      });
      overrideMockCoachAdapter({
        getRecentRecords: async () =>
          emptyRecentRecords({ privateCalls: [existingCall] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      await act(() =>
        result.current.mutations.updatePrivateCallMutation.mutateAsync(
          makeUpdateCmd(existingCall),
        ),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.updatePrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      expect(
        result.current.recent.recentRecords?.privateCalls.find(
          (c) => c.callId === 50,
        )?.notes,
      ).toBe('updated notes');
    });

    it('should remove the private call from recent-records on delete', async () => {
      const callToDelete = basePrivateCallFactory({ callId: 10 });
      const otherCall = basePrivateCallFactory({ callId: 20 });
      overrideMockPrivateCallsAdapter({ deletePrivateCall: async () => {} });
      overrideMockCoachAdapter({
        getRecentRecords: async () =>
          emptyRecentRecords({ privateCalls: [callToDelete, otherCall] }),
      });

      const { result } = renderHook(
        () => ({
          recent: useRecentRecordsQuery(String(COACH_ID), MONTH_YEAR),
          mutations: usePrivateCallMutations(),
        }),
        { wrapper: TestQueryClientProvider },
      );

      await waitFor(() => expect(result.current.recent.isLoading).toBe(false));

      await act(() =>
        result.current.mutations.deletePrivateCallMutation.mutateAsync({
          callId: 10,
        }),
      );

      await waitFor(() =>
        expect(
          result.current.mutations.deletePrivateCallMutation.isSuccess,
        ).toBe(true),
      );

      expect(result.current.recent.recentRecords?.privateCalls).toHaveLength(1);
      expect(result.current.recent.recentRecords?.privateCalls[0].callId).toBe(
        20,
      );
    });
  });
});
