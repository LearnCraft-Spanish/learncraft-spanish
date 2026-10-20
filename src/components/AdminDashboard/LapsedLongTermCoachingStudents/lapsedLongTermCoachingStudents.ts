import type {
  LapsedLongTermCoachingMembership,
  LapsedLongTermCoachingStudent,
} from '@learncraft-spanish/shared';

/** Coach select value for every coach. An empty membership-type selection means every type. */
export const LAPSED_STUDENT_ALL = '__all__';

export type LapsedStudentSortColumn = 'mostRecent' | 'coach' | 'membershipType';

export type LapsedStudentSortDirection = 'ascending' | 'descending';

export interface LapsedStudentSort {
  column: LapsedStudentSortColumn;
  direction: LapsedStudentSortDirection;
}

/** Newest ended membership first. */
export const DEFAULT_LAPSED_STUDENT_SORT: LapsedStudentSort = {
  column: 'mostRecent',
  direction: 'descending',
};

export interface LapsedStudentFilters {
  coach: string;
  /** Case-insensitive text matched against name or email. Blank matches all. */
  search: string;
  /** Course names to keep. Empty means every membership type. */
  membershipTypes: readonly string[];
}

export interface LapsedStudentFilterOption {
  value: string;
  label: string;
}

const MISSING_DATE = '0000-00-00';

const SORT_COLUMNS: readonly LapsedStudentSortColumn[] = [
  'mostRecent',
  'coach',
  'membershipType',
];

export function isLapsedStudentSortColumn(
  value: string,
): value is LapsedStudentSortColumn {
  return (SORT_COLUMNS as readonly string[]).includes(value);
}

/**
 * The sort for a newly chosen column. Most recent opens newest-first.
 * Coach and membership type open A to Z.
 */
export function lapsedStudentSortForColumn(
  column: LapsedStudentSortColumn,
): LapsedStudentSort {
  return {
    column,
    direction: column === 'mostRecent' ? 'descending' : 'ascending',
  };
}

export function toggleLapsedStudentSortDirection(
  sort: LapsedStudentSort,
): LapsedStudentSort {
  return {
    column: sort.column,
    direction: sort.direction === 'ascending' ? 'descending' : 'ascending',
  };
}

/**
 * Coach names on the report, plus “No coach” when a student has none.
 * Options come from the full list, so a membership-type filter does not
 * remove coaches from the dropdown.
 */
export function lapsedStudentCoachOptions(
  students: readonly LapsedLongTermCoachingStudent[],
): LapsedStudentFilterOption[] {
  const names = new Set(
    students.map((student) => student.previousPrimaryCoach),
  );
  const named = [...names]
    .filter((name) => name !== '')
    .sort((left, right) => compareText(left, right))
    .map((name) => ({ value: name, label: name }));
  const options = [...named];
  if (names.has('')) {
    options.push({ value: '', label: 'No coach' });
  }
  return [{ value: LAPSED_STUDENT_ALL, label: 'All coaches' }, ...options];
}

/**
 * Course names, which are the membership types on this report.
 * There is no “all types” option: choosing none means every type.
 */
export function lapsedStudentMembershipTypeOptions(
  students: readonly LapsedLongTermCoachingStudent[],
): LapsedStudentFilterOption[] {
  const names = new Set(
    students.flatMap((student) =>
      student.previousMemberships.map((membership) => membership.courseName),
    ),
  );
  const named = [...names]
    .filter((name) => name !== '')
    .sort((left, right) => compareText(left, right))
    .map((name) => ({ value: name, label: name }));
  const options = [...named];
  if (names.has('')) {
    options.push({ value: '', label: 'Unknown type' });
  }
  return options;
}

/**
 * Students who match the coach filter, the name or email search, and have had
 * any selected membership type. Filters only choose students: each one keeps
 * every previous membership, ordered most recently ended first. Students are
 * then ordered by the chosen sort. A missing date counts as older than every
 * real date. A missing coach or membership type stays last in either
 * direction.
 */
