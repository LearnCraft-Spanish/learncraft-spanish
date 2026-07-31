import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';

export default function useAdminDashboard() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();

  const isLoading =
    weeklyCoachSummaryQuery.isLoading || lastWeekCoachSummaryQuery.isLoading;

  const isError =
    weeklyCoachSummaryQuery.isError || lastWeekCoachSummaryQuery.isError;

  const isSuccess =
    weeklyCoachSummaryQuery.isSuccess && lastWeekCoachSummaryQuery.isSuccess;

  return {
    isLoading,
    isError,
    isSuccess,
  };
}
