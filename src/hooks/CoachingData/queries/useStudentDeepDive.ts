import type { Week } from 'src/types/CoachingTypes';
import { useQuery } from '@tanstack/react-query';
import { useBackend, useBackendHelpers } from 'src/hooks/useBackend';

export function useStudentDeepDive() {
  const backend = useBackend();
  const { getFactory } = useBackendHelpers();

  const getStudentMemberships = (studentId: number) => {
    return backend.getStudentMemberships(studentId);
  };

  // Add more backend functions here as needed
  const getMembershipWeeks = (membershipId: number) => {
    return getFactory<Week[]>(`coaching/membership-weeks/${membershipId}`);
  };

  return {
    getStudentMemberships,
    getMembershipWeeks,
  };
}

export function useStudentMemberships(studentId: number) {
  const { getStudentMemberships } = useStudentDeepDive();

  return useQuery({
    queryKey: ['studentMemberships', studentId],
    queryFn: () => getStudentMemberships(studentId),
    staleTime: Infinity,
    enabled: false,
  });
}

export function useMembershipWeeks(membershipId: number) {
  const { getMembershipWeeks } = useStudentDeepDive();

  return useQuery({
    queryKey: ['membershipWeeks', membershipId],
    queryFn: () => getMembershipWeeks(membershipId),
    staleTime: Infinity,
    enabled: false,
  });
}
