import type { AssignmentsCompletedByWeek } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockAssignmentsCompletedByWeekList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: AssignmentsCompletedByWeek[] =
  createMockAssignmentsCompletedByWeekList(2);

const defaultMockReturn = {
  assignmentsCompletedByWeekQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<AssignmentsCompletedByWeek[]>,
};

export const {
  mock: mockUseAssignmentsCompletedByWeek,
  override: overrideMockUseAssignmentsCompletedByWeek,
  reset: resetMockUseAssignmentsCompletedByWeek,
} = createOverrideableMock(defaultMockReturn);

export default mockUseAssignmentsCompletedByWeek;
