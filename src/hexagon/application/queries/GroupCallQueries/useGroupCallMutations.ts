import type {
  BaseGroupSession,
  CreateGroupSessionCommand,
  DeleteGroupSessionCommand,
  FurnishedWeekWithCoach,
  UpdateGroupSessionCommand,
} from '@learncraft-spanish/shared';
import type { UseMutationResult } from '@tanstack/react-query';
import { useGroupCallsAdapter } from '@application/adapters/groupCallsAdapter';
import {
  insertIntoMatchingRecentRecordsOrInvalidate,
  invalidateMembershipWeeks,
  removeGroupCallFromRecentRecords,
  replaceGroupCallInRecentRecords,
} from '@application/queries/coachingRecordsCache';
import { weekAttendsGroupSession } from '@domain/functions/weekAttendsGroupSession';
import { useMutation, useQueryClient } from '@tanstack/react-query';
const WEEKS_QUERY_KEY = ['weeklyRecords', 'weeksByStartDate'];

export interface UseGroupCallMutationsReturn {
  createGroupCallMutation: UseMutationResult<
    BaseGroupSession,
    Error,
    CreateGroupSessionCommand
  >;
  updateGroupCallMutation: UseMutationResult<
    BaseGroupSession,
    Error,
    UpdateGroupSessionCommand
  >;
  deleteGroupCallMutation: UseMutationResult<
    void,
    Error,
    DeleteGroupSessionCommand
  >;
}

export function useGroupCallMutations(): UseGroupCallMutationsReturn {
  const { createGroupCall, updateGroupCall, deleteGroupCall } =
    useGroupCallsAdapter();
  const queryClient = useQueryClient();

  const createGroupCallMutation = useMutation({
    mutationFn: (groupCall: CreateGroupSessionCommand) =>
      createGroupCall(groupCall),
    onSuccess: (newGroupCall) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            if (
              !weekAttendsGroupSession({
                groupSession: newGroupCall,
                weekId: week.weekId,
              })
            ) {
              return week;
            }
            if (
              week.groupCalls.some(
                (call) => call.groupSessionId === newGroupCall.groupSessionId,
              )
            ) {
              return week;
            }
            return {
              ...week,
              groupCalls: [...week.groupCalls, newGroupCall],
            };
          });
        },
      );
      insertIntoMatchingRecentRecordsOrInvalidate(queryClient, {
        coachId: newGroupCall.coach.coach_id,
        callDate: newGroupCall.callDate,
        insert: (old) => ({
          ...old,
          groupCalls: [...old.groupCalls, newGroupCall],
        }),
      });
      invalidateMembershipWeeks(queryClient);
    },
  });

  const updateGroupCallMutation = useMutation({
    mutationFn: (groupCall: UpdateGroupSessionCommand) =>
      updateGroupCall(groupCall),
    onSuccess: (updatedGroupCall) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => {
            const withoutOldGroupCall = week.groupCalls.filter(
              (call) => call.groupSessionId !== updatedGroupCall.groupSessionId,
            );
            if (
              weekAttendsGroupSession({
                groupSession: updatedGroupCall,
                weekId: week.weekId,
              })
            ) {
              return {
                ...week,
                groupCalls: [...withoutOldGroupCall, updatedGroupCall],
              };
            }
            if (withoutOldGroupCall.length !== week.groupCalls.length) {
              return {
                ...week,
                groupCalls: withoutOldGroupCall,
              };
            }
            return week;
          });
        },
      );
      replaceGroupCallInRecentRecords(queryClient, updatedGroupCall);
      invalidateMembershipWeeks(queryClient);
    },
  });

  const deleteGroupCallMutation = useMutation({
    mutationFn: (data: DeleteGroupSessionCommand) => deleteGroupCall(data),
    onSuccess: (_, { groupSessionId }) => {
      queryClient.setQueriesData<FurnishedWeekWithCoach[]>(
        { queryKey: WEEKS_QUERY_KEY },
        (weeks) => {
          if (!weeks) return weeks;
          return weeks.map((week) => ({
            ...week,
            groupCalls: week.groupCalls.filter(
              (call) => call.groupSessionId !== groupSessionId,
            ),
          }));
        },
      );
      removeGroupCallFromRecentRecords(queryClient, groupSessionId);
      invalidateMembershipWeeks(queryClient);
    },
  });

  return {
    createGroupCallMutation,
    updateGroupCallMutation,
    deleteGroupCallMutation,
  };
}
