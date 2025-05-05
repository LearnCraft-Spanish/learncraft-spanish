import type { CoachSummaryDrilldownData } from 'src/components/AdminDashboard/WeeklyCoachSummaries/types';
import { useQuery } from '@tanstack/react-query';
import { useBackendHelpers } from '../useBackend';

export default function useReportWeeksDrilldown(
  coachId: string,
  report: string,
) {
  const { getFactory } = useBackendHelpers();

  const getReportWeeksDrilldown = async (coachId: string, report: string) => {
    const formattedCoachId = coachId.replace(' ', '+');
    const formattedReportName = report.replace(' ', '+');
    return getFactory<CoachSummaryDrilldownData[]>(
      `admin/weeks-report-drilldown?coachId=${formattedCoachId}&report=${formattedReportName}`,
    );
  };

  const reportWeeksDrilldownQuery = useQuery({
    queryKey: ['weeks-report-drilldown', coachId, report],
    queryFn: () => getReportWeeksDrilldown(coachId, report),
    staleTime: Infinity,
  });

  return {
    reportWeeksDrilldownQuery,
  };
}
