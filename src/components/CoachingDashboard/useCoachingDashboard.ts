import useActiveCoach from './hooks/useActiveCoach';
import useMyIncompleteWeeklyRecords from './hooks/useMyIncompleteWeeklyRecords';
export default function useCoachingDashboard() {
  const { coach } = useActiveCoach();
  const { states } = useMyIncompleteWeeklyRecords({
    coach,
  });

  const isLoading = states.isLoading;
  const isError = states.isError || coach === undefined;
  const isSuccess = states.isSuccess && coach !== undefined;

  return {
    coach,
    states: { isLoading, isError, isSuccess },
  };
}
