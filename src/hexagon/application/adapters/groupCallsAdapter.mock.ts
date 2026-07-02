import type { GroupCallsPort } from '@application/ports/groupCallsPort';
import { groupCallsFactory } from '@testing/factories/groupCallsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockGroupCallsAdapter: GroupCallsPort = {
  getGroupCallLookups: async () => groupCallsFactory(),
};

export const {
  mock: mockGroupCallsAdapter,
  override: overrideMockGroupCallsAdapter,
  reset: resetMockGroupCallsAdapter,
} = createOverrideableMock<GroupCallsPort>(defaultMockGroupCallsAdapter);

export default mockGroupCallsAdapter;
