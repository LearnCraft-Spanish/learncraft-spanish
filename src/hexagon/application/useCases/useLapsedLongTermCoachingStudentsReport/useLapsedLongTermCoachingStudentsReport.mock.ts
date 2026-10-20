import type { UseLapsedLongTermCoachingStudentsReportResult } from '@application/useCases/useLapsedLongTermCoachingStudentsReport/useLapsedLongTermCoachingStudentsReport';
import {
  DEFAULT_LAPSED_STUDENT_SORT,
  LAPSED_STUDENT_ALL,
} from '@domain/functions/lapsedLongTermCoachingStudents';
import { createOverrideableMockHook } from '@testing/utils/createOverrideableMockHook';

const defaultMockResult: UseLapsedLongTermCoachingStudentsReportResult = {
  isLoading: false,
  isError: false,
  isSuccess: true,
  students: [],
  totalCount: 0,
  search: '',
  setSearch: () => {},
  coachFilter: LAPSED_STUDENT_ALL,
  setCoachFilter: () => {},
  coachOptions: [{ value: LAPSED_STUDENT_ALL, label: 'All coaches' }],
  membershipTypeFilter: [],
  setMembershipTypeFilter: () => {},
  membershipTypeOptions: [
    { value: 'Premier Coaching', label: 'Premier Coaching' },
  ],
  sort: DEFAULT_LAPSED_STUDENT_SORT,
  setSortColumn: () => {},
  toggleSortDirection: () => {},
};

export const {
  mock: mockUseLapsedLongTermCoachingStudentsReport,
  override: overrideMockUseLapsedLongTermCoachingStudentsReport,
  reset: resetMockUseLapsedLongTermCoachingStudentsReport,
} = createOverrideableMockHook<
  [],
  UseLapsedLongTermCoachingStudentsReportResult
>(defaultMockResult);
