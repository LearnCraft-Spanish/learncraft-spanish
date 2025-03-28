import { useMemo } from 'react';
import useActiveCoach from './hooks/useActiveCoach';
import useMyIncompleteWeeklyRecords from './hooks/useMyIncompleteWeeklyRecords';
import useMyRecentRecords from './hooks/useMyRecentRecords';
export default function useCoachingDashboard() {
  const {
    states: {
      isLoading: isLoadingActiveCoach,
      isError: isErrorActiveCoach,
      isSuccess: isSuccessActiveCoach,
    },
    coach,
  } = useActiveCoach();

  const {
    getMyIncompleteWeeklyRecords,
    states: {
      isLoading: isLoadingRecords,
      isError: isErrorRecords,
      isSuccess: isSuccessRecords,
    },
  } = useMyIncompleteWeeklyRecords();

  const {
    myRecentRecordsQuery,
    states: {
      isLoading: isLoadingRecentRecords,
      isError: isErrorRecentRecords,
      isSuccess: isSuccessRecentRecords,
    },
  } = useMyRecentRecords({ coach: coach?.user });

  const myIncompleteWeeklyRecords = useMemo(() => {
    if (!isSuccessActiveCoach || !isSuccessRecords || !coach) return undefined;
    const records = getMyIncompleteWeeklyRecords(coach?.user);
    return records;
  }, [
    isSuccessActiveCoach,
    isSuccessRecords,
    getMyIncompleteWeeklyRecords,
    coach,
  ]);

  return {
    states: {
      isLoading:
        isLoadingActiveCoach || isLoadingRecords || isLoadingRecentRecords,
      isError: isErrorActiveCoach || isErrorRecords || isErrorRecentRecords,
      isSuccess:
        isSuccessActiveCoach &&
        isSuccessRecords &&
        isSuccessRecentRecords &&
        myIncompleteWeeklyRecords !== undefined,
    },
    coach,
    myIncompleteWeeklyRecords,
    recentRecords: myRecentRecordsQuery.data,
  };
}
