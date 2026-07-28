import useActiveMembershipsReport from 'src/hooks/AdminData/useActiveMembershipsReport';
import useGroupCallsByCoach from 'src/hooks/AdminData/useGroupCallsByCoach';
import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
import usePrivateCallsByCoach from 'src/hooks/AdminData/usePrivateCallsByCoach';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';

export default function useAdminDashboard() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();
  const { privateCallsByCoachQuery } = usePrivateCallsByCoach();
  const { groupCallsByCoachQuery } = useGroupCallsByCoach();
  const { activeMembershipsReportQuery } = useActiveMembershipsReport();

  const isLoading =
    weeklyCoachSummaryQuery.isLoading ||
    lastWeekCoachSummaryQuery.isLoading ||
    privateCallsByCoachQuery.isLoading ||
    groupCallsByCoachQuery.isLoading ||
    activeMembershipsReportQuery.isLoading;

  const isError =
    weeklyCoachSummaryQuery.isError ||
    lastWeekCoachSummaryQuery.isError ||
    privateCallsByCoachQuery.isError ||
    groupCallsByCoachQuery.isError ||
    activeMembershipsReportQuery.isError;

  const isSuccess =
    weeklyCoachSummaryQuery.isSuccess &&
    lastWeekCoachSummaryQuery.isSuccess &&
    privateCallsByCoachQuery.isSuccess &&
    groupCallsByCoachQuery.isSuccess &&
    activeMembershipsReportQuery.isSuccess;

  return {
    isLoading,
    isError,
    isSuccess,
  };
}
