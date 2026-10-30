import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import { describe, expect, it } from 'vitest';
import {
  arrangeLapsedLongTermCoachingStudents,
  DEFAULT_LAPSED_STUDENT_SORT,
  LAPSED_STUDENT_ALL,
  lapsedStudentCoachOptions,
  lapsedStudentMembershipTypeOptions,
  lapsedStudentSortForColumn,
  toggleLapsedStudentSortDirection,
} from './lapsedLongTermCoachingStudents';

function student(
  id: number,
  fullName: string,
  coach: string,
  memberships: LapsedLongTermCoachingStudent['previousMemberships'],
): LapsedLongTermCoachingStudent {
  return {
    student_id: id,
    fullName,
    email: `${fullName}@example.test`,
    previousPrimaryCoach: coach,
    previousMemberships: memberships,
  };
}

const amy = student(2, 'Amy', 'Zed Coach', [
  {
    courseName: 'Regular Coaching',
    startDate: '2024-08-01',
    endDate: '2024-06-15',
  },
  {
    courseName: 'Premier Coaching',
    startDate: '2023-01-01',
    endDate: '2024-10-01',
  },
]);

const zoe = student(9, 'Zoe', 'Ann Coach', [
  {
    courseName: 'Premier Coaching',
    startDate: '2022-01-01',
    endDate: '2023-01-01',
  },
]);

const noCoach = student(4, 'Bea', '', [
  {
    courseName: 'Group Coaching',
    startDate: '',
    endDate: '',
  },
]);

const students = [amy, zoe, noCoach];

const allFilters = {
  coach: LAPSED_STUDENT_ALL,
  search: '',
  membershipTypes: [],
};

