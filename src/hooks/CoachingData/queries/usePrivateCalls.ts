import { useAuthAdapter } from '@application/adapters/authAdapter';
import { useMutation, useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';
import { useBackendHelpers } from '../../useBackend';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';

export default function usePrivateCalls(
  startDate: string | undefined,
  endDate: string | undefined,
) {
  const { isAdmin, isCoach } = useAuthAdapter();
  const { getPrivateCalls } = useStudentRecordsBackend();
  const { newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();

  const privateCallsQuery = useQuery({
    queryKey: ['privateCalls', { startDate, endDate }],
    queryFn: getPrivateCalls,
    staleTime: Infinity,
    enabled: isCoach || isAdmin,
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
      const promise = newPostFactory({
        path: 'coaching/private-calls',
        body: call,
      });
      toast.promise(promise, {
        pending: 'Creating private call...',
        success: 'Private call created!',
        error: 'Error creating private call',
      });
      return promise;
    },
    onSettled() {
      privateCallsQuery.refetch();
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
      const promise = newPutFactory({
        path: `coaching/private-calls/${call.recordId}`,
        body: call,
      });
      toast.promise(promise, {
        pending: 'Updating private call...',
        success: 'Private call updated!',
        error: 'Error updating private call',
      });
      return promise;
    },
    onSettled() {
      privateCallsQuery.refetch();
    },
  });

  const deletePrivateCallMutation = useMutation({
    mutationFn: (recordId: number) => {
      const promise = newDeleteFactory({
        path: `coaching/private-calls/${recordId}`,
      });
      toast.promise(promise, {
        pending: 'Deleting private call...',
        success: 'Private call deleted!',
        error: 'Error deleting private call',
      });
      return promise;
    },
    onSettled() {
      privateCallsQuery.refetch();
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
