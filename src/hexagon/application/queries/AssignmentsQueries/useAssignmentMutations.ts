import type {
  BaseAssignment,
  CreateAssignmentCommand,
  DeleteAssignmentCommand,
  FurnishedWeekWithCoach,
  UpdateAssignmentCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useAssignmentsAdapter } from '@application/adapters/assignmentAdapter';
import { MEMBERSHIP_WEEKS_QUERY_KEY_ROOT } from '@application/queries/WeekQueries/useMembershipWeeksQuery';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const WEEKS_QUERY_KEY = ['weeklyRecords', 'weeksByStartDate'];

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
  const queryClient = useQueryClient();

  const createAssignmentMutation = useMutation({
    mutationFn: (assignment: CreateAssignmentCommand) =>
      createAssignment(assignment),
    onSuccess: (newAssignment) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            if (week.weekId !== newAssignment.weekId) return week;
            return {
              ...week,
              assignments: [...week.assignments, newAssignment],
            };
          });
        },
      );
      void queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_WEEKS_QUERY_KEY_ROOT,
      });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: (assignment: UpdateAssignmentCommand) =>
      updateAssignment(assignment),
    onSuccess: (updatedAssignment) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            if (week.weekId !== updatedAssignment.weekId) return week;
            return {
              ...week,
              assignments: week.assignments.map((a) =>
                a.assignmentId === updatedAssignment.assignmentId
                  ? updatedAssignment
                  : a,
              ),
            };
          });
        },
      );
      void queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_WEEKS_QUERY_KEY_ROOT,
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (data: DeleteAssignmentCommand) => deleteAssignment(data),
    onSuccess: (_, { assignmentId }) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => ({
            ...week,
            assignments: week.assignments.filter(
              (a) => a.assignmentId !== assignmentId,
            ),
          }));
        },
      );
      void queryClient.invalidateQueries({
        queryKey: MEMBERSHIP_WEEKS_QUERY_KEY_ROOT,
      });
    },
  });

  return {
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  };
}
