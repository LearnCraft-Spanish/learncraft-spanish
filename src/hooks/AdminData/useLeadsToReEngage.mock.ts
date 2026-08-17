import type { UseLeadsToReEngageReportQueryReturn } from '@application/queries/AdminReportQueries/useLeadsToReEngageReportQuery';
import type { LeadsToReEngage } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockLeadsToReEngageList } from '@testing/factories/adminReportsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockData: LeadsToReEngage[] = createMockLeadsToReEngageList(2);

const defaultMockReturn: UseLeadsToReEngageReportQueryReturn = {
  leadsToReEngageReportQuery: {
    data: defaultMockData,
    isLoading: false,
    isError: false,
    isSuccess: true,
    status: 'success',
  } as UseQueryResult<LeadsToReEngage[]>,
};

export const {
  mock: mockUseLeadsToReEngage,
  override: overrideMockUseLeadsToReEngage,
  reset: resetMockUseLeadsToReEngage,
} = createOverrideableMock(defaultMockReturn);

export default mockUseLeadsToReEngage;
