import type {
  BaseAssignment,
  CreateAssignmentCommand,
  DeleteAssignmentCommand,
  UpdateAssignmentCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAssignmentsAdapter } from '@application/adapters/assignmentAdapter';
import { useMutation } from '@tanstack/react-query';

export interface UseAssignmentsMutationsReturn {
  createAssignmentMutation: UseMutationResult<
    BaseAssignment,
    Error,
    CreateAssignmentCommand
  >;
  updateAssignmentMutation: UseMutationResult<
    BaseAssignment,
    Error,
    UpdateAssignmentCommand
  >;
  deleteAssignmentMutation: UseMutationResult<
    void,
    Error,
    DeleteAssignmentCommand
  >;
}
export function useAssignmentsMutations(): UseAssignmentsMutationsReturn {
  const { createAssignment, updateAssignment, deleteAssignment } =
    useAssignmentsAdapter();
  const createAssignmentMutation = useMutation({
    mutationFn: (assignment: CreateAssignmentCommand) =>
      createAssignment(assignment),
  });
  const updateAssignmentMutation = useMutation({
    mutationFn: (assignment: UpdateAssignmentCommand) =>
      updateAssignment(assignment),
  });
  const deleteAssignmentMutation = useMutation({
    mutationFn: (data: DeleteAssignmentCommand) => deleteAssignment(data),
  });
  return {
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  };
}
