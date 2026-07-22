import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { MEMBERSHIP_WEEKS_QUERY_KEY_ROOT } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import { useWeekMutations } from '@application/queries/WeekQueries/useWeekMutations';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  createMockBaseWeek,
  createMockFurnishedWeekWithCoach,
  createMockUpdateWeekCommand,
} from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { testQueryClient } from '@testing/utils/testQueryClient';
import { describe, expect, it, vi } from 'vitest';

const START_DATE = '2026-01-05';

describe('useWeekMutations', () => {
  it('should expose the updateWeekMutation', () => {
    const { result } = renderHook(() => useWeekMutations(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.updateWeekMutation).toBeDefined();
    expect(result.current.updateWeekMutation.mutateAsync).toBeDefined();
  });

  it('should call the adapter and succeed', async () => {
    const updatedWeeks = [createMockBaseWeek()];
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => [],
      updateWeeks: async () => updatedWeeks,
    });

    const { result } = renderHook(() => useWeekMutations(), {
      wrapper: TestQueryClientProvider,
    });

    await act(() =>
      result.current.updateWeekMutation.mutateAsync([
        createMockUpdateWeekCommand(),
      ]),
    );

    await waitFor(() =>
      expect(result.current.updateWeekMutation.isSuccess).toBe(true),
    );
    expect(result.current.updateWeekMutation.error).toBeNull();
  });

  it('should patch the cache with updated week fields', async () => {
    const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
    const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });
    const seedWeeks = [week1, week2];

    const updatedBaseWeek = createMockBaseWeek({
      weekId: 101,
      notes: 'Updated notes',
      holdWeek: true,
      recordComplete: true,
    });

    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => seedWeeks,
      updateWeeks: async () => [updatedBaseWeek],
    });

    const { result } = renderHook(
      () => ({
        weekData: useWeeksByStartDate(START_DATE),
        mutations: useWeekMutations(),
      }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.weekData.loading).toBe(false));

    await act(() =>
      result.current.mutations.updateWeekMutation.mutateAsync([
        createMockUpdateWeekCommand({ weekId: 101 }),
      ]),
    );

    await waitFor(() =>
      expect(result.current.mutations.updateWeekMutation.isSuccess).toBe(true),
    );

    const updatedWeek = result.current.weekData.weeks.find(
      (w) => w.weekId === 101,
    );
    expect(updatedWeek?.notes).toBe(updatedBaseWeek.notes);
    expect(updatedWeek?.holdWeek).toBe(updatedBaseWeek.holdWeek);
    expect(updatedWeek?.recordComplete).toBe(updatedBaseWeek.recordComplete);
  });

  it('should leave other weeks untouched when updating one week', async () => {
    const week1 = createMockFurnishedWeekWithCoach({ weekId: 101 });
    const week2 = createMockFurnishedWeekWithCoach({ weekId: 202 });
    const seedWeeks = [week1, week2];

    const updatedBaseWeek = createMockBaseWeek({ weekId: 101 });

    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => seedWeeks,
      updateWeeks: async () => [updatedBaseWeek],
    });

    const { result } = renderHook(
      () => ({
        weekData: useWeeksByStartDate(START_DATE),
        mutations: useWeekMutations(),
      }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => expect(result.current.weekData.loading).toBe(false));

    await act(() =>
      result.current.mutations.updateWeekMutation.mutateAsync([
        createMockUpdateWeekCommand({ weekId: 101 }),
      ]),
    );

    await waitFor(() =>
      expect(result.current.mutations.updateWeekMutation.isSuccess).toBe(true),
    );

    const unchangedWeek = result.current.weekData.weeks.find(
      (w) => w.weekId === 202,
    );
    expect(unchangedWeek?.weekId).toBe(202);
  });

  it('should expose error state when the adapter fails', async () => {
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => [],
      updateWeeks: async () => {
        throw new Error('Failed to update weeks');
      },
    });

    const { result } = renderHook(() => useWeekMutations(), {
      wrapper: TestQueryClientProvider,
    });

    await expect(
      result.current.updateWeekMutation.mutateAsync([
        createMockUpdateWeekCommand(),
      ]),
    ).rejects.toThrow('Failed to update weeks');

    await waitFor(() =>
      expect(result.current.updateWeekMutation.isError).toBe(true),
    );
  });

  it('should invalidate Student Drill Down membershipWeeks queries on success', async () => {
    const invalidateSpy = vi.spyOn(testQueryClient, 'invalidateQueries');
    overrideMockWeeklyRecordsAdapter({
      updateWeeks: async () => [createMockBaseWeek()],
    });

    const { result } = renderHook(() => useWeekMutations(), {
      wrapper: TestQueryClientProvider,
    });

    await act(() =>
      result.current.updateWeekMutation.mutateAsync([
        createMockUpdateWeekCommand(),
      ]),
    );

    await waitFor(() =>
      expect(result.current.updateWeekMutation.isSuccess).toBe(true),
    );

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: MEMBERSHIP_WEEKS_QUERY_KEY_ROOT,
    });
  });
});
