import type {
  Assignment,
  GroupAttendees,
  GroupSession,
  PrivateCall,
  Week,
} from 'src/types/CoachingTypes';
import { useQuery } from '@tanstack/react-query';
import { useBackend, useBackendHelpers } from 'src/hooks/useBackend';

interface GroupSessionWithAttendees extends GroupSession {
  attendees: GroupAttendees[];
}

interface WeekWithRelations extends Week {
  assignments: Assignment[];
  privateCalls: PrivateCall[];
  groupSessions: GroupSessionWithAttendees[];
}

export function useStudentDeepDive() {
  const backend = useBackend();
  const { getFactory } = useBackendHelpers();

  const getStudentMemberships = (studentId: number) => {
    return backend.getStudentMemberships(studentId);
  };

  // Add more backend functions here as needed
  const getMembershipWeeks = (membershipId: number) => {
    return getFactory<WeekWithRelations[]>(
      `coaching/membership-weeks/${membershipId}`,
    );
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
  });
}

export function useMembershipWeeks(membershipId: number) {
  const { getMembershipWeeks } = useStudentDeepDive();

  return useQuery({
    queryKey: ['membershipWeeks', membershipId],
    queryFn: () => getMembershipWeeks(membershipId),
    staleTime: Infinity,
  });
}
