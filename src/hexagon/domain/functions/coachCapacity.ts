import type { TableRow } from '@domain/PasteTable';
import type { CoachCapacityReportRow } from '@learncraft-spanish/shared';

/** Shown in place of a value a coach has not been set up with */
export const NOT_SET_DISPLAY = '—';

export type CoachCapacityColumnId =
  | 'coach'
  | 'coachingHours'
  | 'groupSessionsPerWeek'
  | 'projectsHours'
  | 'internalTimeHours'
  | 'teamMeetingHours'
  | 'committedHours'
  | 'desiredHours'
  | 'bookedPercent'
  | 'notes';

/**
 * Least booked coaches first: coaches with no Desired Hours, then Booked %
 * ascending, then coach name. The contract leaves Booked % null exactly when
 * Desired Hours is null or 0, so a null Booked % marks a coach without them.
 */
export function sortCoachCapacityRows(
  rows: readonly CoachCapacityReportRow[],
): CoachCapacityReportRow[] {
  return [...rows].sort((a, b) => {
    if (a.bookedPercent === null && b.bookedPercent !== null) return -1;
    if (a.bookedPercent !== null && b.bookedPercent === null) return 1;
    const byBookedPercent = (a.bookedPercent ?? 0) - (b.bookedPercent ?? 0);
    if (byBookedPercent !== 0) return byBookedPercent;
    return a.coach.fullName.localeCompare(b.coach.fullName);
  });
}

export function formatCoachCapacityHours(hours: number | null): string {
  return hours === null ? NOT_SET_DISPLAY : hours.toFixed(2);
}

export function formatBookedPercent(bookedPercent: number | null): string {
  return bookedPercent === null
    ? NOT_SET_DISPLAY
    : `${Math.round(bookedPercent)}%`;
}

export function mapCoachCapacityRowToTableRow(
  row: CoachCapacityReportRow,
): TableRow {
  const cells: Record<CoachCapacityColumnId, string> = {
    coach: row.coach.fullName,
    coachingHours: formatCoachCapacityHours(row.coachingHours),
    groupSessionsPerWeek: String(row.settings.groupSessionsPerWeek),
    projectsHours: formatCoachCapacityHours(row.settings.projectsHours),
    internalTimeHours: formatCoachCapacityHours(row.settings.internalTimeHours),
    teamMeetingHours: formatCoachCapacityHours(row.settings.teamMeetingHours),
    committedHours: formatCoachCapacityHours(row.committedHours),
    desiredHours: formatCoachCapacityHours(row.settings.desiredHours),
    bookedPercent: formatBookedPercent(row.bookedPercent),
    notes: row.settings.notes,
  };
  return { id: String(row.coach.coach_id), cells };
}
