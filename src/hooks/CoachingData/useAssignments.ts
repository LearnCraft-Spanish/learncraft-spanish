import { useMutation, useQuery } from '@tanstack/react-query';
import type { Assignment, QbUser } from 'src/types/CoachingTypes';
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
    /*
    const getAssignments = useCallback((): Promise<
       StudentRecordsTypes.Assignment[]
     > => {
       return getFactory('coaching/assignments');
     }, [getFactory]);
    */
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
      return newPostFactory({ path: 'coaching/assignments', body: assignment });
    },
  });

  // i dont know if we need to send he recordId as a param, since its already in the body?
  // did it for a stupid recordId === assignment.recordId check on backend, delete this comment or backend check if needed
  const updateAssignmentMutation = useMutation({
    mutationFn: (assignment: Assignment) => {
      return newPutFactory({
        path: `coaching/assignments/${assignment.recordId}`,
        body: assignment,
      });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (assignment: Assignment) => {
      return newDeleteFactory({
        path: `coaching/assignments/${assignment.recordId}`,
      });
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
