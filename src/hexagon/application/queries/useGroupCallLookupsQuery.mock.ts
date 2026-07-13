import { groupCallsFactory } from '@testing/factories/groupCallsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

interface UseGroupCallLookupsQueryReturn {
  groupSessionTypes:
    | ReturnType<typeof groupCallsFactory>['groupSessionTypes']
    | undefined;
  groupSessionTopics:
    | ReturnType<typeof groupCallsFactory>['groupSessionTopics']
    | undefined;
  isLoading: boolean;
  error: Error | null;
}

const mockData = groupCallsFactory();

const defaultMockImplementation: UseGroupCallLookupsQueryReturn = {
  groupSessionTypes: mockData.groupSessionTypes,
  groupSessionTopics: mockData.groupSessionTopics,
  isLoading: false,
  error: null,
};

export const {
  mock: mockUseGroupCallLookupsQuery,
  override: overrideMockUseGroupCallLookupsQuery,
  reset: resetMockUseGroupCallLookupsQuery,
} = createOverrideableMock<UseGroupCallLookupsQueryReturn>(
  defaultMockImplementation,
);

export default mockUseGroupCallLookupsQuery;
