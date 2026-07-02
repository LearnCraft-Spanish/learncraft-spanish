import type { PrivateCallsPort } from '@application/ports/privateCallsPort';
import { privateCallsFactory } from '@testing/factories/privateCallsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockPrivateCallsAdapter: PrivateCallsPort = {
  getPrivateCallLookups: async () => privateCallsFactory(),
};

export const {
  mock: mockPrivateCallsAdapter,
  override: overrideMockPrivateCallsAdapter,
  reset: resetMockPrivateCallsAdapter,
} = createOverrideableMock<PrivateCallsPort>(defaultMockPrivateCallsAdapter);

export default mockPrivateCallsAdapter;
