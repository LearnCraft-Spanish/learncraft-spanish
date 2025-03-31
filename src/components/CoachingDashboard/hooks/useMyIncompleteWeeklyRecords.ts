import type { QbUser, WeekWithRelations } from 'src/types/CoachingTypes';
import { useCallback } from 'react';

import useCoaching from 'src/hooks/CoachingData/useCoaching';

export default function useMyIncompleteWeeklyRecords() {
  const {
    weeksQuery,
    getAssignmentsFromWeekRecordId,
    getPrivateCallsFromWeekRecordId,
    getCoachFromMembershipId,
    getGroupSessionsAndAttendeesForWeek,
  } = useCoaching();

  const isLoading = weeksQuery.isLoading;
  const isError = weeksQuery.isError;
  const isSuccess = weeksQuery.isSuccess;

  const getMyIncompleteWeeklyRecords = useCallback(
    (user: QbUser) => {
      if (!weeksQuery.data) return undefined;

      // First filter for incomplete records
      const incompleteWeeks = weeksQuery.data.filter(
        (week) => !week.recordsComplete,
      );

      // Then filter for records belonging to the current coach
      const myWeeks = incompleteWeeks.filter((week) => {
        const weekCoach = getCoachFromMembershipId(week.relatedMembership);
        return weekCoach?.user.email === user.email;
      });

      // Filter out hold weeks
      const nonHoldWeeks = myWeeks.filter((week) => !week.holdWeek);

      // Filter out one month challenge weeks
      const nonOneMonthChallengeWeeks = nonHoldWeeks.filter(
        (week) => week.level !== '1-Month Challenge',
      );

      // Transform into WeekWithRelations by adding related data
      const weeksWithRelations: WeekWithRelations[] =
        nonOneMonthChallengeWeeks.map((week) => ({
          ...week,
          assignments: getAssignmentsFromWeekRecordId(week.recordId) || [],
          privateCalls: getPrivateCallsFromWeekRecordId(week.recordId) || [],
          groupSessions:
            getGroupSessionsAndAttendeesForWeek(week.recordId) || [],
        }));

      if (weeksWithRelations.length === 0) return null;

      return weeksWithRelations;
    },
    [
      weeksQuery.data,
      getAssignmentsFromWeekRecordId,
      getPrivateCallsFromWeekRecordId,
      getGroupSessionsAndAttendeesForWeek,
      getCoachFromMembershipId,
    ],
  );

  return {
    getMyIncompleteWeeklyRecords,
    states: { isLoading, isError, isSuccess },
  };
}