describe('arrangeLapsedLongTermCoachingStudents', () => {
  it('orders students by the membership that ended most recently, and lists that membership first', () => {
    const arranged = arrangeLapsedLongTermCoachingStudents(
      students,
      allFilters,
      DEFAULT_LAPSED_STUDENT_SORT,
    );

    expect(arranged.map((row) => row.fullName)).toEqual(['Amy', 'Zoe', 'Bea']);
    expect(
      arranged[0]?.previousMemberships.map(
        (membership) => membership.courseName,
      ),
    ).toEqual(['Premier Coaching', 'Regular Coaching']);
  });

  it('puts students with no dates first when sorting oldest first', () => {
    const arranged = arrangeLapsedLongTermCoachingStudents(
      students,
      allFilters,
      {
        column: 'mostRecent',
        direction: 'ascending',
      },
    );

    expect(arranged.map((row) => row.fullName)).toEqual(['Bea', 'Zoe', 'Amy']);
  });

  it('uses the start date when a membership has no end date', () => {
    const earlier = student(1, 'Earlier', 'Ann Coach', [
      {
        courseName: 'Premier Coaching',
        startDate: '2020-05-01',
        endDate: '',
      },
    ]);
    const later = student(2, 'Later', 'Ann Coach', [
      {
        courseName: 'Premier Coaching',
        startDate: '2021-05-01',
        endDate: '',
      },
    ]);

    const arranged = arrangeLapsedLongTermCoachingStudents(
      [earlier, later],
      allFilters,
      DEFAULT_LAPSED_STUDENT_SORT,
    );

    expect(arranged.map((row) => row.fullName)).toEqual(['Later', 'Earlier']);
  });

  it('filters to one coach and can sort the remaining students by coach name', () => {
    const filtered = arrangeLapsedLongTermCoachingStudents(
      students,
      { ...allFilters, coach: 'Ann Coach' },
      lapsedStudentSortForColumn('coach'),
    );

    expect(filtered.map((row) => row.fullName)).toEqual(['Zoe']);

    const byCoach = arrangeLapsedLongTermCoachingStudents(
      students,
      allFilters,
      lapsedStudentSortForColumn('coach'),
    );
    expect(byCoach.map((row) => row.previousPrimaryCoach)).toEqual([
      'Ann Coach',
      'Zed Coach',
      '',
    ]);

    const reversed = arrangeLapsedLongTermCoachingStudents(
      students,
      allFilters,
      toggleLapsedStudentSortDirection(lapsedStudentSortForColumn('coach')),
    );
    expect(reversed.map((row) => row.previousPrimaryCoach)).toEqual([
      'Zed Coach',
      'Ann Coach',
      '',
    ]);
  });

  it('filters to students who had one membership type, keeps all of their memberships, and sorts by type', () => {
    const filtered = arrangeLapsedLongTermCoachingStudents(
      students,
      { ...allFilters, membershipTypes: ['Regular Coaching'] },
      DEFAULT_LAPSED_STUDENT_SORT,
    );

    expect(filtered.map((row) => row.fullName)).toEqual(['Amy']);
    expect(filtered[0]?.previousMemberships).toEqual([
      {
        courseName: 'Premier Coaching',
        startDate: '2023-01-01',
        endDate: '2024-10-01',
      },
      {
        courseName: 'Regular Coaching',
        startDate: '2024-08-01',
        endDate: '2024-06-15',
      },
    ]);

    const byType = arrangeLapsedLongTermCoachingStudents(
      students,
      allFilters,
      lapsedStudentSortForColumn('membershipType'),
    );
    expect(byType.map((row) => row.previousMemberships[0]?.courseName)).toEqual(
      ['Group Coaching', 'Premier Coaching', 'Premier Coaching'],
    );
    expect(byType.map((row) => row.fullName)).toEqual(['Bea', 'Amy', 'Zoe']);
  });

  it('keeps a student who has had any of the selected membership types', () => {
    const filtered = arrangeLapsedLongTermCoachingStudents(
      students,
      {
        ...allFilters,
        membershipTypes: ['Regular Coaching', 'Group Coaching'],
      },
      DEFAULT_LAPSED_STUDENT_SORT,
    );

    expect(filtered.map((row) => row.fullName)).toEqual(['Amy', 'Bea']);
    expect(
      filtered[0]?.previousMemberships.map(
        (membership) => membership.courseName,
      ),
    ).toEqual(['Premier Coaching', 'Regular Coaching']);
    expect(
      filtered[1]?.previousMemberships.map(
        (membership) => membership.courseName,
      ),
    ).toEqual(['Group Coaching']);
  });

  it('searches name or email, ignoring case and surrounding spaces', () => {
    const byName = arrangeLapsedLongTermCoachingStudents(
      students,
      { ...allFilters, search: '  zO ' },
      DEFAULT_LAPSED_STUDENT_SORT,
    );
    expect(byName.map((row) => row.fullName)).toEqual(['Zoe']);

    const byEmail = arrangeLapsedLongTermCoachingStudents(
      students,
      { ...allFilters, search: 'BEA@EXAMPLE' },
      DEFAULT_LAPSED_STUDENT_SORT,
    );
    expect(byEmail.map((row) => row.fullName)).toEqual(['Bea']);

    const combined = arrangeLapsedLongTermCoachingStudents(
      students,
      { ...allFilters, search: 'example.test', coach: 'Zed Coach' },
      DEFAULT_LAPSED_STUDENT_SORT,
    );
    expect(combined.map((row) => row.fullName)).toEqual(['Amy']);

    const none = arrangeLapsedLongTermCoachingStudents(
      students,
      { ...allFilters, search: 'nobody' },
      DEFAULT_LAPSED_STUDENT_SORT,
    );
    expect(none).toEqual([]);
  });

  it('breaks ties by name, then student id', () => {
    const first = student(3, 'Same', 'Ann Coach', [
      {
        courseName: 'Premier Coaching',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
      },
    ]);
    const second = student(1, 'Same', 'Ann Coach', [
      {
        courseName: 'Premier Coaching',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
      },
    ]);

    const arranged = arrangeLapsedLongTermCoachingStudents(
      [first, second],
      allFilters,
      DEFAULT_LAPSED_STUDENT_SORT,
    );

    expect(arranged.map((row) => row.student_id)).toEqual([1, 3]);
  });
});

describe('lapsed student filter options', () => {
  it('lists coaches and membership types from the whole report, with blanks labeled', () => {
    expect(lapsedStudentCoachOptions(students)).toEqual([
      { value: LAPSED_STUDENT_ALL, label: 'All coaches' },
      { value: 'Ann Coach', label: 'Ann Coach' },
      { value: 'Zed Coach', label: 'Zed Coach' },
      { value: '', label: 'No coach' },
    ]);
    expect(lapsedStudentMembershipTypeOptions(students)).toEqual([
      { value: 'Group Coaching', label: 'Group Coaching' },
      { value: 'Premier Coaching', label: 'Premier Coaching' },
      { value: 'Regular Coaching', label: 'Regular Coaching' },
    ]);
  });
});
