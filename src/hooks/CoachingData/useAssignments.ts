import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import type { Assignment } from 'src/types/CoachingTypes';
import { useBackend, useBackendHelpers } from '../useBackend';
import { useUserData } from '../UserData/useUserData';

export default function useAssignments() {
  const userDataQuery = useUserData();
  const backend = useBackend();

  const { newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();

  const assignmentsQuery = useQuery({
    queryKey: ['assignments'],
    queryFn: backend.getAssignments,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const getAssignment = (recordId: number) => {
    return assignmentsQuery.data?.find(
      (assignment) => assignment.recordId === recordId,
    );
  };

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
      const promise = newPostFactory({
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
    onSettled() {
      assignmentsQuery.refetch();
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
      const promise = newPutFactory({
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
    onSettled() {
      assignmentsQuery.refetch();
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignment: Assignment) => {
      const promise = newDeleteFactory({
        path: `coaching/assignments/${assignment.recordId}`,
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
    getAssignment,
    createAssignmentMutation,
    updateAssignmentMutation,
    deleteAssignmentMutation,
  };
}
