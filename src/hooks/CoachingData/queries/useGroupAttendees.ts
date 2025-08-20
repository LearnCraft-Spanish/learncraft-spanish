import type { GroupAttendees } from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../../useBackend';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';

export interface GroupAttendeeMutationObj {
  student: number;
  groupSession: number;
}

export default function useGroupAttendees(startDate: string, endDate: string) {
  const { isAdmin, isCoach } = useAuthAdapter();
  const { getGroupAttendees } = useStudentRecordsBackend();
  const { newPostFactory, newDeleteFactory } = useBackendHelpers();
  const queryClient = useQueryClient();

  const groupAttendeesQuery = useQuery({
    queryKey: ['groupAttendees', { startDate, endDate }],
    queryFn: getGroupAttendees,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
  });

  const createGroupAttendeesMutation = useMutation({
    mutationFn: (groupAttendees: GroupAttendeeMutationObj[]) => {
      const promise = newPostFactory<GroupAttendees[]>({
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
    onSuccess(result: GroupAttendees[], _variables, _context) {
      const queryKey = ['groupAttendees', { startDate, endDate }];
      queryClient.setQueryData(
        queryKey,
        (oldData: GroupAttendees[] | undefined) => {
          if (!oldData) {
            return [result];
          }
          // Create a deep copy of the old data and add the new assignment
          const oldDataCopy = JSON.parse(JSON.stringify(oldData));
          return [...oldDataCopy, ...result];
        },
      );
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
