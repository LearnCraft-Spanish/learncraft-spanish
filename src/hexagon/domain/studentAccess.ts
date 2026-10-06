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
 * `catalog` tools (Flashcard Finder, Custom Quiz) read the shared example
 * catalog. Every other student tool (`student`) reads one student's records.
 */
export type StudentToolScope = 'student' | 'catalog';

/**
 * Student tools (flashcards, quizzes) are off-limits to staff until they
 * choose a student to use the app as. Catalog tools are the exception: staff
 * may browse them without one, read-only (see `canCollectFlashcards`).
 * Non-staff are gated elsewhere.
 */
export function canAccessStudentTools({
  isStaff,
  isUsingAsStudent,
  scope = 'student',
}: {
  isStaff: boolean;
  isUsingAsStudent: boolean;
  scope?: StudentToolScope;
}): boolean {
  if (scope === 'catalog') return true;
  return !isStaff || isUsingAsStudent;
}

/**
 * Adding or removing flashcards needs a student to own them, so staff who
 * are not using the app as a student only browse the catalog tools.
 */
export function canCollectFlashcards({
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
