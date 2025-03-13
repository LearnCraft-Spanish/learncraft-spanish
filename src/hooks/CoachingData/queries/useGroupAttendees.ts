import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';

export interface GroupAttendeeMutationObj {
  student: number;
  groupSession: number;
}

export default function useGroupAttendees(startDate: string, endDate: string) {
  const userDataQuery = useUserData();
  const { getGroupAttendees } = useStudentRecordsBackend();
  const { newPostFactory, newDeleteFactory } = useBackendHelpers();

  const groupAttendeesQuery = useQuery({
    queryKey: ['groupAttendees', { startDate, endDate }],
    queryFn: getGroupAttendees,
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
    mutationFn: (recordIds: number[]) => {
      const promise = newDeleteFactory({
        path: `coaching/group-attendees`,
        body: recordIds,
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
