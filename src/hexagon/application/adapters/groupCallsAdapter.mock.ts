import type { GroupCallsPort } from '@application/ports/groupCallsPort';
import {
  baseGroupSessionFactory,
  groupCallsFactory,
} from '@testing/factories/groupCallsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockGroupCallsAdapter: GroupCallsPort = {
  getGroupCallLookups: async () => groupCallsFactory(),
  createGroupCall: async (_groupCall) => baseGroupSessionFactory(),
  updateGroupCall: async (_groupCall) => baseGroupSessionFactory(),
  deleteGroupCall: async (_data) => {},
};

export const {
  mock: mockGroupCallsAdapter,
  override: overrideMockGroupCallsAdapter,
  reset: resetMockGroupCallsAdapter,
} = createOverrideableMock<GroupCallsPort>(defaultMockGroupCallsAdapter);

export default mockGroupCallsAdapter;
