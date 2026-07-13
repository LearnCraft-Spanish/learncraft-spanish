import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockFurnishedWeekWithCoachList } from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

describe('useWeeksByStartDate', () => {
  it('should fetch and return weeks for a given start date', async () => {
    const mockWeeks = createMockFurnishedWeekWithCoachList(3);
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => mockWeeks,
    });

    const { result } = renderHook(() => useWeeksByStartDate('2026-01-05'), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weeks).toEqual(mockWeeks);
    expect(result.current.error).toBeNull();
  });

  it('should return an empty array when no weeks exist for the date', async () => {
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => [],
    });

    const { result } = renderHook(() => useWeeksByStartDate('2026-01-05'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weeks).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch when startDate is empty', async () => {
    const { result } = renderHook(() => useWeeksByStartDate(''), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.weeks).toEqual([]);
  });

  it('should expose error state when the adapter fails', async () => {
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => {
        throw new Error('Failed to fetch weeks');
      },
    });

    const { result } = renderHook(() => useWeeksByStartDate('2026-01-05'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.weeks).toEqual([]);
  });

  it('should find a week by id via getWeekById', async () => {
    const mockWeeks = createMockFurnishedWeekWithCoachList(3);
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: async () => mockWeeks,
    });

    const { result } = renderHook(() => useWeeksByStartDate('2026-01-05'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    const targetWeek = result.current.weeks[1];
    expect(result.current.getWeekById(targetWeek.weekId)?.weekId).toBe(
      targetWeek.weekId,
    );
    expect(result.current.getWeekById(999999)).toBeUndefined();
  });
});
