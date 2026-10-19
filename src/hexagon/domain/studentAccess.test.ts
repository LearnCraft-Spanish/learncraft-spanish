import {
  canAccessStudentTools,
  canCollectFlashcards,
  canUseAsStudent,
  filterStudentsBySearch,
  resolveHomeView,
  showsStudentNav,
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

  it('blocks staff from an explicitly student-scoped tool', () => {
    expect(
      canAccessStudentTools({
        isStaff: true,
        isUsingAsStudent: false,
        scope: 'student',
      }),
    ).toBe(false);
  });

  it('lets staff open catalog tools without using the app as a student', () => {
    expect(
      canAccessStudentTools({
        isStaff: true,
        isUsingAsStudent: false,
        scope: 'catalog',
      }),
    ).toBe(true);
  });

  it('keeps catalog tools open to staff using the app as a student', () => {
    expect(
      canAccessStudentTools({
        isStaff: true,
        isUsingAsStudent: true,
        scope: 'catalog',
      }),
    ).toBe(true);
  });

  it('keeps catalog tools open to non-staff', () => {
    expect(
      canAccessStudentTools({
        isStaff: false,
        isUsingAsStudent: false,
        scope: 'catalog',
      }),
    ).toBe(true);
  });
});

describe('canCollectFlashcards', () => {
  it('lets non-staff collect', () => {
    expect(
      canCollectFlashcards({ isStaff: false, isUsingAsStudent: false }),
    ).toBe(true);
  });

  it('keeps staff who are not using the app as a student read-only', () => {
    expect(
      canCollectFlashcards({ isStaff: true, isUsingAsStudent: false }),
    ).toBe(false);
  });

  it('lets staff collect while using the app as a student', () => {
    expect(
      canCollectFlashcards({ isStaff: true, isUsingAsStudent: true }),
    ).toBe(true);
  });
});

describe('resolveHomeView', () => {
  const noRoles = {
    isStaff: false,
    isUsingAsStudent: false,
    isStudent: false,
    isLimited: false,
  };

  it('shows staff tools to staff who are not using the app as a student', () => {
    expect(resolveHomeView({ ...noRoles, isStaff: true })).toBe('staffTools');
  });

  it('shows staff tools to staff who also hold the Student role', () => {
    expect(
      resolveHomeView({ ...noRoles, isStaff: true, isStudent: true }),
    ).toBe('staffTools');
  });

  it('shows the student home to staff using the app as a student', () => {
    expect(
      resolveHomeView({ ...noRoles, isStaff: true, isUsingAsStudent: true }),
    ).toBe('student');
  });

  it('shows the student home to a student', () => {
    expect(resolveHomeView({ ...noRoles, isStudent: true })).toBe('student');
  });

  it('shows the limited home to a limited user', () => {
    expect(resolveHomeView({ ...noRoles, isLimited: true })).toBe('limited');
  });

  it('shows the free home to a signed-in user with no other role', () => {
    expect(resolveHomeView(noRoles)).toBe('free');
  });
});

describe('showsStudentNav', () => {
  it('shows the student nav on the student home view', () => {
    expect(showsStudentNav('student')).toBe(true);
  });

  it('hides the student nav from staff, limited, and free views', () => {
    expect(showsStudentNav('staffTools')).toBe(false);
    expect(showsStudentNav('limited')).toBe(false);
    expect(showsStudentNav('free')).toBe(false);
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
