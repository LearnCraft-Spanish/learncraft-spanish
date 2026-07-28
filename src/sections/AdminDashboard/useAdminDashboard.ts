import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
import usePrivateCallsByCoach from 'src/hooks/AdminData/usePrivateCallsByCoach';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';

export default function useAdminDashboard() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();
  const { privateCallsByCoachQuery } = usePrivateCallsByCoach();

  const isLoading =
    weeklyCoachSummaryQuery.isLoading ||
    lastWeekCoachSummaryQuery.isLoading ||
    privateCallsByCoachQuery.isLoading;

  const isError =
    weeklyCoachSummaryQuery.isError ||
    lastWeekCoachSummaryQuery.isError ||
    privateCallsByCoachQuery.isError;

  const isSuccess =
    weeklyCoachSummaryQuery.isSuccess && lastWeekCoachSummaryQuery.isSuccess;

  return {
    isLoading,
    isError,
    isSuccess,
  };
}
