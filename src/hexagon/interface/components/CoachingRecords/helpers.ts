import type { FurnishedWeekWithCoach } from '@learncraft-spanish/shared';

export interface AttendeeSelection {
  weekId: number;
  studentFullName: string;
}

export function formatDateInput(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return '';
  }

  if (date instanceof Date) {
    return date.toISOString().split('T')[0];
  }

  return date.split('T')[0];
}

export function formatDateInputWithDefault(
  date: Date | string | null | undefined,
): string {
  if (!date) {
    return new Date().toISOString().split('T')[0];
  }

  return formatDateInput(date);
}

export function subtractWeeks(dateStr: string, weeks: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day - weeks * 7);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function toShortReadableMonthDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getWeekStartsFromDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - date.getDay());
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function getSortedWeekIds(attendees: AttendeeSelection[]): number[] {
  return attendees.map((attendee) => attendee.weekId).sort((a, b) => a - b);
}

function normalizeStudentName(name: string): string {
  return name.trim().toLowerCase();
}

export function remapAttendeesByName(
  attendeeNames: string[],
  weeks: FurnishedWeekWithCoach[],
): AttendeeSelection[] {
  return attendeeNames.flatMap((attendeeName) => {
    const matchedWeek = weeks.find(
      (week) =>
        normalizeStudentName(week.student?.fullName || '') ===
        normalizeStudentName(attendeeName),
    );

    if (!matchedWeek) {
      return [];
    }

    return [
      {
        weekId: matchedWeek.weekId,
        studentFullName: matchedWeek.student?.fullName || attendeeName,
      },
    ];
  });
}

export function hasSameAttendeeWeekIds(
  currentAttendees: AttendeeSelection[],
  originalWeekIds: number[],
): boolean {
  const currentWeekIds = getSortedWeekIds(currentAttendees);
  const sortedOriginalWeekIds = [...originalWeekIds].sort((a, b) => a - b);

  return (
    currentWeekIds.length === sortedOriginalWeekIds.length &&
    currentWeekIds.every(
      (weekId, index) => weekId === sortedOriginalWeekIds[index],
    )
  );
}
