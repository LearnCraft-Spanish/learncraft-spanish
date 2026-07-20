import type { UseAssignmentsCompletedByWeekReportReturn } from '@application/units/useAssignmentsCompletedByWeekReport/useAssignmentsCompletedByWeekReport';
import type { AssignmentsCompletedByWeek } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  getDefaultAssignmentsReportWeekStarts,
  getWeekStartsOptions,
} from '@domain/functions/assignmentsReportWeekStarts';
import { createMockAssignmentsCompletedByWeekList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: AssignmentsCompletedByWeek[] =
  createMockAssignmentsCompletedByWeekList(2);

const defaultWeekStarts = getDefaultAssignmentsReportWeekStarts();

const defaultMockReturn: UseAssignmentsCompletedByWeekReportReturn = {
  weekStarts: defaultWeekStarts,
  weekOptions: getWeekStartsOptions(4),
  selectWeekStarts: () => {},
  assignmentsCompletedByWeekQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<AssignmentsCompletedByWeek[]>,
};

export const {
  mock: mockUseAssignmentsCompletedByWeekReport,
  override: overrideMockUseAssignmentsCompletedByWeekReport,
  reset: resetMockUseAssignmentsCompletedByWeekReport,
} = createOverrideableMock(defaultMockReturn);

export default mockUseAssignmentsCompletedByWeekReport;
