import type {
  BaseGroupSession,
  GroupCallLookups,
} from '@learncraft-spanish/shared';
import {
  BaseGroupSessionSchema,
  groupCallLookupsSchema,
} from '@learncraft-spanish/shared';
import { createZodFactory } from '@testing/utils/factoryTools';

export const groupCallsFactory = createZodFactory<GroupCallLookups>(
  groupCallLookupsSchema,
);

export const baseGroupSessionFactory = createZodFactory<BaseGroupSession>(
  BaseGroupSessionSchema,
);
