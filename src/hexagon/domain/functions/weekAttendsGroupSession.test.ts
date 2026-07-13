import { weekAttendsGroupSession } from '@domain/functions/weekAttendsGroupSession';
import { baseGroupSessionFactory } from '@testing/factories/groupCallsFactory';
import { describe, expect, it } from 'vitest';

const makeAttendee = (weekId: number) => ({
  weekId,
  groupAttendeeId: weekId,
  groupSessionId: 1,
  studentFullName: 'Test Student',
});

describe('weekAttendsGroupSession', () => {
  it('should return true when an attendee weekId matches', () => {
    const groupSession = baseGroupSessionFactory({
      attendees: [makeAttendee(42)],
    });

    expect(weekAttendsGroupSession({ groupSession, weekId: 42 })).toBe(true);
  });

  it('should return false when no attendee weekId matches', () => {
    const groupSession = baseGroupSessionFactory({
      attendees: [makeAttendee(1), makeAttendee(2)],
    });

    expect(weekAttendsGroupSession({ groupSession, weekId: 99 })).toBe(false);
  });

  it('should return false when attendees array is empty', () => {
    const groupSession = baseGroupSessionFactory({ attendees: [] });

    expect(weekAttendsGroupSession({ groupSession, weekId: 1 })).toBe(false);
  });

  it('should return true when one of multiple attendees matches', () => {
    const groupSession = baseGroupSessionFactory({
      attendees: [makeAttendee(10), makeAttendee(20), makeAttendee(30)],
    });

    expect(weekAttendsGroupSession({ groupSession, weekId: 20 })).toBe(true);
  });
});
