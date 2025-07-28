import type { Assignment } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'react-toastify';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useBackendHelpers } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';

export default function useAssignments(startDate: string, endDate: string) {
  const userDataQuery = useUserData();
  const { getAssignments } = useStudentRecordsBackend();
  const queryClient = useQueryClient();
  const { openContextual } = useContextualMenu();
  const { newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();

  const assignmentsQuery = useQuery({
    queryKey: ['assignments', { startDate, endDate }],
    queryFn: getAssignments,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  // const getAssignment = (recordId: number) => {
  //   return assignmentsQuery.data?.find(
  //     (assignment) => assignment.recordId === recordId,
  //   );
  // };

  interface AssignmentForCreation {
    relatedWeek: number;
    homeworkCorrector: string;
    assignmentType: string;
    rating: string;
    notes: string;
    areasOfDifficulty: string;
    assignmentLink: string;
  }
  const createAssignmentMutation = useMutation({
    mutationFn: (assignment: AssignmentForCreation) => {
      const promise = newPostFactory<Assignment>({
        path: 'coaching/assignments',
        body: assignment,
      });
      toast.promise(promise, {
        pending: 'Creating assignment...',
        success: 'Assignment created!',
        error: 'Error creating assignment',
      });
      return promise;
    },
    onSuccess(result: Assignment, _variables, _context) {
      // Update the cache with the new assignment
      const queryKey = ['assignments', { startDate, endDate }];

      queryClient.setQueryData(
        queryKey,
        (oldData: Assignment[] | undefined) => {
          if (!oldData) {
            return [result];
          }
          // Create a deep copy of the old data and add the new assignment
          const oldDataCopy = JSON.parse(JSON.stringify(oldData));
          return [...oldDataCopy, { ...result }]; // Add the single result object
        },
      );

      // open correct contextual for new record
      setTimeout(() => {
        openContextual(`assignment${result.recordId}`);
      }, 200);
    },
  });

  // i dont know if we need to send he recordId as a param, since its already in the body?
  // did it for a stupid recordId === assignment.recordId check on backend, delete this comment or backend check if needed
  interface AssignmentForMutation {
    recordId: number;
    relatedWeek: number;
    homeworkCorrector: string;
    assignmentType: string;
    rating: string;
    notes: string;
    areasOfDifficulty: string;
    assignmentLink: string;
  }
  const updateAssignmentMutation = useMutation({
    mutationFn: (assignment: AssignmentForMutation) => {
      const promise = newPutFactory<Assignment>({
        path: `coaching/assignments/${assignment.recordId}`,
        body: assignment,
      });
      toast.promise(promise, {
        pending: 'Updating assignment...',
        success: 'Assignment updated!',
        error: 'Error updating assignment',
      });
      return promise;
    },
    onSuccess(result: Assignment, _variables, _context) {
      // Update the cache with the updated assignment
      const queryKey = ['assignments', { startDate, endDate }];

      queryClient.setQueryData(
        queryKey,
        (oldData: Assignment[] | undefined) => {
          if (!oldData) {
            return [result];
          }
          // Create a deep copy of the old data and add the updated assignment
          const oldDataCopy = JSON.parse(JSON.stringify(oldData));
          return oldDataCopy.map((item: Assignment) =>
            item.recordId === result.recordId ? result : item,
          );
        },
      );
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (recordId: number) => {
      const promise = newDeleteFactory({
        path: `coaching/assignments/${recordId}`,
      });
      toast.promise(promise, {
        pending: 'Deleting assignment...',
        success: 'Assignment deleted!',
        error: 'Error deleting assignment',
      });
      return promise;
    },
    onSettled() {
      assignmentsQuery.refetch();
    },
  });

  return {
    assignmentsQuery,
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  };
}
