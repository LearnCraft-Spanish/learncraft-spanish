import type { UseLapsedLongTermCoachingStudentsReportQueryReturn } from '@application/queries/AdminReportQueries/useLapsedLongTermCoachingStudentsReportQuery';
import type { LapsedLongTermCoachingStudent } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockLapsedLongTermCoachingStudentList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: LapsedLongTermCoachingStudent[] =
  createMockLapsedLongTermCoachingStudentList(2);

const defaultMockReturn: UseLapsedLongTermCoachingStudentsReportQueryReturn = {
  lapsedLongTermCoachingStudentsReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<LapsedLongTermCoachingStudent[]>,
};

export const {
  mock: mockUseLapsedLongTermCoachingStudents,
  override: overrideMockUseLapsedLongTermCoachingStudents,
  reset: resetMockUseLapsedLongTermCoachingStudents,
} = createOverrideableMock(defaultMockReturn);

export default mockUseLapsedLongTermCoachingStudents;
