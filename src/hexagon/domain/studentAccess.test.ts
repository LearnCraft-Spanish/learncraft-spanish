import {
  canAccessStudentTools,
  canUseAsStudent,
  filterStudentsBySearch,
  resolveHomeView,
  sortStudents,
} from '@domain/studentAccess';
import { describe, expect, it } from 'vitest';

const students = [
  { name: 'Zoe Park', emailAddress: 'zoe@example.com' },
  { name: 'Ana Ruiz', emailAddress: 'ana.b@example.com' },
  { name: 'Ana Ruiz', emailAddress: 'ana.a@example.com' },
  { name: 'Ben Cho', emailAddress: 'bcho@school.edu' },
];

describe('canUseAsStudent', () => {
  it('allows a full student', () => {
    expect(canUseAsStudent({ studentRole: 'student' })).toBe(true);
  });

  it('rejects a limited user', () => {
    expect(canUseAsStudent({ studentRole: 'limited' })).toBe(false);
  });

  it('rejects a user with no student role', () => {
    expect(canUseAsStudent({ studentRole: 'none' })).toBe(false);
  });

  it('rejects a missing record', () => {
    expect(canUseAsStudent(null)).toBe(false);
  });
});

describe('canAccessStudentTools', () => {
  it('allows non-staff', () => {
    expect(
      canAccessStudentTools({ isStaff: false, isUsingAsStudent: false }),
    ).toBe(true);
  });

  it('blocks staff who are not using the app as a student', () => {
    expect(
      canAccessStudentTools({ isStaff: true, isUsingAsStudent: false }),
    ).toBe(false);
  });

  it('allows staff who are using the app as a student', () => {
    expect(
      canAccessStudentTools({ isStaff: true, isUsingAsStudent: true }),
    ).toBe(true);
  });
});

describe('resolveHomeView', () => {
  it('shows staff tools to staff who are not using the app as a student', () => {
    expect(
      resolveHomeView({
        isStaff: true,
        isUsingAsStudent: false,
        version: 'v2',
      }),
    ).toBe('staffTools');
  });

  it('shows the v2 student home to staff using the app as a student', () => {
    expect(
      resolveHomeView({ isStaff: true, isUsingAsStudent: true, version: 'v2' }),
    ).toBe('studentV2');
  });

  it('shows the v2 student home to a beta-tester student', () => {
    expect(
      resolveHomeView({
        isStaff: false,
        isUsingAsStudent: false,
        version: 'v2',
      }),
    ).toBe('studentV2');
  });

  it('shows the legacy menu to a v1 student', () => {
    expect(
      resolveHomeView({
        isStaff: false,
        isUsingAsStudent: false,
        version: 'v1',
      }),
    ).toBe('legacyMenu');
  });
});

describe('sortStudents', () => {
  it('sorts by name, then email, without mutating the input', () => {
    const input = [...students];
    expect(sortStudents(input).map((s) => s.emailAddress)).toEqual([
      'ana.a@example.com',
      'ana.b@example.com',
      'bcho@school.edu',
      'zoe@example.com',
    ]);
    expect(input).toEqual(students);
  });
});

describe('filterStudentsBySearch', () => {
  it('returns nothing for an empty search', () => {
    expect(filterStudentsBySearch(students, '')).toEqual([]);
  });

  it('matches names case-insensitively, sorted', () => {
    expect(
      filterStudentsBySearch(students, 'ANA').map((s) => s.emailAddress),
    ).toEqual(['ana.a@example.com', 'ana.b@example.com']);
  });

  it('matches email addresses', () => {
    expect(filterStudentsBySearch(students, 'school.edu')).toEqual([
      { name: 'Ben Cho', emailAddress: 'bcho@school.edu' },
    ]);
  });

  it('returns nothing when no student matches', () => {
    expect(filterStudentsBySearch(students, 'nobody')).toEqual([]);
  });
});
