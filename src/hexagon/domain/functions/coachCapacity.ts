import type { TableRow, TableSort } from '@domain/PasteTable';
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

/** The columns admins can sort the report by */
export type CoachCapacitySortColumnId = Extract<
  CoachCapacityColumnId,
  'committedHours' | 'bookedPercent'
>;

export interface CoachCapacitySort extends TableSort {
  columnId: CoachCapacitySortColumnId;
}

/** Least booked coaches first, the order the report opens in */
export const DEFAULT_COACH_CAPACITY_SORT: CoachCapacitySort = {
  columnId: 'bookedPercent',
  direction: 'ascending',
};

export function isCoachCapacitySortColumnId(
  id: string,
): id is CoachCapacitySortColumnId {
  return id === 'committedHours' || id === 'bookedPercent';
}

/**
 * The sort after the admin clicks a sortable header. A newly clicked column
 * sorts ascending. Booked % then switches between ascending and descending;
 * Committed Hours goes descending, then back to the default sort.
 */
export function nextCoachCapacitySort(
  current: CoachCapacitySort,
  columnId: CoachCapacitySortColumnId,
): CoachCapacitySort {
  if (current.columnId !== columnId) {
    return { columnId, direction: 'ascending' };
  }
  if (current.direction === 'ascending') {
    return { columnId, direction: 'descending' };
  }
  return columnId === 'bookedPercent'
    ? { columnId, direction: 'ascending' }
    : DEFAULT_COACH_CAPACITY_SORT;
}

/**
 * Rows by the sorted column, ties broken by coach name A to Z. By Booked %,
 * coaches with no Desired Hours come first in either direction. The contract
 * leaves Booked % null exactly when Desired Hours is null or 0, so a null
 * Booked % marks a coach without them.
 */
export function sortCoachCapacityRows(
  rows: readonly CoachCapacityReportRow[],
  sort: CoachCapacitySort,
): CoachCapacityReportRow[] {
  const sign = sort.direction === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const aValue = a[sort.columnId];
    const bValue = b[sort.columnId];
    if (aValue === null && bValue !== null) return -1;
    if (aValue !== null && bValue === null) return 1;
    const byColumn = sign * ((aValue ?? 0) - (bValue ?? 0));
    if (byColumn !== 0) return byColumn;
    return a.coach.fullName.localeCompare(b.coach.fullName);
  });
}

/**
 * Rows in `keptOrder` stay in that order; rows it does not have follow in
 * `sortedIds` order. Lets rows hold still while an admin edits them.
 */
export function keepRowOrder(
  sortedIds: readonly string[],
  keptOrder: readonly string[],
): string[] {
  const current = new Set(sortedIds);
  const kept = keptOrder.filter((id) => current.has(id));
  const keptIds = new Set(kept);
  return [...kept, ...sortedIds.filter((id) => !keptIds.has(id))];
}

/** Each weekly group session counts as this many Coaching Hours */
export const GROUP_SESSION_HOURS = 1;

/** The report values that follow from a coach's hours and settings */
export type CoachCapacityTotals = Pick<
  CoachCapacityReportRow,
  | 'groupSessionHours'
  | 'coachingHours'
  | 'nonCoachingHours'
  | 'committedHours'
  | 'bookedPercent'
>;

/**
 * Private Call and Admin Time hours come from the report; everything else
 * follows from the settings. Booked % is null when Desired Hours is null or 0.
 */
export function computeCoachCapacityTotals(
  hours: Pick<CoachCapacityReportRow, 'privateCallHours' | 'adminTimeHours'>,
  settings: CoachCapacitySettings,
): CoachCapacityTotals {
  const groupSessionHours = settings.groupSessionsPerWeek * GROUP_SESSION_HOURS;
  const coachingHours =
    hours.privateCallHours + hours.adminTimeHours + groupSessionHours;
  const nonCoachingHours =
    settings.projectsHours +
    settings.internalTimeHours +
    settings.teamMeetingHours;
  const committedHours = coachingHours + nonCoachingHours;
  const bookedPercent = settings.desiredHours
    ? (committedHours * 100) / settings.desiredHours
    : null;
  return {
    groupSessionHours,
    coachingHours,
    nonCoachingHours,
    committedHours,
    bookedPercent,
  };
}

