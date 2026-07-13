import type {
  AssignmentLookups,
  BaseAssignment,
  CreateAssignmentCommand,
  DeleteAssignmentCommand,
  UpdateAssignmentCommand,
} from '@learncraft-spanish/shared';

export interface AssignmentsPort {
  getAssignmentLookups: () => Promise<AssignmentLookups>;
  createAssignment: (
    assignment: CreateAssignmentCommand,
  ) => Promise<BaseAssignment>;
  updateAssignment: (
    assignment: UpdateAssignmentCommand,
  ) => Promise<BaseAssignment>;
  deleteAssignment: (data: DeleteAssignmentCommand) => Promise<void>;
}
