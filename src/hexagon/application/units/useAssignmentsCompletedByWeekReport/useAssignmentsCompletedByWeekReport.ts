import type { WeekStartsOption } from '@domain/functions/assignmentsReportWeekStarts';
import type { AssignmentsCompletedByWeek } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { useAssignmentsCompletedByWeekReportQuery } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';
import {
  getDefaultAssignmentsReportWeekStarts,
  getWeekStartsOptions,
} from '@domain/functions/assignmentsReportWeekStarts';
import { useMemo, useState } from 'react';

const INITIAL_NUM_WEEKS = 4;
const LOAD_MORE_SENTINEL = 'loadMore';

export interface UseAssignmentsCompletedByWeekReportReturn {
  weekStarts: string;
  weekOptions: WeekStartsOption[];
  selectWeekStarts: (value: string) => void;
  assignmentsCompletedByWeekQuery: UseQueryResult<AssignmentsCompletedByWeek[]>;
}

export function useAssignmentsCompletedByWeekReport(): UseAssignmentsCompletedByWeekReportReturn {
  const [weekStarts, setWeekStarts] = useState(
    getDefaultAssignmentsReportWeekStarts,
  );
  const [numWeeks, setNumWeeks] = useState(INITIAL_NUM_WEEKS);

  const weekOptions = useMemo(() => getWeekStartsOptions(numWeeks), [numWeeks]);

  const { assignmentsCompletedByWeekReportQuery } =
    useAssignmentsCompletedByWeekReportQuery(weekStarts);

  const selectWeekStarts = (value: string): void => {
    if (value === LOAD_MORE_SENTINEL) {
      setNumWeeks((prev) => prev * 2);
      return;
    }
    setWeekStarts(value);
  };

  return {
    weekStarts,
    weekOptions,
    selectWeekStarts,
    assignmentsCompletedByWeekQuery: assignmentsCompletedByWeekReportQuery,
  };
}

export { LOAD_MORE_SENTINEL };
