import type {
  BasePrivateCall,
  PrivateCallLookups,
} from '@learncraft-spanish/shared';
import {
  BasePrivateCallSchema,
  privateCallLookupsSchema,
} from '@learncraft-spanish/shared';
import { createZodFactory } from '@testing/utils/factoryTools';

export const privateCallsFactory = createZodFactory<PrivateCallLookups>(
  privateCallLookupsSchema,
);

export const basePrivateCallFactory = createZodFactory<BasePrivateCall>(
  BasePrivateCallSchema,
);
