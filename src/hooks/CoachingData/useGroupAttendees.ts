import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

export interface GroupAttendeeMutationObj {
  student: number;
  groupSession: number;
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
      const promise = newPostFactory({
        path: 'coaching/group-attendees',
        body: groupAttendees,
      });
      toast.promise(promise, {
        pending: 'Creating group attendees...',
        success: 'Group attendees created!',
        error: 'Error creating group attendees',
      });
      return promise;
    },
    onSettled() {
      groupAttendeesQuery.refetch();
    },
  });

  const deleteGroupAttendeesMutation = useMutation({
    mutationFn: (groupAttendees: GroupAttendeeMutationObj[]) => {
      const promise = newDeleteFactory({
        path: `coaching/group-attendees`,
        body: groupAttendees,
      });
      toast.promise(promise, {
        pending: 'Removing designated group attendees...',
        success: 'Group attendees deleted!',
        error: 'Error deleting designated group attendees',
      });
      return promise;
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
