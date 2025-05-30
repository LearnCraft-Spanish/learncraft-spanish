import useActiveMembershipsReport from 'src/hooks/AdminData/useActiveMembershipsReport';
import useAssignmentsCompletedByWeek from 'src/hooks/AdminData/useAssignmentsCompletedByWeek';
import useDropoutsByLevelReport from 'src/hooks/AdminData/useDropoutsByLevelReport';
import useGroupCallsByCoach from 'src/hooks/AdminData/useGroupCallsByCoach';
import useLastWeekCoachSummary from 'src/hooks/AdminData/useLastWeekCoachSummary';
import usePrivateCallsByCoach from 'src/hooks/AdminData/usePrivateCallsByCoach';
import useRecentLesson200Students from 'src/hooks/AdminData/useRecentLesson200Students';
import useWeeklyCoachSummary from 'src/hooks/AdminData/useWeeklyCoachSummary';

export default function useAdminDashboard() {
  const { weeklyCoachSummaryQuery } = useWeeklyCoachSummary();
  const { lastWeekCoachSummaryQuery } = useLastWeekCoachSummary();
  const { privateCallsByCoachQuery } = usePrivateCallsByCoach();
  const { groupCallsByCoachQuery } = useGroupCallsByCoach();
  const { activeMembershipsReportQuery } = useActiveMembershipsReport();
  const { dropoutsByLevelReportQuery } = useDropoutsByLevelReport();
  const { assignmentsCompletedByWeekQuery } = useAssignmentsCompletedByWeek();
  const { recentLesson200StudentsQuery } = useRecentLesson200Students();
  const isLoading =
    weeklyCoachSummaryQuery.isLoading ||
    lastWeekCoachSummaryQuery.isLoading ||
    privateCallsByCoachQuery.isLoading ||
    groupCallsByCoachQuery.isLoading ||
    activeMembershipsReportQuery.isLoading ||
    dropoutsByLevelReportQuery.isLoading ||
    assignmentsCompletedByWeekQuery.isLoading ||
    recentLesson200StudentsQuery.isLoading;

  const isError =
    weeklyCoachSummaryQuery.isError ||
    lastWeekCoachSummaryQuery.isError ||
    privateCallsByCoachQuery.isError ||
    groupCallsByCoachQuery.isError ||
    activeMembershipsReportQuery.isError ||
    dropoutsByLevelReportQuery.isError ||
    assignmentsCompletedByWeekQuery.isError ||
    recentLesson200StudentsQuery.isError;

  const isSuccess =
    weeklyCoachSummaryQuery.isSuccess &&
    lastWeekCoachSummaryQuery.isSuccess &&
    privateCallsByCoachQuery.isSuccess &&
    groupCallsByCoachQuery.isSuccess &&
    activeMembershipsReportQuery.isSuccess &&
    dropoutsByLevelReportQuery.isSuccess &&
    assignmentsCompletedByWeekQuery.isSuccess &&
    recentLesson200StudentsQuery.isSuccess;

  return {
    isLoading,
    isError,
    isSuccess,
  };
}
