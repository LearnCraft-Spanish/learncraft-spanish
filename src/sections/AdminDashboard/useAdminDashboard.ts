import useActiveMembershipsReport from 'src/hooks/AdminData/useActiveMembershipsReport';
import useDropoutsByLevelReport from 'src/hooks/AdminData/useDropoutsByLevelReport';
import useGroupCallsByCoach from 'src/hooks/AdminData/useGroupCallsByCoach';
import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
import usePrivateCallsByCoach from 'src/hooks/AdminData/usePrivateCallsByCoach';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';
import useWeeklyTimeCommitmentByCoach from 'src/hooks/AdminData/useWeeklyTimeCommitmentByCoach';

export default function useAdminDashboard() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();
  const { privateCallsByCoachQuery } = usePrivateCallsByCoach();
  const { groupCallsByCoachQuery } = useGroupCallsByCoach();
  const { activeMembershipsReportQuery } = useActiveMembershipsReport();
  const { dropoutsByLevelReportQuery } = useDropoutsByLevelReport();
  const { weeklyTimeCommitmentByCoachReportQuery } =
    useWeeklyTimeCommitmentByCoach();

  const isLoading =
    weeklyCoachSummaryQuery.isLoading ||
    lastWeekCoachSummaryQuery.isLoading ||
    privateCallsByCoachQuery.isLoading ||
    groupCallsByCoachQuery.isLoading ||
    activeMembershipsReportQuery.isLoading ||
    dropoutsByLevelReportQuery.isLoading ||
    weeklyTimeCommitmentByCoachReportQuery.isLoading;

  const isError =
    weeklyCoachSummaryQuery.isError ||
    lastWeekCoachSummaryQuery.isError ||
    privateCallsByCoachQuery.isError ||
    groupCallsByCoachQuery.isError ||
    activeMembershipsReportQuery.isError ||
    dropoutsByLevelReportQuery.isError ||
    weeklyTimeCommitmentByCoachReportQuery.isError;

  const isSuccess =
    weeklyCoachSummaryQuery.isSuccess &&
    lastWeekCoachSummaryQuery.isSuccess &&
    privateCallsByCoachQuery.isSuccess &&
    groupCallsByCoachQuery.isSuccess &&
    activeMembershipsReportQuery.isSuccess &&
    dropoutsByLevelReportQuery.isSuccess &&
    weeklyTimeCommitmentByCoachReportQuery.isSuccess;

  return {
    isLoading,
    isError,
    isSuccess,
  };
}
