import type {
  BasePrivateCall,
  CreatePrivateCallCommand,
  DeletePrivateCallCommand,
  FurnishedWeekWithCoach,
  UpdatePrivateCallCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { usePrivateCallsAdapter } from '@application/adapters/privateCallsAdapter';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const WEEKS_QUERY_KEY = ['weeklyRecords', 'weeksByStartDate'];

export interface UsePrivateCallMutationsReturn {
  createPrivateCallMutation: UseMutationResult<
    BasePrivateCall,
    Error,
    CreatePrivateCallCommand
  >;
  updatePrivateCallMutation: UseMutationResult<
    BasePrivateCall,
    Error,
    UpdatePrivateCallCommand
  >;
  deletePrivateCallMutation: UseMutationResult<
    void,
    Error,
    DeletePrivateCallCommand
  >;
}
export function usePrivateCallMutations(): UsePrivateCallMutationsReturn {
  const { createPrivateCall, updatePrivateCall, deletePrivateCall } =
    usePrivateCallsAdapter();
  const queryClient = useQueryClient();

  const createPrivateCallMutation = useMutation({
    mutationFn: (privateCall: CreatePrivateCallCommand) =>
      createPrivateCall(privateCall),
    onSuccess: (newPrivateCall) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            if (week.weekId !== newPrivateCall.weekId) return week;
            return {
              ...week,
              privateCalls: [...week.privateCalls, newPrivateCall],
            };
          });
        },
      );
    },
  });
  const updatePrivateCallMutation = useMutation({
    mutationFn: (privateCall: UpdatePrivateCallCommand) =>
      updatePrivateCall(privateCall),
    onSuccess: (updatedPrivateCall) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            if (week.weekId !== updatedPrivateCall.weekId) return week;
            return {
              ...week,
              privateCalls: week.privateCalls.map((call) =>
                call.callId === updatedPrivateCall.callId
                  ? updatedPrivateCall
                  : call,
              ),
            };
          });
        },
      );
    },
  });
  const deletePrivateCallMutation = useMutation({
    mutationFn: (data: DeletePrivateCallCommand) => deletePrivateCall(data),
    onSuccess: (_, { callId }) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => ({
            ...week,
            privateCalls: week.privateCalls.filter(
              (call) => call.callId !== callId,
            ),
          }));
        },
      );
    },
  });

  return {
    createPrivateCallMutation,
    updatePrivateCallMutation,
    deletePrivateCallMutation,
  };
}
