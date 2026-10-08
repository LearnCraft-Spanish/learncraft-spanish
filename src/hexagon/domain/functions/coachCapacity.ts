import type { TableRow } from '@domain/PasteTable';
import type {
  CoachCapacityReportRow,
  CoachCapacitySettings,
  CountedMembership,
} from '@learncraft-spanish/shared';
import { fromISODate, toReadableDate } from '@domain/functions/dateUtils';
import { coachCapacitySettingsSchema } from '@learncraft-spanish/shared';

/** Shown in place of a value a coach has not been set up with */
export const NOT_SET_DISPLAY = '—';

/**
 * The time frames Coach Capacity is reported for. Both reports have the same
 * rows and settings; only the Coaching Hours (and so Committed Hours and
 * Booked %) differ.
 */
export type CoachCapacityPeriod = 'today' | 'twoWeeksOut';

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

/** The settings admins edit inline in the report's cells */
export type CoachCapacitySettingsColumnId = Exclude<
  keyof CoachCapacitySettings,
  'notes'
>;

const HOURS_ERROR = 'Enter hours from 0 to 40 in steps of 0.25';

const settingsErrors: Record<CoachCapacitySettingsColumnId, string> = {
  groupSessionsPerWeek: 'Enter a whole number from 0 to 40',
  projectsHours: HOURS_ERROR,
  internalTimeHours: HOURS_ERROR,
  teamMeetingHours: HOURS_ERROR,
  desiredHours: HOURS_ERROR,
};

function isSettingsColumnId(
  id: string | number | undefined,
): id is CoachCapacitySettingsColumnId {
  return typeof id === 'string' && id in settingsErrors;
}

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

/**
 * Editable cells hold input values, so a coach without Desired Hours gets an
 * empty Desired Hours cell rather than the "not set" dash.
 */
export function mapCoachCapacityRowToTableRow(
  row: CoachCapacityReportRow,
): TableRow {
  const { settings } = row;
  const cells: Record<CoachCapacityColumnId, string> = {
    coach: row.coach.fullName,
    coachingHours: formatCoachCapacityHours(row.coachingHours),
    groupSessionsPerWeek: String(settings.groupSessionsPerWeek),
    projectsHours: formatCoachCapacityHours(settings.projectsHours),
    internalTimeHours: formatCoachCapacityHours(settings.internalTimeHours),
    teamMeetingHours: formatCoachCapacityHours(settings.teamMeetingHours),
    committedHours: formatCoachCapacityHours(row.committedHours),
    desiredHours:
      settings.desiredHours === null
        ? ''
        : formatCoachCapacityHours(settings.desiredHours),
    bookedPercent: formatBookedPercent(row.bookedPercent),
    notes: settings.notes,
  };
  return { id: String(row.coach.coach_id), cells };
}

/** One counted membership as the Coaching Hours drilldown shows it */
export interface CountedMembershipDisplayRow {
  id: string;
  student: string;
  course: string;
  startDate: string;
  endDate: string;
  weeklyPrivateCalls: string;
  /** In hours, so it adds up with the report's Coaching Hours */
  weeklyAdminTime: string;
}

function formatMembershipDate(date: string | null): string {
  if (!date) return NOT_SET_DISPLAY;
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? toReadableDate(fromISODate(date))
    : date;
}

/** Memberships have no ID in the report, so rows are keyed by position */
export function mapCountedMembershipsToDisplayRows(
  memberships: readonly CountedMembership[],
): CountedMembershipDisplayRow[] {
  return memberships.map((membership, index) => ({
    id: String(index),
    student: membership.studentName,
    course: membership.courseName,
    startDate: formatMembershipDate(membership.startDate),
    endDate: formatMembershipDate(membership.endDate),
    weeklyPrivateCalls: String(membership.courseWeeklyPrivateCalls),
    weeklyAdminTime: formatCoachCapacityHours(
      membership.courseWeeklyAdminTimeMinutes / 60,
    ),
  }));
}

export type CoachCapacitySettingsParseResult =
  | { success: true; settings: CoachCapacitySettings }
  | {
      success: false;
      errors: Partial<Record<CoachCapacitySettingsColumnId, string>>;
    };

function parseCellNumber(value: string | undefined): number {
  const trimmed = (value ?? '').trim();
  return trimmed === '' ? Number.NaN : Number(trimmed);
}

/**
 * Reads a coach's full settings from their row's cells, validated by the
 * shared schema. An empty Desired Hours cell means Desired Hours is not set.
 * Notes are not edited in a cell, so the caller supplies them.
 */
export function parseCoachCapacitySettingsCells(
  cells: Record<string, string>,
  notes: string,
): CoachCapacitySettingsParseResult {
  const desiredHours = (cells.desiredHours ?? '').trim();
  const result = coachCapacitySettingsSchema.safeParse({
    groupSessionsPerWeek: parseCellNumber(cells.groupSessionsPerWeek),
    projectsHours: parseCellNumber(cells.projectsHours),
    internalTimeHours: parseCellNumber(cells.internalTimeHours),
    teamMeetingHours: parseCellNumber(cells.teamMeetingHours),
    desiredHours: desiredHours === '' ? null : parseCellNumber(desiredHours),
    notes,
  });

  if (result.success) {
    return { success: true, settings: result.data };
  }

  const errors: Partial<Record<CoachCapacitySettingsColumnId, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (isSettingsColumnId(field)) {
      errors[field] = settingsErrors[field];
    }
  }
  return { success: false, errors };
}
