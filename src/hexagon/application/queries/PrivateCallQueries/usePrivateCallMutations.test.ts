import { overrideMockPrivateCallsAdapter } from '@application/adapters/privateCallsAdapter.mock';
import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import { usePrivateCallMutations } from '@application/queries/PrivateCallQueries/usePrivateCallMutations';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { act, renderHook, waitFor } from '@testing-library/react';
import { basePrivateCallFactory } from '@testing/factories/privateCallsFactory';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

const START_DATE = '2026-01-05';

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
});
