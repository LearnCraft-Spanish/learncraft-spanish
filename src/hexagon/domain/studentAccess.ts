import type { UiVersion } from '@domain/uiVersion';
import type { AppUser, AppUserAbbreviation } from '@learncraft-spanish/shared';

export type HomeView = 'studentV2' | 'staffTools' | 'legacyMenu';

/**
 * What `/` shows. Staff see their coaching/admin tools until they use the
 * app as a student; then they (and everyone else) follow the UI version.
 */
export function resolveHomeView({
  isStaff,
  isUsingAsStudent,
  version,
}: {
  isStaff: boolean;
  isUsingAsStudent: boolean;
  version: UiVersion;
}): HomeView {
  if (isStaff && !isUsingAsStudent) return 'staffTools';
  return version === 'v2' ? 'studentV2' : 'legacyMenu';
}

/** Coaches and admins may only use the app as a full student. */
export function canUseAsStudent(
  user: Pick<AppUser, 'studentRole'> | null,
): boolean {
  return user?.studentRole === 'student';
}

/**
 * Student tools (flashcards, quizzes, finder) are off-limits to staff until
 * they choose a student to use the app as. Non-staff are gated elsewhere.
 */
export function canAccessStudentTools({
  isStaff,
  isUsingAsStudent,
}: {
  isStaff: boolean;
  isUsingAsStudent: boolean;
}): boolean {
  return !isStaff || isUsingAsStudent;
}

function compareStudents(
  a: AppUserAbbreviation,
  b: AppUserAbbreviation,
): number {
  if (a.name > b.name) return 1;
  if (a.name < b.name) return -1;
  if (a.emailAddress > b.emailAddress) return 1;
  if (a.emailAddress < b.emailAddress) return -1;
  return 0;
}

export function sortStudents(
  students: AppUserAbbreviation[],
): AppUserAbbreviation[] {
  return [...students].sort(compareStudents);
}

/**
 * Case-insensitive name-or-email match, sorted by name then email. An empty
 * search returns no options.
 */
export function filterStudentsBySearch(
  students: AppUserAbbreviation[],
  searchTerm: string,
): AppUserAbbreviation[] {
  if (searchTerm === '') return [];
  const term = searchTerm.toLowerCase();
  return sortStudents(students).filter(
    (student) =>
      student.name.toLowerCase().includes(term) ||
      student.emailAddress.toLowerCase().includes(term),
  );
}
