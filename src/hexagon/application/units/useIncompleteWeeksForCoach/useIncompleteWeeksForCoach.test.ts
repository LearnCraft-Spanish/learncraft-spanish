import { overrideMockWeeklyRecordsAdapter } from '@application/adapters/weeklyRecordsAdapter.mock';
import { useIncompleteWeeksForCoach } from '@application/units/useIncompleteWeeksForCoach/useIncompleteWeeksForCoach';
import { getDefaultIncompleteRecordsWeekStart } from '@domain/functions/incompleteWeeksForCoach';
import { renderHook, waitFor } from '@testing-library/react';
import { createMockFurnishedWeekWithCoach } from '@testing/factories/weekFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it, vi } from 'vitest';

const COACH_ID = 42;

describe('useIncompleteWeeksForCoach', () => {
  it('derives startDate from the incomplete records business rule', () => {
    const { result } = renderHook(() => useIncompleteWeeksForCoach(COACH_ID), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.startDate).toBe(
      getDefaultIncompleteRecordsWeekStart(),
    );
  });

  it('returns only incomplete weeks belonging to the given coach', async () => {
    const myWeek = createMockFurnishedWeekWithCoach({
      recordComplete: false,
      holdWeek: false,
      srCourseName: 'Spanish A1',
      coach: { coach_id: COACH_ID, fullName: 'My Coach', email: 'me@lcs.com' },
    });
    const otherCoachWeek = createMockFurnishedWeekWithCoach({
      recordComplete: false,
      holdWeek: false,
      srCourseName: 'Spanish A1',
      coach: {
        coach_id: 99,
        fullName: 'Other Coach',
        email: 'other@lcs.com',
      },
    });
    const completeWeek = createMockFurnishedWeekWithCoach({
      recordComplete: true,
      holdWeek: false,
      srCourseName: 'Spanish A1',
      coach: { coach_id: COACH_ID, fullName: 'My Coach', email: 'me@lcs.com' },
    });

    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: vi.fn(async () => [
        myWeek,
        otherCoachWeek,
        completeWeek,
      ]),
    });

    const { result } = renderHook(() => useIncompleteWeeksForCoach(COACH_ID), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.weeks).toHaveLength(1);
    expect(result.current.weeks[0]?.weekId).toBe(myWeek.weekId);
  });

  it('returns an empty array when there are no incomplete weeks for the coach', async () => {
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: vi.fn(async () => []),
    });

    const { result } = renderHook(() => useIncompleteWeeksForCoach(COACH_ID), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.weeks).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it('surfaces loading state while fetching', () => {
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: vi.fn(
        () => new Promise<never>(() => {}), // never resolves
      ),
    });

    const { result } = renderHook(() => useIncompleteWeeksForCoach(COACH_ID), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.loading).toBe(true);
  });

  it('surfaces error state when the adapter fails', async () => {
    overrideMockWeeklyRecordsAdapter({
      getWeeksByStartDate: vi.fn(async () => {
        throw new Error('network error');
      }),
    });

    const { result } = renderHook(() => useIncompleteWeeksForCoach(COACH_ID), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeDefined();
    expect(result.current.weeks).toHaveLength(0);
  });
});
