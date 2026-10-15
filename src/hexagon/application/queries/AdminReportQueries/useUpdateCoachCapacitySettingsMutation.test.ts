import type {
  CoachCapacityReportRow,
  CoachCapacitySettings,
} from '@learncraft-spanish/shared';
import {
  mockAdminReportsAdapter,
  overrideMockAdminReportsAdapter,
} from '@application/adapters/AdminReports/adminReportsAdapter.mock';
import { useCoachCapacityReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityReportQuery';
import { useUpdateCoachCapacitySettingsMutation } from '@application/queries/AdminReportQueries/useUpdateCoachCapacitySettingsMutation';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createMockCoachCapacityReportRow } from '@testing/factories/adminReportsFactory';
import { TestQueryClientProvider } from '@testing/providers/TestQueryClientProvider';
import { describe, expect, it } from 'vitest';

const savedSettings: CoachCapacitySettings = {
  groupSessionsPerWeek: 2,
  projectsHours: 1.25,
  internalTimeHours: 0.5,
  teamMeetingHours: 1,
  desiredHours: 20,
  notes: 'Away in July',
};

function coachRow(settings = savedSettings): CoachCapacityReportRow {
  return createMockCoachCapacityReportRow({
    coach: { coach_id: 7, fullName: 'Coach Ana', email: 'ana@example.test' },
    settings,
    privateCallHours: 3,
    adminTimeHours: 0.5,
    groupSessionHours: 2,
    coachingHours: 5.5,
    nonCoachingHours: 2.75,
    committedHours: 8.25,
    bookedPercent: 41.25,
  });
}

const otherCoach = createMockCoachCapacityReportRow({
  coach: { coach_id: 8, fullName: 'Coach Beto', email: 'beto@example.test' },
});

/** Serves both reports from one saved row for coach 7, the way the API does */
function serveReports(): void {
  let saved = savedSettings;
  overrideMockAdminReportsAdapter({
    getCoachCapacityTodayReport: async () => [coachRow(saved), otherCoach],
    getCoachCapacityTwoWeeksOutReport: async () => [
      coachRow(saved),
      otherCoach,
    ],
    updateCoachCapacitySettings: async ({ settings }) => {
      saved = settings;
      return settings;
    },
  });
}