export function arrangeLapsedLongTermCoachingStudents(
  students: readonly LapsedLongTermCoachingStudent[],
  filters: LapsedStudentFilters,
  sort: LapsedStudentSort,
): LapsedLongTermCoachingStudent[] {
  return students
    .filter(
      (student) =>
        matchesCoach(student, filters.coach) &&
        matchesSearch(student, filters.search) &&
        hasAnyMembershipType(student, filters.membershipTypes),
    )
    .map((student) => ({
      ...student,
      previousMemberships: [...student.previousMemberships].sort(
        compareMembershipsByRecency,
      ),
    }))
    .sort((left, right) => compareStudents(left, right, sort));
}

function matchesCoach(
  student: LapsedLongTermCoachingStudent,
  coach: string,
): boolean {
  if (coach === LAPSED_STUDENT_ALL) {
    return true;
  }
  return student.previousPrimaryCoach === coach;
}

function matchesSearch(
  student: LapsedLongTermCoachingStudent,
  search: string,
): boolean {
  const needle = search.trim().toLocaleLowerCase();
  if (needle === '') {
    return true;
  }
  return (
    student.fullName.toLocaleLowerCase().includes(needle) ||
    student.email.toLocaleLowerCase().includes(needle)
  );
}

function hasAnyMembershipType(
  student: LapsedLongTermCoachingStudent,
  membershipTypes: readonly string[],
): boolean {
  if (membershipTypes.length === 0) {
    return true;
  }
  return student.previousMemberships.some((membership) =>
    membershipTypes.includes(membership.courseName),
  );
}

/**
 * Later end date first. When the end date is missing, the start date stands
 * in. A membership with neither date is the oldest.
 */
function compareMembershipsByRecency(
  left: LapsedLongTermCoachingMembership,
  right: LapsedLongTermCoachingMembership,
): number {
  const byRecency = membershipRecency(right).localeCompare(
    membershipRecency(left),
  );
  if (byRecency !== 0) {
    return byRecency;
  }
  const byStart = right.startDate.localeCompare(left.startDate);
  if (byStart !== 0) {
    return byStart;
  }
  return compareText(left.courseName, right.courseName);
}

function membershipRecency(
  membership: LapsedLongTermCoachingMembership,
): string {
  if (isIsoDate(membership.endDate)) {
    return membership.endDate;
  }
  if (isIsoDate(membership.startDate)) {
    return membership.startDate;
  }
  return MISSING_DATE;
}

function compareStudents(
  left: LapsedLongTermCoachingStudent,
  right: LapsedLongTermCoachingStudent,
  sort: LapsedStudentSort,
): number {
  const primary = compareBySort(left, right, sort);
  if (primary !== 0) {
    return primary;
  }
  const byName = compareText(left.fullName, right.fullName);
  if (byName !== 0) {
    return byName;
  }
  return left.student_id - right.student_id;
}

function compareBySort(
  left: LapsedLongTermCoachingStudent,
  right: LapsedLongTermCoachingStudent,
  sort: LapsedStudentSort,
): number {
  if (sort.column === 'coach') {
    return compareLabeledText(
      left.previousPrimaryCoach,
      right.previousPrimaryCoach,
      sort.direction,
    );
  }
  if (sort.column === 'membershipType') {
    return compareLabeledText(
      left.previousMemberships[0]?.courseName ?? '',
      right.previousMemberships[0]?.courseName ?? '',
      sort.direction,
    );
  }
  const byRecency = membershipRecency(
    left.previousMemberships[0] ?? emptyMembership(),
  ).localeCompare(
    membershipRecency(right.previousMemberships[0] ?? emptyMembership()),
  );
  return sort.direction === 'ascending' ? byRecency : -byRecency;
}

/** Empty labels stay last whether the sort runs A to Z or Z to A. */
function compareLabeledText(
  left: string,
  right: string,
  direction: LapsedStudentSortDirection,
): number {
  if (left === '' || right === '') {
    if (left === '' && right === '') {
      return 0;
    }
    return left === '' ? 1 : -1;
  }
  const comparison = compareText(left, right);
  return direction === 'ascending' ? comparison : -comparison;
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: 'base' });
}

function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function emptyMembership(): LapsedLongTermCoachingMembership {
  return { courseName: '', startDate: '', endDate: '' };
}
