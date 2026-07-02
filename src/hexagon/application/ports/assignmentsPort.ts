import type { AssignmentLookups } from '@learncraft-spanish/shared';

export interface AssignmentsPort {
  getAssignmentLookups: () => Promise<AssignmentLookups>;
}
