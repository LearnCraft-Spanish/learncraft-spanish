import type { GroupSession } from 'src/types/CoachingTypes';
import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useBackendHelpers } from '../../useBackend';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';
export default function useGroupSessions(startDate: string, endDate: string) {
  const { isAdmin, isCoach } = useAuthAdapter();
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
    enabled: isCoach || isAdmin,
  });

  const groupSessionsTopicFieldOptionsQuery = useQuery({
    queryKey: ['groupSessionsTopicFieldOptions'],
    queryFn: getGroupSessionsTopicFieldOptions,
    staleTime: Infinity,
    enabled: groupSessionsQuery.isSuccess,
  });
  // a post to group-sessions/topic-field-options, with the body being { newChoice: string}
  const createGroupSessionsTopicFieldOptionsMutation = useMutation({
    mutationFn: async (newChoice: string) => {
      return await newPostFactory<string[]>({
        path: 'coaching/group-sessions/topic-field-options',
        body: { newChoice },
      });
    },
    onSuccess: (_data: string[]) => {
      groupSessionsTopicFieldOptionsQuery.refetch();
      return true;
    },
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
      const promise = newPutFactory<GroupSession>({
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
    onSuccess(result: GroupSession, _variables, _context) {
      // Update the cache with the updated group session
      const queryKey = ['groupSessions', { startDate, endDate }];

      queryClient.setQueryData(
        queryKey,
        (oldData: GroupSession[] | undefined) => {
          if (!oldData) {
            return [result];
          }
          // Create a deep copy of the old data and add the updated group session
          const oldDataCopy = JSON.parse(JSON.stringify(oldData));
          return oldDataCopy.map((item: GroupSession) =>
            item.recordId === result.recordId ? result : item,
          );
        },
      );
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
    createGroupSessionsTopicFieldOptionsMutation,

    createGroupSessionMutation,
    updateGroupSessionMutation,
    deleteGroupSessionMutation,
  };
}
