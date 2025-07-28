import type { PrivateCall } from 'src/types/CoachingTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'react-toastify';
import { useContextualMenu } from 'src/hooks/useContextualMenu';
import { useBackendHelpers } from '../../useBackend';
import { useUserData } from '../../UserData/useUserData';
import useStudentRecordsBackend from './StudentRecordsBackendFunctions';

export default function usePrivateCalls(
  startDate: string | undefined,
  endDate: string | undefined,
) {
  const userDataQuery = useUserData();
  const { getPrivateCalls } = useStudentRecordsBackend();
  const queryClient = useQueryClient();
  const { newPostFactory, newPutFactory, newDeleteFactory } =
    useBackendHelpers();
  const { openContextual } = useContextualMenu();
  const privateCallsQuery = useQuery({
    queryKey: ['privateCalls', { startDate, endDate }],
    queryFn: getPrivateCalls,
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
      const promise = newPostFactory<PrivateCall>({
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
    onSuccess(result: PrivateCall, _variables, _context) {
      const queryKey = ['privateCalls', { startDate, endDate }];
      privateCallsQuery.refetch();
      queryClient.setQueryData(queryKey, (oldData: PrivateCall[]) => {
        if (!oldData) {
          return [result];
        }
        // Create a deep copy of the old data and add the new assignment
        const oldDataCopy = JSON.parse(JSON.stringify(oldData));
        return [...oldDataCopy, { ...result }]; // Add the single result object
      });
      // open correct contextual for new record
      setTimeout(() => {
        openContextual(`call${result.recordId}`);
      }, 200);
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
      const promise = newPutFactory<PrivateCall>({
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
    onSuccess(result: PrivateCall, _variables, _context) {
      // Update the cache with the updated private call
      const queryKey = ['privateCalls', { startDate, endDate }];

      queryClient.setQueryData(
        queryKey,
        (oldData: PrivateCall[] | undefined) => {
          if (!oldData) {
            return [result];
          }
          // Create a deep copy of the old data and add the updated private call
          const oldDataCopy = JSON.parse(JSON.stringify(oldData));
          return oldDataCopy.map((item: PrivateCall) =>
            item.recordId === result.recordId ? result : item,
          );
        },
      );
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
