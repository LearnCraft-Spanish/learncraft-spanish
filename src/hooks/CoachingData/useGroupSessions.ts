import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

export default function useGroupSessions() {
  const userDataQuery = useUserData();
  const backend = useBackend();
  const { getFactory, newPostFactory, newPutFactory } = useBackendHelpers();

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
  const createGroupSessionMutation = useMutation({
    mutationFn: (groupSession) => {
      return newPostFactory({
        path: 'coaching/group-sessions',
        body: groupSession,
      });
    },
    onSettled() {
      groupSessionsQuery.refetch();
    },
  });

  const updateGroupSessionMutation = useMutation({
    mutationFn: (groupSession) => {
      return newPutFactory({
        path: 'coaching/group-sessions',
        body: groupSession,
      });
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
  };
}
