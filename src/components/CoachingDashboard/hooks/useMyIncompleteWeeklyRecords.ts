import type { Coach, QbUser, WeekWithRelations } from 'src/types/CoachingTypes';
import { useCallback, useMemo } from 'react';

import useCoaching from 'src/hooks/CoachingData/useCoaching';

export default function useMyIncompleteWeeklyRecords({
  coach,
}: {
  coach: Coach | null | undefined;
}) {
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
        // Foreign Key lookup, form data in backend?
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
          // Foreign Key lookup, form data in backend
          assignments: getAssignmentsFromWeekRecordId(week.recordId) || [],
          // Foreign Key lookup, form data in backend
          privateCalls: getPrivateCallsFromWeekRecordId(week.recordId) || [],
          // Foreign Key lookup, form data in backend
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

  const myIncompleteWeeklyRecords = useMemo(() => {
    if (!coach) return undefined;
    const records = getMyIncompleteWeeklyRecords(coach?.user);
    return records;
  }, [getMyIncompleteWeeklyRecords, coach]);

  // Calculate startDate using logic from DateRangeProvider
  const startDate = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    // Generate dates array similar to dateRange
    const dates = Array.from({ length: 2 }, (_, i) => {
      const msOffset = i * weekInMs;
      const date = new Date(now.getTime() - dayOfWeek * 86400000 - msOffset);
      return {
        date: date.toISOString().split('T')[0],
      };
    });

    // Use this week's date if day >= 3 (Wednesday-Saturday), otherwise use last week's date
    return dayOfWeek >= 3 ? dates[0].date : dates[1].date;
  }, []);

  return {
    myIncompleteWeeklyRecords,
    startDate,
    states: { isLoading, isError, isSuccess },
  };
}
