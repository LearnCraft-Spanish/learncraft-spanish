import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import { useMemo, useState } from 'react';

export interface WeeklyRecordsSummary {
  totalWeeks: number;
  totalAssignments: number;
  totalPrivateCalls: number;
  totalGroupCalls: number;
  totalGroupAttendees: number;
}

export interface UseWeeklyRecordsPageResult {
  startDate: string;
  updateStartDate: (startDate: string) => void;
  weeks: FurnishedWeekWithCoach[];
  summary: WeeklyRecordsSummary;
  hasSelectedStartDate: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWeeklyRecordsPage(): UseWeeklyRecordsPageResult {
  const [startDate, setStartDate] = useState('');
  const { weeks, loading, error, refetch } = useWeeksByStartDate(startDate);

  const summary = useMemo<WeeklyRecordsSummary>(() => {
    return weeks.reduce(
      (totals, week) => {
        const groupAttendees = week.groupCalls.reduce(
          (attendeeTotal, groupCall) =>
            attendeeTotal + groupCall.attendees.length,
          0,
        );

        return {
          totalWeeks: totals.totalWeeks + 1,
          totalAssignments: totals.totalAssignments + week.assignments.length,
          totalPrivateCalls:
            totals.totalPrivateCalls + week.privateCalls.length,
          totalGroupCalls: totals.totalGroupCalls + week.groupCalls.length,
          totalGroupAttendees: totals.totalGroupAttendees + groupAttendees,
        };
      },
      {
        totalWeeks: 0,
        totalAssignments: 0,
        totalPrivateCalls: 0,
        totalGroupCalls: 0,
        totalGroupAttendees: 0,
      },
    );
  }, [weeks]);

  return {
    startDate,
    updateStartDate: setStartDate,
    weeks,
    summary,
    hasSelectedStartDate: startDate.length > 0,
    isLoading: loading,
    error,
    refetch,
  };
}