async function renderBothReportsAndMutation() {
  const rendered = renderHook(
    () => ({
      today: useCoachCapacityReportQuery('today'),
      twoWeeksOut: useCoachCapacityReportQuery('twoWeeksOut'),
      ...useUpdateCoachCapacitySettingsMutation(),
    }),
    { wrapper: TestQueryClientProvider },
  );
  await waitFor(() => {
    expect(
      rendered.result.current.today.coachCapacityReportQuery.isSuccess,
    ).toBe(true);
    expect(
      rendered.result.current.twoWeeksOut.coachCapacityReportQuery.isSuccess,
    ).toBe(true);
  });
  return rendered;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('useUpdateCoachCapacitySettingsMutation', () => {
  it('sends the changes on top of the coach’s saved settings', async () => {
    serveReports();
    const { result } = await renderBothReportsAndMutation();

    const saved = await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        changes: { projectsHours: 3, desiredHours: null },
      }),
    );

    const expected = { ...savedSettings, projectsHours: 3, desiredHours: null };
    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).toHaveBeenCalledExactlyOnceWith({ coachId: 7, settings: expected });
    expect(saved).toEqual(expected);
  });

  it('puts the saved settings and their totals in every cached report without refetching', async () => {
    serveReports();
    const { result } = await renderBothReportsAndMutation();

    await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        changes: { groupSessionsPerWeek: 3, projectsHours: 3 },
      }),
    );

    await waitFor(() => {
      for (const report of [result.current.today, result.current.twoWeeksOut]) {
        const [ana, beto] = report.coachCapacityReportQuery.data ?? [];
        expect(ana).toMatchObject({
          settings: { groupSessionsPerWeek: 3, projectsHours: 3 },
          // 3 Private Call + 0.5 Admin Time + 3 group sessions
          coachingHours: 6.5,
          // + 3 Projects + 0.5 Internal Time + 1 Team Meeting
          committedHours: 11,
          bookedPercent: expect.closeTo(55),
        });
        expect(beto).toEqual(otherCoach);
      }
    });
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledOnce();
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledOnce();
  });

  it('sends saves one at a time, each on top of the one before', async () => {
    serveReports();
    const firstSave = deferred<CoachCapacitySettings>();
    const sent: CoachCapacitySettings[] = [];
    overrideMockAdminReportsAdapter({
      updateCoachCapacitySettings: async ({ settings }) => {
        sent.push(settings);
        return sent.length === 1 ? firstSave.promise : settings;
      },
    });
    const { result } = await renderBothReportsAndMutation();
    const { mutateAsync } = result.current.updateCoachCapacitySettingsMutation;

    let saves: Promise<unknown> = Promise.resolve();
    act(() => {
      saves = Promise.all([
        mutateAsync({ coachId: 7, changes: { projectsHours: 3 } }),
        mutateAsync({ coachId: 7, changes: { notes: 'Back in May' } }),
      ]);
    });
    await waitFor(() => expect(sent).toHaveLength(1));
    // Give the second save every chance to jump the queue
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(sent).toHaveLength(1);

    await act(async () => {
      firstSave.resolve(sent[0]);
      await saves;
    });

    expect(sent).toEqual([
      { ...savedSettings, projectsHours: 3 },
      { ...savedSettings, projectsHours: 3, notes: 'Back in May' },
    ]);
  });

  it('starts over a report that was loading when the save landed', async () => {
    serveReports();
    const { result } = await renderBothReportsAndMutation();
    const staleFetch = deferred<CoachCapacityReportRow[]>();
    let todayFetches = 1;
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => {
        todayFetches += 1;
        return todayFetches === 2
          ? staleFetch.promise
          : [coachRow(), otherCoach];
      },
      updateCoachCapacitySettings: async ({ settings }) => settings,
    });

    act(() => {
      void result.current.today.coachCapacityReportQuery.refetch();
    });
    await waitFor(() => expect(todayFetches).toBe(2));
    overrideMockAdminReportsAdapter({
      getCoachCapacityTodayReport: async () => {
        todayFetches += 1;
        return [coachRow({ ...savedSettings, projectsHours: 3 }), otherCoach];
      },
      updateCoachCapacitySettings: async ({ settings }) => settings,
    });
    await act(() =>
      result.current.updateCoachCapacitySettingsMutation.mutateAsync({
        coachId: 7,
        changes: { projectsHours: 3 },
      }),
    );
    await act(async () => staleFetch.resolve([coachRow(), otherCoach]));

    await waitFor(() => expect(todayFetches).toBe(3));
    await waitFor(() =>
      expect(
        result.current.today.coachCapacityReportQuery.data?.[0].settings
          .projectsHours,
      ).toBe(3),
    );
    expect(
      mockAdminReportsAdapter.getCoachCapacityTwoWeeksOutReport,
    ).toHaveBeenCalledOnce();
  });

  it('fails without sending anything for a coach who is not in a loaded report', async () => {
    serveReports();
    const { result } = await renderBothReportsAndMutation();

    await act(async () => {
      await expect(
        result.current.updateCoachCapacitySettingsMutation.mutateAsync({
          coachId: 99,
          changes: { projectsHours: 3 },
        }),
      ).rejects.toThrow('Coach 99 is not in a loaded Coach Capacity report');
    });

    expect(
      mockAdminReportsAdapter.updateCoachCapacitySettings,
    ).not.toHaveBeenCalled();
  });

  it('exposes the error and leaves the cached reports as they were when the save fails', async () => {
    serveReports();
    overrideMockAdminReportsAdapter({
      updateCoachCapacitySettings: async () => {
        throw new Error('Failed to save Coach Capacity settings');
      },
    });
    const { result } = await renderBothReportsAndMutation();

    await act(async () => {
      await expect(
        result.current.updateCoachCapacitySettingsMutation.mutateAsync({
          coachId: 7,
          changes: { projectsHours: 3 },
        }),
      ).rejects.toThrow('Failed to save Coach Capacity settings');
    });

    await waitFor(() =>
      expect(result.current.updateCoachCapacitySettingsMutation.isError).toBe(
        true,
      ),
    );
    expect(result.current.today.coachCapacityReportQuery.data?.[0]).toEqual(
      coachRow(),
    );
    expect(
      mockAdminReportsAdapter.getCoachCapacityTodayReport,
    ).toHaveBeenCalledOnce();
  });
});
