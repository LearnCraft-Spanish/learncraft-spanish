import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

export default function useGroupSessions() {
  const userDataQuery = useUserData();
  const backend = useBackend();
  const { getFactory, newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();

  function getGroupSessionsTopicFieldOptions() {
    return getFactory<string[]>('coaching/group-sessions/topic-field-options');
  }

  const groupSessionsQuery = useQuery({
    queryKey: ['groupSessions'],
    queryFn: backend.getGroupSessions,
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
      const promise = newPostFactory({
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
    onSettled() {
      groupSessionsQuery.refetch();
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
