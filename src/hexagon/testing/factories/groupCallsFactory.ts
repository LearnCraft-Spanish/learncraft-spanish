import type { GroupCallLookups } from '@learncraft-spanish/shared';
import { groupCallLookupsSchema } from '@learncraft-spanish/shared';
import { createZodFactory } from '@testing/utils/factoryTools';

export const groupCallsFactory = createZodFactory<GroupCallLookups>(
  groupCallLookupsSchema,
);
