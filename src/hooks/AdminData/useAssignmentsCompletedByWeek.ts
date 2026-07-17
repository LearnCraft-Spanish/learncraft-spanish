import { useAssignmentsCompletedByWeekReportQuery } from '@application/queries/AdminReportQueries/useAssignmentsCompletedByWeekReportQuery';

export default function useAssignmentsCompletedByWeek() {
  const { assignmentsCompletedByWeekReportQuery } =
    useAssignmentsCompletedByWeekReportQuery();

  return {
    assignmentsCompletedByWeekQuery: assignmentsCompletedByWeekReportQuery,
  };
}
