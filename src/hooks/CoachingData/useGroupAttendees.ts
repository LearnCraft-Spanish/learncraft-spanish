import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

export interface GroupAttendeeMutationObj {
  groupSessionId: number;
  groupAttendeeId: number;
  groupAttendee: string;
}

export default function useGroupAttendees() {
  const userDataQuery = useUserData();
  const backend = useBackend();
  const { newPostFactory, newDeleteFactory } = useBackendHelpers();

  const groupAttendeesQuery = useQuery({
    queryKey: ['groupAttendees'],
    queryFn: backend.getGroupAttendees,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const createGroupAttendeesMutation = useMutation({
    mutationFn: (groupAttendees: GroupAttendeeMutationObj[]) => {
      return newPostFactory({
        path: 'coaching/group-attendees',
        body: groupAttendees,
      });
    },
    onSettled() {
      groupAttendeesQuery.refetch();
    },
  });

  const deleteGroupAttendeesMutation = useMutation({
    mutationFn: (groupAttendees: GroupAttendeeMutationObj[]) => {
      return newDeleteFactory({
        path: `coaching/group-attendees`,
        body: groupAttendees,
      });
    },
    onSettled() {
      groupAttendeesQuery.refetch();
    },
  });

  return {
    groupAttendeesQuery,

    createGroupAttendeesMutation,
    deleteGroupAttendeesMutation,
  };
}
