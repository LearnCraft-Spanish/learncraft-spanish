import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';
import { useWeeksByStartDate } from '@application/queries/useWeeksByStartDate/useWeeksByStartDate';
import {
  filterIncompleteWeeksForCoach,
  getDefaultIncompleteRecordsWeekStart,
} from '@domain/functions/incompleteWeeksForCoach';
import { useMemo } from 'react';

export interface UseIncompleteWeeksForCoachReturn {
  weeks: FurnishedWeekWithCoach[];
  startDate: string;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useIncompleteWeeksForCoach(
  coachId: number,
): UseIncompleteWeeksForCoachReturn {
  const startDate = useMemo(() => getDefaultIncompleteRecordsWeekStart(), []);
  const { weeks, loading, error, refetch } = useWeeksByStartDate(startDate);

  const filteredWeeks = useMemo(
    () => filterIncompleteWeeksForCoach(weeks, coachId),
    [weeks, coachId],
  );

  return {
    weeks: filteredWeeks,
    startDate,
    loading,
    error,
    refetch,
  };
}
