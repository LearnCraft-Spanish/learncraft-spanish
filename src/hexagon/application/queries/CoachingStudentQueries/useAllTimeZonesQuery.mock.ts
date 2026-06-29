import type { UseAllTimeZonesQueryReturn } from '@application/queries/CoachingStudentQueries/useAllTimeZonesQuery';
import type { TimeZone } from '@learncraft-spanish/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createMockTimeZoneList } from '@testing/factories/coachingStudentFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockImplementation: UseAllTimeZonesQueryReturn = {
  allTimeZonesQuery: {
    data: createMockTimeZoneList(3),
    isLoading: false,
    isError: false,
    isSuccess: true,
    isPending: false,
    status: 'success',
    error: null,
  } as UseQueryResult<TimeZone[]>,
};

export const {
  mock: mockUseAllTimeZonesQuery,
  override: overrideMockUseAllTimeZonesQuery,
  reset: resetMockUseAllTimeZonesQuery,
} = createOverrideableMock<UseAllTimeZonesQueryReturn>(
  defaultMockImplementation,
);

export default mockUseAllTimeZonesQuery;
