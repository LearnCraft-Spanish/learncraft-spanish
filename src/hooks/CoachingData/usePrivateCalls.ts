import { useMutation, useQuery } from '@tanstack/react-query';
import type { Call } from 'src/types/CoachingTypes';
import { useBackend, useBackendHelpers } from '../useBackend';
import { useUserData } from '../UserData/useUserData';

export default function usePrivateCalls() {
  const userDataQuery = useUserData();
  const backend = useBackend();
  const { newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();

  const privateCallsQuery = useQuery({
    queryKey: ['privateCalls'],
    queryFn: backend.getPrivateCalls,
    staleTime: Infinity,
    enabled:
      userDataQuery.data?.roles.adminRole === 'coach' ||
      userDataQuery.data?.roles.adminRole === 'admin',
  });

  // const getPrivateCall = (recordId: number) => {
  //   return privateCallsQuery.data?.find((call) => call.recordId === recordId);
  // };

  interface CallForCreation {
    relatedWeek: number;
    callType: string;
    rating: string;
    notes: string;
    areasOfDifficulty: string;
    recording: string;
    date: Date | string;
    caller: string;
  }

  const createPrivateCallMutation = useMutation({
    mutationFn: (call: CallForCreation) => {
      return newPostFactory({ path: 'coaching/private-calls', body: call });
    },
  });

  interface CallForUpdate {
    recordId: number;
    relatedWeek: number;
    callType: string;
    rating: string;
    notes: string;
    areasOfDifficulty: string;
    recording: string;
    date: Date | string;
    caller: string;
  }
  const updatePrivateCallMutation = useMutation({
    mutationFn: (call: CallForUpdate) => {
      return newPutFactory({
        path: `coaching/private-calls/${call.recordId}`,
        body: call,
      });
    },
  });

  const deletePrivateCallMutation = useMutation({
    mutationFn: (call: Call) => {
      return newDeleteFactory({
        path: `coaching/private-calls/${call.recordId}`,
      });
    },
  });

  return {
    privateCallsQuery,
    // getPrivateCall,
    createPrivateCallMutation,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
  };
}
