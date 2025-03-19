import type { Membership } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useStudentDeepDiveBackend from './BackendFunctions';

export default function useStudentMemberships(studentId: number) {
  const { getStudentMemberships, updateMembership } =
    useStudentDeepDiveBackend();

  const studentMembershipsQuery = useQuery({
    queryKey: ['studentMemberships', studentId],
    queryFn: () => getStudentMemberships(studentId),
    staleTime: Infinity,
  });

  const queryClient = useQueryClient();

  type PartialMembership = Partial<Membership> & { recordId: number };
  const updateMembershipMutation = useMutation({
    mutationFn: (membership: PartialMembership) => updateMembership(membership),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['studentMemberships', studentId],
      });
    },
  });

  return {
    studentMembershipsQuery,
    updateMembershipMutation,
  };
}
