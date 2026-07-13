import type { BaseGroupSession } from '@learncraft-spanish/shared';

export function weekAttendsGroupSession({
  groupSession,
  weekId,
}: {
  groupSession: BaseGroupSession;
  weekId: number;
}): boolean {
  return groupSession.attendees.some((attendee) => attendee.weekId === weekId);
}
