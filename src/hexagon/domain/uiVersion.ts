import type { AppUser } from '@learncraft-spanish/shared';

export type UiVersion = 'v1' | 'v2';

/**
 * Coaches and admins (`isStaff`, from auth roles) always get v2 chrome.
 * Everyone else needs their own record to be a beta-tester student.
 */
export function resolveStudentUiVersion(
  user: Pick<AppUser, 'studentRole' | 'betaTester'> | null,
  isStaff = false,
): UiVersion {
  if (isStaff) {
    return 'v2';
  }
  if (!user) {
    return 'v1';
  }
  return user.studentRole === 'student' && user.betaTester ? 'v2' : 'v1';
}
