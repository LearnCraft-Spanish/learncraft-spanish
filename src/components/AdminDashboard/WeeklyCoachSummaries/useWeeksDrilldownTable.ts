import type { WeeksDrilldownReportName } from '@application/ports/AdminReports/adminReportsPort';
import useReportWeeksDrilldown from 'src/hooks/AdminData/useReportWeeksDrilldown';

export default function useWeeksDrilldownTable(
  coachId: string,
  report: WeeksDrilldownReportName,
) {
  const { reportWeeksDrilldownQuery } = useReportWeeksDrilldown(
    coachId,
    report,
  );
  const { data, isLoading, isError, isSuccess } = reportWeeksDrilldownQuery;
  return {
    data,
    isLoading,
    isError,
    isSuccess,
  };
}
