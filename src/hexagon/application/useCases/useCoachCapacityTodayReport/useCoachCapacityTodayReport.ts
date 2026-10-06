import type { CoachCapacityColumnId } from '@domain/functions/coachCapacity';
import type { ColumnDefinition, TableRow } from '@domain/PasteTable';
import { useCoachCapacityTodayReportQuery } from '@application/queries/AdminReportQueries/useCoachCapacityTodayReportQuery';
import {
  mapCoachCapacityRowToTableRow,
  sortCoachCapacityRows,
} from '@domain/functions/coachCapacity';
import { useMemo } from 'react';

export interface UseCoachCapacityTodayReportResult {
  rows: TableRow[];
  columns: ColumnDefinition[];
  isLoading: boolean;
  isError: boolean;
}

const coachCapacityColumns: (ColumnDefinition & {
  id: CoachCapacityColumnId;
})[] = [
  { id: 'coach', type: 'read-only', editable: false },
  { id: 'coachingHours', type: 'number', editable: false, derived: true },
  { id: 'groupSessionsPerWeek', type: 'number', editable: false },
  { id: 'projectsHours', type: 'number', editable: false },
  { id: 'internalTimeHours', type: 'number', editable: false },
  { id: 'teamMeetingHours', type: 'number', editable: false },
  { id: 'committedHours', type: 'number', editable: false, derived: true },
  { id: 'desiredHours', type: 'number', editable: false },
  { id: 'bookedPercent', type: 'read-only', editable: false, derived: true },
  { id: 'notes', type: 'textarea', editable: false },
];

export function useCoachCapacityTodayReport(): UseCoachCapacityTodayReportResult {
  const { coachCapacityTodayReportQuery } = useCoachCapacityTodayReportQuery();
  const { data, isLoading, isError } = coachCapacityTodayReportQuery;

  const rows = useMemo(
    () => sortCoachCapacityRows(data ?? []).map(mapCoachCapacityRowToTableRow),
    [data],
  );

  return { rows, columns: coachCapacityColumns, isLoading, isError };
}
