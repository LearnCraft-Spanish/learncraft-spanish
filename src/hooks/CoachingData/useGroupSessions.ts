import { useMutation, useQuery } from '@tanstack/react-query';
import { useUserData } from '../UserData/useUserData';
import { useBackend, useBackendHelpers } from '../useBackend';

import type { GroupAttendeeMutationObj } from './useGroupAttendees';
import useGroupAttendees from './useGroupAttendees';

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
      return newPostFactory({
        path: 'coaching/group-sessions',
        body: groupSession,
      });
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
      return newPutFactory({
        path: 'coaching/group-sessions',
        body: groupSession,
      });
    },
    onSettled() {
      groupSessionsQuery.refetch();
    },
  });

  const deleteGroupSessionMutation = useMutation({
    mutationFn: (recordId: number) => {
      return newDeleteFactory({
        path: `coaching/group-sessions/${recordId}`,
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
    deleteGroupSessionMutation,
  };
}
