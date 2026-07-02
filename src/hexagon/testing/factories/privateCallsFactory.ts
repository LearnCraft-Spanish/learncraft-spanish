import type { PrivateCallLookups } from '@learncraft-spanish/shared';
import { privateCallLookupsSchema } from '@learncraft-spanish/shared';
import { createZodFactory } from '@testing/utils/factoryTools';

export const privateCallsFactory = createZodFactory<PrivateCallLookups>(
  privateCallLookupsSchema,
);
