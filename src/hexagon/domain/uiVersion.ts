import type { AppUser } from '@learncraft-spanish/shared';

export type UiVersion = 'v1' | 'v2';

export function resolveStudentUiVersion(
  user: Pick<AppUser, 'studentRole' | 'betaTester'> | null,
): UiVersion {
  if (!user) {
    return 'v1';
  }
  return user.studentRole === 'student' && user.betaTester ? 'v2' : 'v1';
}
