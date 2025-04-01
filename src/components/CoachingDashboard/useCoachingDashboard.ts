import { useMemo } from 'react';
import useActiveCoach from './hooks/useActiveCoach';
import useMyIncompleteWeeklyRecords from './hooks/useMyIncompleteWeeklyRecords';
import useMyRecentRecords from './hooks/useMyRecentRecords';
export default function useCoachingDashboard() {
  const { coach } = useActiveCoach();

  const {
    getMyIncompleteWeeklyRecords,
    states: incompleteWeeklyRecordsStates,
  } = useMyIncompleteWeeklyRecords();

  const isLoading = incompleteWeeklyRecordsStates.isLoading;
  const isError = incompleteWeeklyRecordsStates.isError || coach === undefined;
  const isSuccess =
    incompleteWeeklyRecordsStates.isSuccess && coach !== undefined;

  const myIncompleteWeeklyRecords = useMemo(() => {
    if (!coach) return undefined;
    const records = getMyIncompleteWeeklyRecords(coach?.user);
    return records;
  }, [getMyIncompleteWeeklyRecords, coach]);

  return {
    coach,
    myIncompleteWeeklyRecords,
    states: { isLoading, isError, isSuccess },
  };
}
