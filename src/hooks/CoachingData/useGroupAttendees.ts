import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

export default function useGroupAttendees() {
  const userDataQuery = useUserData();
  const backend = useBackend();
  const { newPostFactory, newPutFactory } = useBackendHelpers();

  const groupAttendeesQuery = useQuery({
    queryKey: ['groupAttendees'],
    queryFn: backend.getGroupAttendees,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const createGroupAttendeeMutation = useMutation({
    mutationFn: (groupAttendee) => {
      return newPostFactory({
        path: 'coaching/group-attendees',
        body: groupAttendee,
      });
    },
    onSettled() {
      groupAttendeesQuery.refetch();
    },
  });
  const updateGroupAttendeeMutation = useMutation({
    mutationFn: (groupAttendee) => {
      return newPutFactory({
        path: 'coaching/group-attendees',
        body: groupAttendee,
      });
    },
    onSettled() {
      groupAttendeesQuery.refetch();
    },
  });

  return {
    groupAttendeesQuery,

    createGroupAttendeeMutation,
    updateGroupAttendeeMutation,
  };
}
