import { privateCallsFactory } from '@testing/factories/privateCallsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

interface UsePrivateCallLookupsQueryReturn {
  callTypes: ReturnType<typeof privateCallsFactory>['callTypes'] | undefined;
  callRatings:
    ReturnType<typeof privateCallsFactory>['callRatings'] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const mockData = privateCallsFactory();

const defaultMockImplementation: UsePrivateCallLookupsQueryReturn = {
  callTypes: mockData.callTypes,
  callRatings: mockData.callRatings,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUsePrivateCallLookupsQuery,
  override: overrideMockUsePrivateCallLookupsQuery,
  reset: resetMockUsePrivateCallLookupsQuery,
} = createOverrideableMock<UsePrivateCallLookupsQueryReturn>(
  defaultMockImplementation,
);

export default mockUsePrivateCallLookupsQuery;
