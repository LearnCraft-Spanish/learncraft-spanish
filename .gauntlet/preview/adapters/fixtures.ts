import type { AppUser } from '@learncraft-spanish/shared';

import type { PreviewRole } from './previewRole';
import { emailForRole } from './previewRole';

function flagsForceV1(): boolean {
  const raw = new URLSearchParams(window.location.search).get('flags');
  return raw === 'off' || raw === '0' || raw === 'false';
}

const previewCoach: AppUser = {
  name: 'Gauntlet Coach',
  emailAddress: emailForRole('coach'),
  recordId: 2,
  courseId: 2,
  lessonNumber: 1,
  studentRole: 'none',
  betaTester: false,
};

const previewAdmin: AppUser = {
  name: 'Gauntlet Admin',
  emailAddress: emailForRole('admin'),
  recordId: 3,
  courseId: 2,
  lessonNumber: 1,
  studentRole: 'none',
  betaTester: false,
};

const previewLimited: AppUser = {
  name: 'Gauntlet Limited',
  emailAddress: emailForRole('limited'),
  recordId: 4,
  courseId: 2,
  lessonNumber: 1,
  studentRole: 'limited',
  betaTester: false,
};

function previewStudent(): AppUser {
  return {
    name: 'Gauntlet Student',
    emailAddress: emailForRole('student'),
    recordId: 1,
    courseId: 2,
    lessonNumber: 1,
    studentRole: 'student',
    betaTester: !flagsForceV1(),
  };
}

/**
 * AppUser fixture for the current preview role.
 * `free` has no app-user record (`null`).
 */
export function previewUserForRole(role: PreviewRole): AppUser | null {
  switch (role) {
    case 'student':
      return previewStudent();
    case 'coach':
      return previewCoach;
    case 'admin':
      return previewAdmin;
    case 'limited':
      return previewLimited;
    case 'free':
      return null;
  }
}

/**
 * The four non-null fixture users (student, limited, coach, admin).
 * Student `betaTester` respects `?flags=`.
 */
export function previewFixtureUsers(): AppUser[] {
  return [previewStudent(), previewLimited, previewCoach, previewAdmin];
}