/** The row as the report would show it with `settings` saved */
export function applyCoachCapacitySettings(
  row: CoachCapacityReportRow,
  settings: CoachCapacitySettings,
): CoachCapacityReportRow {
  return { ...row, settings, ...computeCoachCapacityTotals(row, settings) };
}

export function formatCoachCapacityHours(hours: number | null): string {
  return hours === null ? NOT_SET_DISPLAY : hours.toFixed(2);
}

export function formatBookedPercent(bookedPercent: number | null): string {
  return bookedPercent === null
    ? NOT_SET_DISPLAY
    : `${Math.round(bookedPercent)}%`;
}

export type CoachCapacityTotalsColumnId = Extract<
  CoachCapacityColumnId,
  'coachingHours' | 'committedHours' | 'bookedPercent'
>;

export function formatCoachCapacityTotalsCells(
  row: Pick<
    CoachCapacityReportRow,
    'coachingHours' | 'committedHours' | 'bookedPercent'
  >,
): Record<CoachCapacityTotalsColumnId, string> {
  return {
    coachingHours: formatCoachCapacityHours(row.coachingHours),
    committedHours: formatCoachCapacityHours(row.committedHours),
    bookedPercent: formatBookedPercent(row.bookedPercent),
  };
}

/**
 * Editable cells hold input values, so a coach without Desired Hours gets an
 * empty Desired Hours cell rather than the "not set" dash.
 */
export function formatCoachCapacitySettingsCells(
  settings: CoachCapacitySettings,
): Record<CoachCapacitySettingsColumnId, string> {
  return {
    groupSessionsPerWeek: String(settings.groupSessionsPerWeek),
    projectsHours: formatCoachCapacityHours(settings.projectsHours),
    internalTimeHours: formatCoachCapacityHours(settings.internalTimeHours),
    teamMeetingHours: formatCoachCapacityHours(settings.teamMeetingHours),
    desiredHours:
      settings.desiredHours === null
        ? ''
        : formatCoachCapacityHours(settings.desiredHours),
  };
}

export function mapCoachCapacityRowToTableRow(
  row: CoachCapacityReportRow,
): TableRow {
  const cells: Record<CoachCapacityColumnId, string> = {
    coach: row.coach.fullName,
    ...formatCoachCapacityTotalsCells(row),
    ...formatCoachCapacitySettingsCells(row.settings),
    notes: row.settings.notes,
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

/** The cells' values as numbers, not yet validated */
function readSettingsCells(
  cells: Record<string, string>,
): Omit<CoachCapacitySettings, 'notes'> {
  const desiredHours = (cells.desiredHours ?? '').trim();
  return {
    groupSessionsPerWeek: parseCellNumber(cells.groupSessionsPerWeek),
    projectsHours: parseCellNumber(cells.projectsHours),
    internalTimeHours: parseCellNumber(cells.internalTimeHours),
    teamMeetingHours: parseCellNumber(cells.teamMeetingHours),
    desiredHours: desiredHours === '' ? null : parseCellNumber(desiredHours),
  };
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
  const result = coachCapacitySettingsSchema.safeParse({
    ...readSettingsCells(cells),
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

/**
 * Settings from the cells that are valid, taking each invalid cell's value
 * (and the notes) from `fallback`. Passing the settings last resolved for a
 * row keeps an invalid cell at the last valid value it had.
 */
export function resolveCoachCapacitySettingsCells(
  cells: Record<string, string>,
  fallback: CoachCapacitySettings,
): CoachCapacitySettings {
  const parsed = parseCoachCapacitySettingsCells(cells, fallback.notes);
  if (parsed.success) return parsed.settings;

  const values: CoachCapacitySettings = {
    ...readSettingsCells(cells),
    notes: fallback.notes,
  };
  const pick = <Field extends CoachCapacitySettingsColumnId>(
    field: Field,
  ): CoachCapacitySettings[Field] =>
    field in parsed.errors ? fallback[field] : values[field];
  return {
    groupSessionsPerWeek: pick('groupSessionsPerWeek'),
    projectsHours: pick('projectsHours'),
    internalTimeHours: pick('internalTimeHours'),
    teamMeetingHours: pick('teamMeetingHours'),
    desiredHours: pick('desiredHours'),
    notes: fallback.notes,
  };
}
