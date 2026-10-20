import type {
  LapsedStudentFilterOption,
  LapsedStudentSort,
  LapsedStudentSortColumn,
} from '@domain/functions/lapsedLongTermCoachingStudents';
import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import { useLapsedLongTermCoachingStudentsReportQuery } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';
import {
  arrangeLapsedLongTermCoachingStudents,
  DEFAULT_LAPSED_STUDENT_SORT,
  LAPSED_STUDENT_ALL,
  lapsedStudentCoachOptions,
  lapsedStudentMembershipTypeOptions,
  lapsedStudentSortForColumn,
  toggleLapsedStudentSortDirection,
} from '@domain/functions/lapsedLongTermCoachingStudents';
import { useCallback, useMemo, useState } from 'react';

const NO_STUDENTS: LapsedLongTermCoachingStudent[] = [];

export interface UseLapsedLongTermCoachingStudentsReportResult {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  /** Students after the current filters and sort. */
  students: LapsedLongTermCoachingStudent[];
  /** How many students the report returned before filtering. */
  totalCount: number;
  /** Name or email text, matched case-insensitively. */
  search: string;
  setSearch: (search: string) => void;
  coachFilter: string;
  setCoachFilter: (coach: string) => void;
  coachOptions: LapsedStudentFilterOption[];
  /** Chosen course names. Empty shows every membership type. */
  membershipTypeFilter: readonly string[];
  setMembershipTypeFilter: (membershipTypes: readonly string[]) => void;
  membershipTypeOptions: LapsedStudentFilterOption[];
  sort: LapsedStudentSort;
  setSortColumn: (column: LapsedStudentSortColumn) => void;
  toggleSortDirection: () => void;
}

export function useLapsedLongTermCoachingStudentsReport(): UseLapsedLongTermCoachingStudentsReportResult {
  const { lapsedLongTermCoachingStudentsReportQuery } =
    useLapsedLongTermCoachingStudentsReportQuery();
  const { data, isLoading, isError, isSuccess } =
    lapsedLongTermCoachingStudentsReportQuery;
  const [search, setSearch] = useState('');
  const [coachFilter, setCoachFilter] = useState(LAPSED_STUDENT_ALL);
  const [membershipTypeFilter, setMembershipTypeFilter] = useState<
    readonly string[]
  >([]);
  const [sort, setSort] = useState<LapsedStudentSort>(
    DEFAULT_LAPSED_STUDENT_SORT,
  );

  const reportStudents = data ?? NO_STUDENTS;
  const students = useMemo(
    () =>
      arrangeLapsedLongTermCoachingStudents(
        reportStudents,
        { coach: coachFilter, search, membershipTypes: membershipTypeFilter },
        sort,
      ),
    [reportStudents, coachFilter, search, membershipTypeFilter, sort],
  );
  const coachOptions = useMemo(
    () => lapsedStudentCoachOptions(reportStudents),
    [reportStudents],
  );
  const membershipTypeOptions = useMemo(
    () => lapsedStudentMembershipTypeOptions(reportStudents),
    [reportStudents],
  );

  const setSortColumn = useCallback((column: LapsedStudentSortColumn) => {
    setSort(lapsedStudentSortForColumn(column));
  }, []);
  const toggleSortDirection = useCallback(() => {
    setSort((current) => toggleLapsedStudentSortDirection(current));
  }, []);

  return {
    isLoading,
    isError,
    isSuccess,
    students,
    totalCount: reportStudents.length,
    search,
    setSearch,
    coachFilter,
    setCoachFilter,
    coachOptions,
    membershipTypeFilter,
    setMembershipTypeFilter,
    membershipTypeOptions,
    sort,
    setSortColumn,
    toggleSortDirection,
  };
}
