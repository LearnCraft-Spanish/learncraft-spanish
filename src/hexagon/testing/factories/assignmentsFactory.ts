import type {
  AssignmentLookups,
  BaseAssignment,
} from '@learncraft-spanish/shared';
import {
  assignmentLookupsSchema,
  BaseAssignmentSchema,
} from '@learncraft-spanish/shared';
import { createZodFactory } from '@testing/utils/factoryTools';

export const assignmentsFactory = createZodFactory<AssignmentLookups>(
  assignmentLookupsSchema,
);

export const baseAssignmentFactory =
  createZodFactory<BaseAssignment>(BaseAssignmentSchema);
