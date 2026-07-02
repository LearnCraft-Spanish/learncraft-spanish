import type { AssignmentLookups } from '@learncraft-spanish/shared';
import { assignmentLookupsSchema } from '@learncraft-spanish/shared';
import { createZodFactory } from '@testing/utils/factoryTools';

export const assignmentsFactory = createZodFactory<AssignmentLookups>(
  assignmentLookupsSchema,
);
