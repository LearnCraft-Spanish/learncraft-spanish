import type { PrivateCallsPort } from '@application/ports/privateCallsPort';
import type {
  CreatePrivateCallCommand,
  DeletePrivateCallCommand,
  UpdatePrivateCallCommand,
} from '@learncraft-spanish/shared';
import {
  basePrivateCallFactory,
  privateCallsFactory,
} from '@testing/factories/privateCallsFactory';
import { createOverrideableMock } from '@testing/utils/createOverrideableMock';

const defaultMockPrivateCallsAdapter: PrivateCallsPort = {
  getPrivateCallLookups: async () => privateCallsFactory(),
  createPrivateCall: async (_privateCall: CreatePrivateCallCommand) =>
    basePrivateCallFactory(),
  updatePrivateCall: async (_privateCall: UpdatePrivateCallCommand) =>
    basePrivateCallFactory(),
  deletePrivateCall: async (_data: DeletePrivateCallCommand) => {},
};

export const {
  mock: mockPrivateCallsAdapter,
  override: overrideMockPrivateCallsAdapter,
  reset: resetMockPrivateCallsAdapter,
} = createOverrideableMock<PrivateCallsPort>(defaultMockPrivateCallsAdapter);

export default mockPrivateCallsAdapter;
