import type { GroupSession } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';
export default function useGroupSessions(startDate: string, endDate: string) {
  const userDataQuery = useUserData();
  const { getGroupSessions } = useStudentRecordsBackend();
  const { getFactory, newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();
  const queryClient = useQueryClient();
  function getGroupSessionsTopicFieldOptions() {
    return getFactory<string[]>('coaching/group-sessions/topic-field-options');
  }

  const groupSessionsQuery = useQuery({
    queryKey: ['groupSessions', { startDate, endDate }],
    queryFn: getGroupSessions,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  const groupSessionsTopicFieldOptionsQuery = useQuery({
    queryKey: ['groupSessionsTopicFieldOptions'],
    queryFn: getGroupSessionsTopicFieldOptions,
    staleTime: Infinity,
    enabled: groupSessionsQuery.isSuccess,
  });

  // get group session by recordId

  // create group session
  interface CreateGroupSessionMutation {
    date: string;
    coach: string;
    sessionType: string;
    topic: string;
    comments: string;
    callDocument: string;
    zoomLink: string;
  }
  const createGroupSessionMutation = useMutation({
    mutationFn: (groupSession: CreateGroupSessionMutation) => {
      const promise = newPostFactory<GroupSession>({
        path: 'coaching/group-sessions',
        body: groupSession,
      });
      toast.promise(promise, {
        pending: 'Creating group session...',
        success: 'Group session created!',
        error: 'Error creating group session',
      });
      return promise;
    },
    onSuccess(result: GroupSession, _variables, _context) {
      const queryKey = ['groupSessions', { startDate, endDate }];
      queryClient.setQueryData(
        queryKey,
        (oldData: GroupSession[] | undefined) => {
          if (!oldData) {
            return [result];
          }
          // Create a deep copy of the old data and add the new assignment
          const oldDataCopy = JSON.parse(JSON.stringify(oldData));
          return [...oldDataCopy, { ...result }]; // Add the single result object
        },
      );
    },
  });
  interface UpdateGroupSessionMutation {
    recordId: number;
    date: string;
    coach: string;
    sessionType: string;
    topic: string;
    comments: string;
    callDocument: string;
    zoomLink: string;
  }

  const updateGroupSessionMutation = useMutation({
    mutationFn: (groupSession: UpdateGroupSessionMutation) => {
      const promise = newPutFactory({
        path: 'coaching/group-sessions',
        body: groupSession,
      });
      toast.promise(promise, {
        pending: 'Updating group session...',
        success: 'Group session updated!',
        error: 'Error updating group session',
      });
      return promise;
    },
    onSettled() {
      groupSessionsQuery.refetch();
    },
  });

  const deleteGroupSessionMutation = useMutation({
    mutationFn: (recordId: number) => {
      const promise = newDeleteFactory({
        path: `coaching/group-sessions/${recordId}`,
      });
      toast.promise(promise, {
        pending: 'Deleting group session...',
        success: 'Group session deleted!',
        error: 'Error deleting group session',
      });
      return promise;
    },
    onSettled() {
      groupSessionsQuery.refetch();
    },
  });

  return {
    groupSessionsQuery,
    groupSessionsTopicFieldOptionsQuery,

    createGroupSessionMutation,
    updateGroupSessionMutation,
    deleteGroupSessionMutation,
  };
}
